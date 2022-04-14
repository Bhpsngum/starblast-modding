'use strict';

const StructureManager = require("./StructureManager.js");
const StationManager = require("./StationManager.js");
const Team = require("../structures/Team.js");
const getEntity = require("../utils/getEntity.js");
const defineProperties = require("../utils/defineProperties.js");

/**
 * The Team Manager Instance.
 * @extends {StructureManager}
 * @abstract
 */

class TeamManager extends StructureManager {
  constructor(game, api) {
    super(game, api);
    this.#game = game;
    this.#api = api;

    /**
     * The Station Manager object.
     * @name TeamManager.prototype.stations
     * @type {StationManager}
     * @readonly
     */

    defineProperties(this, {stations: new StationManager(this.#game, this.#api)});
  }

  #game;
  #api;

  insert (...data) {
    for (let option of data) {
      let p = this.isInstance(option) ? option : this.create(option);
      this.all._UUIDset(p);
      this.stations.insert(Object.assign({}, option.station, {id: option.id, name: option.base_name}))
    }
    this.update()
  }

  socketUpdate (dataView) {
    let size = Math.round(dataView.byteLength/this.all.length);
    for (let i = 0; i < this.all.length; i++) {
      let team = getEntity(this.#game, {id: i}, this), station = getEntity(this.#game, {id: i}, this.stations), index = i * size;
      team.updateInfo({
        open: dataView.getUint8(index) > 0
      });
      station.updateInfo({
        level: dataView.getUint8(index + 1) + 1,
        crystals: dataView.getUint32(index + 2, true),
        modules_shield: new DataView(dataView.buffer.slice(index + 7, index + size))
      });
      if (team.isActive() && !station.isActive()) team.markAsInactive();
    }
    this.update()
  }

  update () {
    this.stations.update();
    this.filterList().clear();
    this.all.forEach(team => team.isActive() && this._UUIDset(team));
    return this
  }

  get limit () {
    return this.#game.options.friendly_colors
  }

  [Symbol.toStringTag] = 'TeamManager'
}

defineProperties(TeamManager.prototype, {
  manager_name: "team",
  StructureConstructor: Team
});

module.exports = TeamManager

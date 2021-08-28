'use strict';

const StructureManager = require("./StructureManager.js");
const StationManager = require("./StationManager.js");
const Team = require("../structures/Team.js");
const getEntity = require("../utils/getEntity.js");
const defineProperties = require("../utils/defineProperties.js");

class TeamManager extends StructureManager {
  constructor(game) {
    super(game);
    defineProperties(this, {stations: new StationManager(this.game)});
  }

  insert (...data) {
    for (let option of data) {
      let p = this.isInstance(option) ? option : this.create(option);
      this.all.push(p);
      this.stations.insert(Object.assign({}, option.station, {id: option.id, name: option.base_name}))
    }
    this.update()
  }

  socketUpdate (dataView) {
    let size = Math.round(dataView.byteLength/this.all.length);
    for (let i = 0; i < this.all.length; i++) {
      let team = getEntity({id: i}, this), station = getEntity({id: i}, this.stations), index = i * size;
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
    this.filterList().splice(0);
    this.push(...this.all.filter(team => team.isActive()));
    return this
  }
}

defineProperties(TeamManager.prototype, {
  manager_name: "team",
  StructureConstructor: Team
});

module.exports = TeamManager

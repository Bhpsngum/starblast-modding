'use strict';

const StructureManager = require("./StructureManager.js");
const StationModule = require("../structures/StationModule.js");
const getEntity = require("../utils/getEntity.js");
const defineProperties = require("../utils/defineProperties.js");
const limits = [6, 12, 18, 36, 48];

class StationModuleManager extends StructureManager {
  constructor(game, parent) {
    super(game);
    this.#game = game;
    defineProperties(this, {parent})
  }

  #game;

  update () {
    this.clear();
    this.filterList().all.forEach(modul => modul.isActive() && this._UUIDset(modul));
    return this
  }

  updateShield (shield) {
    if (shield) {
      let i = 0;
      try {
        while (true) getEntity(this.#game, {id: i}, this, this.parent).updateShield(shield.getUint8(i++))
      }
      catch (e) {}
    }
    this.update()
  }

  get limit () {
    return limits[this.#game.options.station_size - 1] || limits[1]
  }

  [Symbol.toStringTag] = 'StationModuleManager'
}

defineProperties(StationModuleManager.prototype, {
  manager_name: "station_module",
  StructureConstructor: StationModule
});

module.exports = StationModuleManager

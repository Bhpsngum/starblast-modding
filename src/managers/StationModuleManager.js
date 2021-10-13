'use strict';

const StructureManager = require("./StructureManager.js");
const StationModule = require("../structures/StationModule.js");
const getEntity = require("../utils/getEntity.js");
const defineProperties = require("../utils/defineProperties.js");

class StationModuleManager extends StructureManager {
  constructor(game, parent) {
    super(game);
    defineProperties(this, {parent})
  }

  update () {
    this.clear();
    this.filterList().all.forEach(modul => modul.isActive() && modul.isAlive() && (modul.step(), this._MapSet(modul.uuid, modul)));
    return this
  }

  updateShield (shield) {
    if (shield) this.all.forEach((modul, i) => getEntity({id: i}, this, this.parent).updateShield(shield.getUint8(i)));
    this.update()
  }

  [Symbol.toStringTag] = 'StationModuleManager'
}

defineProperties(StationModuleManager.prototype, {
  manager_name: "station_module",
  StructureConstructor: StationModule
});

module.exports = StationModuleManager

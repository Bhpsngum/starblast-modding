'use strict';

const StructureManager = require("./StructureManager.js");
const StationModule = require("../structures/StationModule.js");
const getEntity = require("../utils/getEntity.js");

class StationModuleManager extends StructureManager {
  constructor(game) {
    super(game)
  }

  create (data, parent) {
    return new this.EntityConstructor(this.game, data, parent)
  }

  update () {
    let x = this.all.splice(0).filter(entity => this.isInstance(entity));
    this.all.push(...x);
    this.all.forEach(modul => modul.isActive() && modul.step());
    this.splice(0);
    this.push(...this.all.filter(modul => modul.isActive()))
  }

  updateShield (shield) {
    if (shield) for (let i = 0; i < this.all.length; i++) getEntity({id: i}, this, false, this.parent).updateShield(shield.getUint8(i));
    this.update()
  }
}

Object.defineProperties(StationModuleManager.prototype, {
  manager_name: {value: "station_module"},
  EntityConstructor: {value: StationModule}
});

module.exports = StationModuleManager

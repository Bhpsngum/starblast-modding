'use strict';

const StructureManager = require("./StructureManager.js");
const StationModule = require("../structures/StationModule.js");
const getEntity = require("../utils/getEntity.js");
const defineProperties = require("../utils/defineProperties.js");

class StationModuleManager extends StructureManager {
  constructor(game) {
    super(game)
  }

  create (data, parent) {
    return new this.StructureConstructor(this.game, data, parent)
  }

  update () {
    let x = this.all.splice(0).filter(entity => this.isInstance(entity));
    this.all.push(...x);
    this.all.forEach(modul => modul.isActive() && modul.isAlive() && modul.step());
    this.splice(0);
    this.push(...this.all.filter(modul => modul.isActive()));
    return this
  }

  updateShield (shield) {
    if (shield) for (let i = 0; i < this.all.length; i++) getEntity({id: i}, this, this.parent).updateShield(shield.getUint8(i));
    this.update()
  }
}

defineProperties(StationModuleManager.prototype, {
  manager_name: "station_module",
  StructureConstructor: StationModule
});

module.exports = StationModuleManager

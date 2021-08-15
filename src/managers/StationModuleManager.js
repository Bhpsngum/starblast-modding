'use strict';

const StructureManager = require("./StructureManager.js");
const StationModule = require("../structures/StationModule.js");

class StationModuleManager extends StructureManager {
  constructor(game) {
    super(game)
  }

  create (parent, data) {
    return new this.EntityConstructor(this.game, parent, data)
  }

  update () {
    let x = this.all.splice(0).filter(entity => this.isInstance(entity));
    this.all.push(...x);
    this.splice(0);
    this.push(...this.all)
  }
}

Object.defineProperties(StationModuleManager.prototype, {
  manager_name: {value: "station_module"},
  EntityConstructor: {value: StationModule}
});

module.exports = StationModuleManager

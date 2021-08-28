'use strict';

const StructureManager = require("./StructureManager.js");
const Station = require("../structures/Station.js");
const defineProperties = require("../utils/defineProperties.js");

class StationManager extends StructureManager {
  constructor (game) {
    super(game)
  }

  update () {
    this.filterList().all.forEach(station => station.isActive() && station.update());
    this.splice(0);
    this.push(...this.all.filter(station => station.isActive()));
    return this
  }
}

defineProperties(StationManager.prototype, {
  manager_name: "station",
  StructureConstructor: Station
});

module.exports = StationManager;

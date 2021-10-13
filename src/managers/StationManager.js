'use strict';

const StructureManager = require("./StructureManager.js");
const Station = require("../structures/Station.js");
const defineProperties = require("../utils/defineProperties.js");

class StationManager extends StructureManager {
  constructor (game) {
    super(game)
  }

  update () {
    this.clear();
    this.filterList().all.forEach(station => station.isActive() && (station.update(), this._MapSet(station.uuid, station)));
    return this
  }

  [Symbol.toStringTag] = 'StationManager'
}

defineProperties(StationManager.prototype, {
  manager_name: "station",
  StructureConstructor: Station
});

module.exports = StationManager;

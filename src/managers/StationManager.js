'use strict';

const StructureManager = require("./StructureManager.js");
const Station = require("../structures/Station.js");

class StationManager extends StructureManager {
  constructor (game) {
    super(game)
  }

  update () {
    let x = this.all.splice(0).filter(station => this.isInstance(station));
    this.all.push(...x);
    this.all.forEach(station => station.isActive() && station.update());
    this.splice(0);
    this.push(...this.all.filter(station => station.isActive()))
  }
}

Object.defineProperties(StationManager.prototype, {
  manager_name: {value: "station"},
  StructureConstructor: {value: Station}
});

module.exports = StationManager;
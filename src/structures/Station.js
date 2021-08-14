'use strict';

const Structure = require("./Structure.js");
const StationModule = require("./StationModule.js");

class Station extends Structure {
  constructor(game, options) {
    super(game);
    options = Object.assign({}, options);
    this.modules = (Array.isArray(options.modules) ? options.modules : []).map(modul => new StationModule(game, this, modul));
    this.phase = options.phase;
    this.updateInfo({
      level: 1,
      crystals: 0,
      open: true
    })
  }

  updateInfo (data) {
    data = Object.assign({}, data);
    this.open = data.open;
    this.level = data.level;
    this.crystals = data.crystals;
    this.crystals_max = this.game.options.crystal_capacity[this.level - 1]
  }
}

module.exports = Station

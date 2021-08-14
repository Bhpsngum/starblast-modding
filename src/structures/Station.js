'use strict';

const Structure = require("./Structure.js");
const StationModule = require("./StationModule.js");

class Station extends Structure {
  constructor(game, options) {
    super(game);
    options = Object.assign({}, options);
    this.modules = (Array.isArray(options.modules) ? options.modules : []).map(modul => new StationModule(game, this, modul));
    this.phase = options.phase * 180 / Math.PI;
    this.updateInfo({
      level: 1,
      crystals: 0
    });
    this.step()
  }

  updateInfo (data) {
    data = Object.assign({}, data);
    this.level = data.level;
    this.crystals = data.crystals;
    this.crystals_max = this.game.options.crystal_capacity[this.level - 1]
  }

  step () {
    let phase = (this.phase / 180 + this.game.step / 60 / 3600 % 1 * 2) * Math.PI, radius = this.game.options.map_size * 5 * Math.sqrt(2) / 2;
    this.x = radius * Math.cos(phase);
    this.y = radius * Math.sin(phase)
  }
}

module.exports = Station

'use strict';

const Structure = require("./Structure.js");
const StationModuleManager = require("../managers/StationModuleManager.js");

class Station extends Structure {
  constructor(game, name, options) {
    super(game);
    options = Object.assign({}, options);
    this.name = name;
    let size = Math.trunc(this.game.options.station_size);
    this.size = this.game.options.station_size = isNaN(size) || size < 1 || size > 5 ? 2 : size;
    let modules = new StationModuleManager(this.game);
    (Array.isArray(options.modules) ? options.modules : []).forEach(modul => modules.insert(modules.create(this, modul)));
    this.modules = modules;
    this.phase = options.phase * 180 / Math.PI;
    this.updateInfo({
      level: Math.max(Math.trunc(options.level), 1) || 1,
      crystals: Math.max(options.crystals, 0) || 0
    });
    this.update();
    Object.defineProperty(this, 'spawned', {value: true})
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

  update () {
    this.step();
    this.modules.update()
  }
}

Object.defineProperties(Station.prototype, {
  entity_type: {value: "station"},
  inactive_field: {value: "destroyed"}
});

module.exports = Station

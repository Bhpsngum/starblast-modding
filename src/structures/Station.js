'use strict';

const Structure = require("./Structure.js");
const StationModuleManager = require("../managers/StationModuleManager.js");
const defineProperties = require("../utils/defineProperties.js");

class Station extends Structure {
  constructor(game, options) {
    super(game);
    let size = Math.trunc(this.game.options.station_size), _this = this.modding.data;
    _this.size = isNaN(size) || size < 1 || size > 5 ? 2 : size;
    let modules = new StationModuleManager(this.game);
    (Array.isArray(options?.modules) ? options.modules : []).forEach(modul => modules.insert(modules.create(modul, this)));
    defineProperties(this, {
      name: "string" == typeof options?.name ? options.name : "Unknown",
      id: options?.id,
      team: options?.id,
      modules,
      phase: options?.phase * 180 / Math.PI
    });
    this.markAsSpawned();
    this.updateInfo({
      level: Math.max(Math.trunc(options?.level), 1) || 1,
      crystals: Math.max(options?.crystals, 0) || 0
    });
    this.update()
  }

  updateInfo (data) {
    let _this = this.modding.data;
    _this.level = data?.level;
    _this.crystals = data?.crystals;
    _this.crystals_max = this.game.options.crystal_capacity[_this.level - 1];
    this.modules.updateShield(data?.modules_shield);
    if (this.isActive() && null == this.modules.all.find(modul => modul.isActive() && modul.isAlive())) {
      this.markAsInactive();
      this.modules.all.forEach(modul => modul.isActive() && modul.markAsInactive())
    }
    _this.lastUpdatedStep = this.game.step
  }

  step () {
    let phase = (this.phase / 180 + this.game.step / 60 / 3600 % 1 * 2) * Math.PI, radius = (this.game.modding.data.teams?.stations?.all||[]).length > 1 ? this.game.options.map_size * 5 * Math.sqrt(2) / 2 : 0;
    let _this = this.modding.data;
    _this.x = radius * Math.cos(phase);
    _this.y = radius * Math.sin(phase)
  }

  update () {
    this.step();
    this.modules.update()
  }

  get x () {
    return this.modding.data.x
  }

  get y () {
    return this.modding.data.y
  }

  get size () {
    return this.modding.data.size
  }

  get level () {
    return this.modding.data.level
  }

  get crystals () {
    return this.modding.data.crystals
  }

  get crystals_max () {
    return this.modding.data.crystals_max
  }

  get lastUpdatedStep () {
    return this.modding.data.lastUpdatedStep
  }
}

defineProperties(Station.prototype, {
  structure_type: "station",
  inactive_field: "destroyed"
});

module.exports = Station

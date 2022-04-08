'use strict';

const Entity = require("./Entity.js");
const StationModuleManager = require("../managers/StationModuleManager.js");
const defineProperties = require("../utils/defineProperties.js");
const getAngle = function (phase, step) {
  return (phase / 180 + step / 60 / 3600 % 1 * 2) * Math.PI
}
const getRadius = function (game) {
  return (game.modding.data.teams?.stations?.all||[]).length > 1 ? game.options.map_size * 5 * Math.sqrt(2) / 2 : 0
}

class Station extends Entity {
  constructor(game, options) {
    super(game);
    let size = Math.trunc(this.game.options.station_size), _this = this.modding.data;
    _this.size = isNaN(size) || size < 1 || size > 5 ? 2 : size;
    let modules = new StationModuleManager(this.game, this);
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
  }

  updateInfo (data) {
    let _this = this.modding.data;
    _this.level = data?.level;
    _this.crystals = data?.crystals;
    _this.crystals_max = this.game.options.crystal_capacity[_this.level - 1];
    this.modules.updateShield(data?.modules_shield);
    _this.lastUpdatedStep = this.game.step;
    if (this.isActive() && null == this.modules.array(true).find(modul => modul.isActive() && modul.alive)) {
      this.markAsInactive();
      this.modules.all.forEach(modul => modul.isActive() && modul.markAsInactive());
      this.game.emit(this.game.modding.events.STATION_DESTROYED, this);
    }
  }

  get x () {
    return getRadius(this.game) * Math.cos(getAngle(this.phase, this.lastAliveStep))
  }

  get y () {
    let radius = (this.game.modding.data.teams?.stations?.all||[]).length > 1 ? this.game.options.map_size * 5 * Math.sqrt(2) / 2 : 0;
    return getRadius(this.game) * Math.sin(getAngle(this.phase, this.lastAliveStep))
  }

  get vx () {
    let phase = this.phase, step = this.lastAliveStep;
    return getRadius(this.game) * (Math.cos(getAngle(phase, step + 1)) - Math.cos(getAngle(phase, step)))
  }

  get vy () {
    let phase = this.phase, step = this.lastAliveStep;
    return getRadius(this.game) * (Math.sin(getAngle(phase, step + 1)) - Math.sin(getAngle(phase, step)))
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
}

defineProperties(Station.prototype, {
  structure_type: "station",
  inactive_field: "destroyed"
});

module.exports = Station

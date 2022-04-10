'use strict';

const Entity = require("./Entity.js");
const defineProperties = require("../utils/defineProperties.js");
const typeMap = new Map([
  ["st", "structure"],
  ["d", "deposit"],
  ["sp", "spawning"]
]);
const getAngle = function (_this, step) {
  return Math.atan2(_this._y, _this._x) - (step / 60 / 3600 % 1 * 2) * 3 * Math.PI
}
const getRadius = function (_this) {
  // originally (level + 4), but since we start from lvl1 and the game itself starts from lvl0, so the result needs to be minus by 1
  return Math.sqrt(_this._x ** 2 + _this._y ** 2) * (_this.parent.level + 3) * 2.5;
}

class StationModule extends Entity {
  constructor(game, options, parent) {
    super(game);
    this.#game = game;
    let _this = this.modding.data;
    _this.shield = 1;
    _this.alive = true;
    _this.finish = "alloy";
    let type, subtype_id;
    (options?.type||"").replace(/^(sp|st|d)(\d+)$/, function(v, mType, id) {
      type = typeMap.get(mType);
      subtype_id = Number(id)
    });
    this.markAsSpawned();
    defineProperties(this, {
      parent,
      id: options?.id,
      type,
      class: subtype_id,
      createdStep: 0,
      _x: "number" == typeof options?.x ? options.x : 0,
      _y: "number" == typeof options?.y ? options.y : 0,
      _dir: "number" == typeof options?.dir ? options.dir : 0
    })
  }

  #game;

  get alive () {
    return !!this.modding.data.alive
  }

  updateShield (shield) {
    let _this = this.modding.data;
    let lastAlive = _this.alive;
    _this.alive = shield > 0;
    _this.shield = Math.max(0, shield - 1) / 254 * this.#game.options[this.type + "_shield"][this.parent.level - 1];
    _this.lastUpdatedStep = this.#game.step;
    if (_this.alive != lastAlive) {
      if (!_this.alive) _this.lastAliveStep = this.#game.step;
      this.#game.emit(this.#game.modding.events["STATION_MODULE_" + (_this.alive ? "REPAIRED" : "DESTROYED")], this)
    }
  }

  get x () {
    return this.parent.x + this.offsetX
  }

  get y () {
    return this.parent.y + this.offsetY
  }

  get vx () {
    return this.parent.vx + this.offsetVx
  }

  get vy () {
    return this.parent.vy + this.offsetVy
  }

  get offsetX () {
    return getRadius(this) * Math.cos(getAngle(this, this.lastAliveStep))
  }

  get offsetY () {
    return getRadius(this) * Math.sin(getAngle(this, this.lastAliveStep))
  }

  get offsetVx () {
    let step = this.lastAliveStep;
    return getRadius(this) * (Math.cos(getAngle(this, step + 1)) - Math.cos(getAngle(this, step)))
  }

  get offsetVy () {
    let step = this.lastAliveStep;
    return getRadius(this) * (Math.sin(getAngle(this, step + 1)) - Math.sin(getAngle(this, step)))
  }

  get angle () {
    return ((-(this.lastAliveStep / 60 / 3600 % 1 * 2) * 3 * Math.PI / Math.PI - this._dir / 2) % 2 + 2) % 2 * 180
  }

  get shield () {
    return this.modding.data.shield
  }

  get alive () {
    return this.modding.data.alive
  }

  get finish () {
    return this.modding.data.finish
  }
}

defineProperties(StationModule.prototype, {
  structure_type: "station_module",
  inactive_field: "vaporized"
});

module.exports = StationModule

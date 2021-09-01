'use strict';

const Structure = require("./Structure.js");
const defineProperties = require("../utils/defineProperties.js");
const typeMap = new Map([
  ["st", "structure"],
  ["d", "deposit"],
  ["sp", "spawning"]
]);

class StationModule extends Structure {
  constructor(game, options, parent) {
    super(game);
    let _this = this.modding.data;
    _this.shield = 1;
    _this.alive = true;
    _this.finish = _this.skin = "alloy";
    _this.offsetX = _this.offsetY = 0;
    let type, subtype_id;
    (options?.type||"").replace(/^(sp|st|d)(\d+)$/, function(v, mType, id) {
      type = typeMap.get(mType);
      subtype_id = Number(id)
    }.bind(this));
    this.markAsSpawned();
    defineProperties(this, {
      parent,
      id: options?.id,
      station_module_type: type,
      station_module_subtype_id: subtype_id,
      createdStep: 0,
      _x: "number" == typeof options?.x ? options.x : 0,
      _y: "number" == typeof options?.y ? options.y : 0,
      _dir: "number" == typeof options?.dir ? options.dir : 0
    })
  }

  isAlive () {
    return !!this.alive
  }

  updateShield (shield) {
    let _this = this.modding.data;
    _this.alive = shield > 0;
    _this.shield = Math.max(0, shield - 1) / 254 * this.game.options[this.station_module_type + "_shield"][this.parent.level - 1];
    _this.lastUpdatedStep = this.game.step
  }

  step () {
    let init_phase = Math.atan2(this._y, this._x), phase = init_phase - (this.game.step / 60 / 3600 % 1 * 2) * 3 * Math.PI;
    // originally (level + 4), but since we start from lvl1 and the game itself starts from lvl0, so the result needs to be minus by 1
    let radius = Math.sqrt(this._x ** 2 + this._y ** 2) * (this.parent.level + 3) * 2.5;
    let _this = this.modding.data;
    _this.offsetX = radius * Math.cos(phase);
    _this.offsetY = radius * Math.sin(phase);
    _this.angle = (((phase - init_phase) / Math.PI - this._dir / 2) % 2 + 2) % 2 * 180
  }

  get x () {
    return this.parent.x + this.offsetX
  }

  get y () {
    return this.parent.y + this.offsetY
  }

  get offsetX () {
    return this.modding.data.offsetX
  }

  get offsetY () {
    return this.modding.data.offsetY
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

  get skin () {
    return this.modding.data.skin
  }

  get lastUpdatedStep () {
    return this.modding.data.lastUpdatedStep
  }
}

defineProperties(StationModule.prototype, {
  structure_type: "station_module",
  inactive_field: "destroyed"
});

module.exports = StationModule

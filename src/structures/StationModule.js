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
    this.shield = 1;
    this.alive = true;
    this.finish = this.skin = "alloy";
    this.offsetX = this.offsetY = 0;
    let type, subtype_id;
    (options?.type||"").replace(/^(sp|st|d)(\d+)$/, function(v, mType, id) {
      type = typeMap.get(mType);
      subtype_id = Number(id)
    }.bind(this));
    defineProperties(this, {
      parent,
      id: options?.id,
      type,
      subtype_id,
      spawned: true,
      createdStep: 0,
      _x: "number" == typeof options?.x ? options.x : 0,
      _y: "number" == typeof options?.y ? options.y : 0,
      _dir: "number" == typeof options?.dir ? options.dir : 0
    })
  }

  markAsActive () {
    this[this.inactive_field] = false;
    delete this[this.inactive_field + "Step"]
  }

  markAsInactive () {
    this[this.inactive_field] = true
    this[this.inactive_field + "Step"] = this.game.step
  }

  updateShield (shield) {
    let oldAlive = this.alive;
    this.alive = shield > 0;
    this.shield = Math.max(0, shield - 1) / 254 * this.game.options[this.type + "_shield"][this.parent.level - 1];
    if (oldAlive != this.alive) {
      if (this.alive) this.markAsActive();
      else this.markAsInactive()
    }
    this.lastUpdatedStep = this.game.step
  }

  step () {
    let init_phase = Math.atan2(this._y, this._x), phase = init_phase - (this.game.step / 60 / 3600 % 1 * 2) * 3 * Math.PI;
    // originally (level + 4), but since we start from lvl1 and the game itself starts from lvl0, so the result needs to be minus by 1
    let radius = Math.sqrt(this._x ** 2 + this._y ** 2) * (this.parent.level + 3) * 2.5;
    this.offsetX = radius * Math.cos(phase);
    this.offsetY = radius * Math.sin(phase);
    this.angle = (((phase - init_phase) / Math.PI - this._dir / 2) % 2 + 2) % 2 * 180
  }

  get x () {
    return this.parent.x + this.offsetX
  }

  get y () {
    return this.parent.y + this.offsetY
  }
}

defineProperties(StationModule.prototype, {
  structure_type: "station_module",
  inactive_field: "destroyed"
});

module.exports = StationModule

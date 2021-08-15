'use strict';

const Structure = require("./Structure.js");
const typeMap = new Map([
  ["st", "structure"],
  ["d", "deposit"],
  ["sp", "spawning"]
]);

class StationModule extends Structure {
  constructor(game, parent, options) {
    options = Object.assign({}, options);
    super(game);
    this.id = options.id;
    this.parent = parent;
    this.shield = 0;
    this.alive = true;
    (options.type||"").replace(/^(sp|st|d)(\d+)$/, function(v, type, id) {
      this.type = typeMap.get(type);
      this.subtype_id = Number(id)
    }.bind(this));
    Object.defineProperties(this, {
      spawned: {value: true},
      createdStep: {value: 0},
      _x: {value: "number" == typeof options.x ? options.x : 0},
      _y: {value: "number" == typeof options.x ? options.x : 0},
      _dir: {value: options.dir}
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
    this.alive = shield > 0;
    this.shield = Math.max(0, shield - 1) / 254 * this.game.options[this.type + "_shield"][this.parent.level - 1]
  }

  step () {
    // let phase = (this.parent.phase / 180 + this.game.step / 60 / 3600 % 1 * 2) * Math.PI;
    // this.offsetX = 20 * this._x * Math.cos(phase);
    // this.offsetY = 20 * this._y * Math.sin(phase);
  }
}

Object.defineProperties(StationModule.prototype, {
  structure_type: {value: "station_module"},
  inactive_field: {value: "destroyed"}
});

module.exports = StationModule

'use strict';

const Structure = require("./Structure.js");
const typeMap = new Map([
  ["st", "structure"],
  ["d", "deposit"],
  ["sp", "spawning"]
]);

class StationModule extends Structure {
  constructor(game, options, parent) {
    options = Object.assign({}, options);
    super(game);
    this.shield = 0;
    this.alive = true;
    let type, subtype_id;
    (options.type||"").replace(/^(sp|st|d)(\d+)$/, function(v, mType, id) {
      type = typeMap.get(mType);
      subtype_id = Number(id)
    }.bind(this));
    Object.defineProperties(this, {
      parent: {value: parent},
      id: {value: options.id},
      type: {value: type},
      subtype_id: {value: subtype_id},
      spawned: {value: true},
      createdStep: {value: 0},
      _x: {value: "number" == typeof options.x ? options.x : 0},
      _y: {value: "number" == typeof options.y ? options.y : 0},
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
    let init_phase = Math.atan2(this._y, this._x), phase = init_phase - (this.parent.phase / 180 + this.game.step / 60 / 3600 % 1 * 2) * 3 * Math.PI, radius = 10 * Math.sqrt(this._x ** 2 + this._y ** 2);// * this.parent.level;
    this.offsetX = radius * Math.cos(phase);
    this.offsetY = radius * Math.sin(phase);
    this.angle = (((phase - init_phase) / Math.PI - this._dir / 2) % 2 + 2) % 2 * 180
  }
}

Object.defineProperties(StationModule.prototype, {
  structure_type: {value: "station_module"},
  inactive_field: {value: "destroyed"}
});

module.exports = StationModule

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
    this.dir = options.dir;
    this.x = options.x;
    this.y = options.y;
    (options.type||"").replace(/^(sp|st|d)(\d+)$/, function(v, type, id) {
      this.type = typeMap.get(type);
      this.subtype_id = Number(id)
    }.bind(this));
    Object.defineProperty(this, 'spawned', {value: true})
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
}

Object.defineProperties(StationModule.prototype, {
  entity_type: {value: "station_module"},
  inactive_field: {value: "destroyed"}
});

module.exports = StationModule

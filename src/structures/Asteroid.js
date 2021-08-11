'use strict';

const Entity = require("./Entity.js");
const MassRename = require("../utils/MassivePrototypeDefinition.js");
const limitedJSON = require("../utils/limitedJSON.js");

class Asteroid extends Entity {
  constructor(game, options) {
    super(game);
    options = Object.assign({}, options);
    this.size = options.size ?? 30;
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.vx = options.vx ?? 0;
    this.vy = options.vy ?? 0
  }

  update (data) {
    this.entityUpdate(data);
    this.size = data.size
  }

  toJSON () {
    return limitedJSON(this, ["vx", "vy", "size"])
  }
}

Object.defineProperties(Asteroid.prototype, {
  entity_type: {value: "asteroid"},
  inactive_field: {value: "killed"}
});

MassRename(Asteroid, ["size"]);

module.exports = Asteroid

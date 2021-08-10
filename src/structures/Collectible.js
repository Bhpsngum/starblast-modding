'use strict';

const Entity = require("./Entity.js");

class Collectible extends Entity {
  constructor(game, options) {
    super(game);
    options = Object.assign({}, options);
    this.code = options.code ?? this.codes[0];
    this.x = options.x ?? 0;
    this.y = options.y ?? 0
  }

  set () {

  }

  step () {

  }

  toJSON () {
    return limitedJSON(this, ["code"])
  }
}

Object.defineProperties(Collectible.prototype, {
  entity_type: {value: "collectible"},
  inactive_field: {value: "picked"}
});

Collectible.prototype.codes = [10, 11, 12, 20, 21, 40, 41, 42, 90, 91];

module.exports = Collectible

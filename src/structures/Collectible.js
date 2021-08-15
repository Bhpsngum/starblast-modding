'use strict';

const Entity = require("./Entity.js");
const limitedJSON = require("../utils/limitedJSON.js");
const CollectibleCodes = require("../utils/collectibleCodes.js");

class Collectible extends Entity {
  constructor(game, options) {
    super(game);
    options = Object.assign({}, options);
    this.code = options.code ?? CollectibleCodes[0];
    this.x = options.x ?? 0;
    this.y = options.y ?? 0
  }

  set () {

  }

  step () {

  }

  kill () {

  }

  toJSON () {
    return limitedJSON(this, ["x", "y", "request_id", "code"])
  }
}

Object.defineProperties(Collectible.prototype, {
  structure_type: {value: "collectible"},
  inactive_field: {value: "vaporized"}
});

module.exports = Collectible

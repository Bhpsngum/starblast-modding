'use strict';

const Entity = require("./Entity.js");
const limitedJSON = require("../utils/limitedJSON.js");
const CollectibleCodes = require("../utils/collectibleCodes.js");
const defineProperties = require("../utils/defineProperties.js");

/**
 * The Collectible Instance
 * @extends {Entity}
 * @abstract
 */

class Collectible extends Entity {
  constructor(game, api, options) {
    super(game, api);
    this.#game = game;

    /**
     * Collectible code
     * @name Collectible.prototype.code
     * @type {number}
     * @readonly
     */

    defineProperties(this, {code: options?.code ?? CollectibleCodes[0]});
    let _this = this.modding.data;
    _this.x = options?.x ?? 0;
    _this.y = options?.y ?? 0;
    _this.vx = _this.vy = 0;
    _this.lastUpdatedStep = game.step;
  }

  #game;

  set () {

  }

  kill () {

  }

  toJSON () {
    return limitedJSON(this, ["x", "y", "request_id", "code"])
  }
}

defineProperties(Collectible.prototype, {
  structure_type: "collectible",
  inactive_field: "vaporized"
});

module.exports = Collectible

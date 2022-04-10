'use strict';

const Entity = require("./Entity.js");
const MassRename = require("../utils/MassivePrototypeDefinition.js");
const limitedJSON = require("../utils/limitedJSON.js");
const defineProperties = require("../utils/defineProperties.js");

/**
 * The Asteroid Instance
 * @extends {Entity}
 * @param {ModdingClient} game - The <code>ModdingClient</code> object
 * @param {object} options - Instance options
 */

class Asteroid extends Entity {
  constructor(game, options) {
    super(game);
    this.#game = game;
    let _this = this.modding.data;
    _this.size = options?.size ?? 30;
    _this.x = options?.x ?? 0;
    _this.y = options?.y ?? 0;
    _this.vx = options?.vx ?? 0;
    _this.vy = options?.vy ?? 0
  }

  #game;

  update (data) {
    this.entityUpdate(data);
    let _this = this.modding.data;
    _this.size = data.size
  }

  /**
   * Asteroid size
   * @type {number}
   * @readonly
   */

  get size () {
    return this.modding.data.size
  }

  toJSON () {
    return limitedJSON(this, ["x", "y", "request_id", "vx", "vy", "size"])
  }
}

defineProperties(Asteroid.prototype, {
  structure_type: "asteroid",
  inactive_field: "destroyed"
});

MassRename(Asteroid, ["x", "y", "vx", "vy", "size"]);

module.exports = Asteroid

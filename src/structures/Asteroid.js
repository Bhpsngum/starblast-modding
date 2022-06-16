'use strict';

const Entity = require("./Entity.js");
const MassRename = require("../utils/MassivePrototypeDefinition.js");
const limitedJSON = require("../utils/limitedJSON.js");
const defineProperties = require("../utils/defineProperties.js");

/**
 * The Asteroid Instance
 * @extends {Entity}
 * @abstract
 */

class Asteroid extends Entity {
  constructor(game, options) {
    super(game, api);
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

  /**
   * Set asteroid's X position
   * @method Asteroid#setX
   * @param {number} x - The X position to set
   * @returns {Asteroid}
   */

  /**
   * Set asteroid's Y position
   * @method Asteroid#setY
   * @param {number} y - The Y position to set
   * @returns {Asteroid}
   */

  /**
   * Set asteroid speed along the x Axis
   * @method Asteroid#setVx
   * @param {number} vx - The speed to set along the x Axis, can be negative
   * @returns {Asteroid}
   */

  /**
   * Set asteroid speed along the y Axis
   * @method Asteroid#setVy
   * @param {number} vy - The speed to set along the y Axis, can be negative
   * @returns {Asteroid}
   */

  /**
   * Set asteroid size
   * @method Asteroid#setSize
   * @param {number} size - The size to set
   * @returns {Asteroid}
   */

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

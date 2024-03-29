'use strict';

const defineProperties = require("../utils/defineProperties.js");
const crypto = require("crypto");
const createUUID = function () {
  return crypto.randomUUID({ disableEntropyCache: true }).toUpperCase()
}

/**
 * The Structure Instance - represents any structrure in the game
 * @abstract
 */

class Structure {
  constructor (game, api) {
    this.#game = game;
    this.#api = api;

    /**
     * Custom object served for assigning data by the user
     * @type {object}
     */

    this.custom = {};

    /**
     * Structure's UUID
     * @name Structure#uuid
     * @type {number}
     * @readonly
     */

    /**
    * Structure's ID
    * @name Structure#id
    * @type {number}
    * @readonly
    */

    /**
    * Structure's creation step
    * @name Structure#createdStep
    * @type {number}
    * @readonly
    */
    defineProperties(this, {modding: {data: {}}, uuid: createUUID()})
  }

  #game;
  #api;

  markAsInactive () {
    try {
      defineProperties(this, {
        [this.inactive_field]: true,
        [this.inactive_field + "Step"]: this.#game.timer.step
      });
      this.modding.data.lastAliveStep = this.#game.timer.step
    }
    catch (e) {}

  }

  markAsSpawned () {
    defineProperties(this, {spawned: true})
  }

  /**
   * Check whether if the structure is still active or not
   * @returns {boolean}
   */

  isActive () {
    try { this[this.inactive_field] = false } catch(e) {}
    return this.isSpawned() && !this[this.inactive_field]
  }

  /**
   * Check whether if the structure is spawned or not
   * @returns {boolean}
   */

  isSpawned () {
    try { this.spawned = false } catch(e) {}
    return !!this.spawned
  }

  /**
   * Indicates whether the structure is alive or not
   * @type {boolean}
   * @readonly
   */

  get alive () {
    return this.isActive()
  }

  /**
   * The latest alive step of the structure
   * @type {number}
   * @readonly
   */

  get lastAliveStep () {
    let aliveData = this.modding.data.alive, alive = this.isActive() && this.alive;
    return alive ? this.#game.timer.step : this.modding.data.lastAliveStep;
  }
}

module.exports = Structure

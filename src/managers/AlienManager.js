'use strict';

const EntityManager = require("./EntityManager.js");
const Alien = require("../structures/Alien.js");
const defineProperties = require("../utils/defineProperties.js");

/**
 * The Alien Manager Instance.
 * @extends {EntityManager}
 * @abstract
 */

class AlienManager extends EntityManager {
  constructor(game, api) {
    super(game, api);
    this.#game = game;
  }

  #game;

  get limit () {
    return 300
  }

  [Symbol.toStringTag] = 'AlienManager'
}

defineProperties(AlienManager.prototype, {
  manager_name: "alien",
  StructureConstructor: Alien
});

module.exports = AlienManager

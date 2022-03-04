'use strict';

const EntityManager = require("./EntityManager.js");
const Alien = require("../structures/Alien.js");
const defineProperties = require("../utils/defineProperties.js");

class AlienManager extends EntityManager {
  constructor(game) {
    super(game)
  }

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

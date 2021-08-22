'use strict';

const EntityManager = require("./EntityManager.js");
const Asteroid = require("../structures/Asteroid.js");
const defineProperties = require("../utils/defineProperties.js");

class AsteroidManager extends EntityManager {
  constructor(game) {
    super(game)
  }
}

defineProperties(AsteroidManager.prototype, {
  manager_name: "asteroid",
  StructureConstructor: Asteroid
});

module.exports = AsteroidManager

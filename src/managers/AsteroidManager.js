'use strict';

const EntityManager = require("./EntityManager.js");
const Asteroid = require("../structures/Asteroid.js");

class AsteroidManager extends EntityManager {
  constructor(game) {
    super(game)
  }
}

Object.defineProperties(AsteroidManager.prototype, {
  manager_name: {value: "asteroid"},
  EntityConstructor: {value: Asteroid}
});

module.exports = AsteroidManager

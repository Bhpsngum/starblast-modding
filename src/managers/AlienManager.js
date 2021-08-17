'use strict';

const EntityManager = require("./EntityManager.js");
const Alien = require("../structures/Alien.js");

class AlienManager extends EntityManager {
  constructor(game) {
    super(game)
  }
}

Object.defineProperties(AlienManager.prototype, {
  manager_name: {value: "alien"},
  StructureConstructor: {value: Alien}
});

module.exports = AlienManager

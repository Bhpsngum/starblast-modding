'use strict';

const EntityManager = require("./EntityManager.js");
const Collectible = require("../structures/Collectible.js");

class CollectibleManager extends EntityManager {
  constructor(game) {
    super(game)
  }

  update () {

  }
}

Object.defineProperties(CollectibleManager.prototype, {
  manager_name: {value: "collectible"},
  EntityConstructor: {value: Collectible}
});

module.exports = CollectibleManager

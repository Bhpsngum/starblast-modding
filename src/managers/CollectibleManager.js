'use strict';

const EntityManager = require("./EntityManager.js");
const Collectible = require("../structures/Collectible.js");
const defineProperties = require("../utils/defineProperties.js");

class CollectibleManager extends EntityManager {
  constructor(game) {
    super(game)
  }

  update () {
    this.filterList().all.forEach(entity => entity.isActive() && entity.lastUpdatedStep + 600 < this.game.step && entity.markAsInactive());
    this.clear();
    this.all.forEach(entity => entity.isActive() && this._UUIDset(entity));
    return this
  }

  get limit () {
    return 50
  }

  [Symbol.toStringTag] = 'CollectibleManager'
}

defineProperties(CollectibleManager.prototype, {
  manager_name: "collectible",
  StructureConstructor: Collectible
});

module.exports = CollectibleManager

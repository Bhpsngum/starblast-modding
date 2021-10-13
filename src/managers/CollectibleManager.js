'use strict';

const EntityManager = require("./EntityManager.js");
const Collectible = require("../structures/Collectible.js");
const defineProperties = require("../utils/defineProperties.js");

class CollectibleManager extends EntityManager {
  constructor(game) {
    super(game)
  }

  update () {
    this.clear();
    this.filterList().all.forEach(collectible => {
      let isActive = collectible.isActive() && collectible.lastUpdatedStep + 600 < this.game.step;
      if (!isActive) collectible.markAsInactive();
      else this._MapSet(collectible.uuid, collectible)
    });
    return this
  }

  [Symbol.toStringTag] = 'CollectibleManager'
}

defineProperties(CollectibleManager.prototype, {
  manager_name: "collectible",
  StructureConstructor: Collectible
});

module.exports = CollectibleManager

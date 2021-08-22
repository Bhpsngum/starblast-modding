'use strict';

const EntityManager = require("./EntityManager.js");
const Collectible = require("../structures/Collectible.js");
const defineProperties = require("../utils/defineProperties.js");

class CollectibleManager extends EntityManager {
  constructor(game) {
    super(game)
  }

  update (onTick) {
    let x = this.all.splice(0).filter(entity => this.isInstance(entity));
    this.all.push(...x);
    this.all.forEach(collectible => collectible.isActive() && onTick && collectible.lastUpdatedStep + 600 < this.game.step && collectible.markAsInactive());
    this.splice(0);
    this.push(...this.all.filter(collectible => collectible.isActive()));
    return this
  }
}

defineProperties(CollectibleManager.prototype, {
  manager_name: "collectible",
  StructureConstructor: Collectible
});

module.exports = CollectibleManager

'use strict';

const EntityManager = require("./EntityManager.js");
const Collectible = require("../structures/Collectible.js");

class CollectibleManager extends EntityManager {
  constructor(game) {
    super(game)
  }

  update (onTick) {
    if (onTick) this.forEach(collectible => collectible.isActive() && collectible.last_updated + 10 < this.game.step && collectible.markAsInactive());
    this.active.splice(0);
    this.active.push(...this.filter(collectible => collectible.isActive()))
  }
}

Object.defineProperties(CollectibleManager.prototype, {
  manager_name: {value: "collectible"},
  EntityConstructor: {value: Collectible}
});

module.exports = CollectibleManager

'use strict';

const EntityManager = require("./EntityManager.js");
const Collectible = require("../structures/Collectible.js");

class CollectibleManager extends EntityManager {
  constructor(game) {
    super(game)
  }

  update (onTick) {
    if (onTick) this.all.forEach(collectible => collectible.isActive() && collectible.last_updated + 600 < this.game.step && collectible.markAsInactive());
    this.splice(0);
    Array.prototype.push.call(this, ...this.filter(collectible => collectible.isActive()))
  }
}

Object.defineProperties(CollectibleManager.prototype, {
  manager_name: {value: "collectible"},
  EntityConstructor: {value: Collectible}
});

module.exports = CollectibleManager

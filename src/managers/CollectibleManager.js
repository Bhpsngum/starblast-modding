'use strict';

const EntityManager = require("./EntityManager.js");
const Collectible = require("../structures/Collectible.js");

/**
 * The Collectible Manager Instance.
 * @extends {EntityManager}
 * @abstract
 */

class CollectibleManager extends EntityManager {
  constructor(game, api) {
    super(game, api);
    this.#game = game;
  }

  #game;

  update () {
    this.filterList().all.forEach(entity => entity.isActive() && entity.lastUpdatedStep + 600 < this.#game.timer.step && entity.markAsInactive());
    this.clear();
    this.all.forEach(entity => entity.isActive() && this._UUIDset(entity));
    return this
  }

  get limit () {
    return 50
  }

  [Symbol.toStringTag] = 'CollectibleManager';
  manager_name = "collectible";
  StructureConstructor = Collectible;
}

module.exports = CollectibleManager

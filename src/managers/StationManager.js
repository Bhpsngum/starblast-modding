'use strict';

const StructureManager = require("./StructureManager.js");
const Station = require("../structures/Station.js");
const defineProperties = require("../utils/defineProperties.js");

/**
 * The Station Manager Instance.
 * @extends {StructureManager}
 * @abstract
 */

class StationManager extends StructureManager {
  constructor (game, api) {
    super(game, api);
    this.#game = game;
  }

  #game;

  update () {
    this.clear();
    this.filterList().all.forEach(station => station.isActive() && this._UUIDset(station));
    return this
  }

  get limit () {
    return this.#game.options.friendly_colors
  }

  [Symbol.toStringTag] = 'StationManager'
}

defineProperties(StationManager.prototype, {
  manager_name: "station",
  StructureConstructor: Station
});

module.exports = StationManager;

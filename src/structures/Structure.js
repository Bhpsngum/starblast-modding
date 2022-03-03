'use strict';

const defineProperties = require("../utils/defineProperties.js");
const crypto = require("crypto");
const createUUID = function () {
  return crypto.randomUUID({ disableEntropyCache: true }).toUpperCase()
}

class Structure {
  constructor (game) {
    let modding = defineProperties({}, {data: {}});
    defineProperties(this, {game, modding, uuid: createUUID()})
  }

  markAsInactive () {
    try {
      defineProperties(this, {
        [this.inactive_field]: true,
        [this.inactive_field + "Step"]: this.game.step
      })
    }
    catch (e) {}
  }

  markAsSpawned () {
    defineProperties(this, {spawned: true})
  }

  isActive () {
    try { this[this.inactive_field] = false } catch(e) {}
    return this.isSpawned() && !this[this.inactive_field]
  }

  isSpawned () {
    try { this.spawned = false } catch(e) {}
    return !!this.spawned
  }
}

module.exports = Structure

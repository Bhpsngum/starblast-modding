'use strict';

const defineProperties = require("../utils/defineProperties.js");

class Structure {
  constructor (game) {
    defineProperties(this, {game})
  }

  markAsInactive () {
    defineProperties(this, {
      [this.inactive_field]: true,
      [this.inactive_field + "Step"]: this.game.step
    })
  }

  markAsSpawned () {
    defineProperties(this, {spawned: true})
  }

  isActive () {
    try { this[this.inactive_field] = false } catch(e) {}
    return this.isSpawned() && this[this.inactive_field] === false
  }

  isSpawned () {
    try { this.spawned = false } catch(e) {}
    return this.spawned === true
  }
}

module.exports = Structure

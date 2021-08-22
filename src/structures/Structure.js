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

  isActive () {
    return this.spawned && !this[this.inactive_field]
  }
}

module.exports = Structure

'use strict';

class Structure {
  constructor (game) {
    this.game = game;
  }

  markAsInactive () {
    Object.defineProperty(this, this.inactive_field, {value: true})
  }

  isActive () {
    return this.spawned && !this[this.inactive_field]
  }
}

module.exports = Structure

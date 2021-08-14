'use strict';

class Structure {
  constructor (game) {
    this.game = game;
  }

  markAsInactive () {
    Object.defineProperties(this, {
      [this.inactive_field]: {value: true},
      [this.inactive_field + "Step"]: {value: this.game.step}
    })
  }

  isActive () {
    return this.spawned && !this[this.inactive_field]
  }
}

module.exports = Structure

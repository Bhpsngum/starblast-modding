'use strict';

class Structure {
  constructor () {

  }

  markAsInactive () {
    Object.defineProperty(this, this.inactive_field, {value: true})
  }

  isActive () {
    return !this[this.inactive_field]
  }
}

module.exports = Structure

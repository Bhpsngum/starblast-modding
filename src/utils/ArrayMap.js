'use strict';

class ArrayMap extends Map {
  constructor (...args) {
    super(...args)
  }

  toArray () {
    return [...this.entries()].map(structure => structure[1])
  }

  get length () {
    return this.size
  }

  _UUIDset (value) {
    return Map.prototype.set.call(this, value?.uuid, value)
  }

  [Symbol.iterator] () {
    return this.toArray()[Symbol.iterator]()
  }
}

module.exports = ArrayMap

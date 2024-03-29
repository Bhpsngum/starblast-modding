'use strict';

/**
 * The Map Instance with a few array methods
 * @extends {Map}
 * @abstract
 */

class ArrayMap extends Map {
  constructor (...args) {
    super(...args)
  }

  /**
   * Get an array from this object
   * @returns {array}
   */

  toArray () {
    return [...this.entries()].map(structure => structure[1])
  }

  /**
   * Length of this object, same as <code>Map.prototype.size</code>
   * @type {number}
   * @readonly
   */

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

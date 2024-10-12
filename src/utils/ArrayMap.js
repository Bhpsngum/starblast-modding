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
	 * Get element at index, Equivalent to `Array.prototype.at`
	 * @returns {any | undefined} The value at index
	 */
	
	at (index) {
		return this.toArray().at(index);
	}

	/**
	 * Get an array from this object
	 * @returns {array}
	 */

	toArray () {
		return [...this.values()];
	}

	/**
	 * Length of this object, same as `Map.prototype.size`
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
		return this.values();
	}

	toJSON () {
		return this.toArray();
	}
}

module.exports = ArrayMap

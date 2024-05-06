'use strict';

const defineProperties = require("../utils/defineProperties.js");

/**
 * The Coordinate Instance
 * @param {object} position - The position object
 * @param {object} options - Instance options
 * @abstract
 */

class Coordinate {
	constructor (position) {
		/**
		 * X Coordinate
		 * @name Coordinate#x
		 * @type {number}
		 * @readonly
		 */

		/**
		* Y Coordinate
		* @name Coordinate#y
		* @type {number}
		* @readonly
		*/

		/**
		 * Z Coordinate
		 * @name Coordinate#z
		 * @type {number}
		 * @readonly
		 */
		defineProperties(this, {
			x: "number" == typeof position?.x ? position.x : 0,
			y: "number" == typeof position?.y ? position.y : 0,
			z: "number" == typeof position?.z ? position.z : 0,
		})
	}

	toJSON () {
		return {
			x: this.x,
			y: this.y,
			z: this.z
		}
	}
}

module.exports = Coordinate

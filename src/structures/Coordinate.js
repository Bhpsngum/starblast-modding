'use strict';

const defineProperties = require("../utils/defineProperties.js");
const limitedJSON = require("../utils/limitedJSON.js");

/**
 * The Coordinate Instance
 * @param {object} position - The position object
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
			x: +position?.x || 0,
			y: +position?.y || 0,
			z: +position?.z || 0
		});
	}

	toJSON () {
		return limitedJSON(this, ["x", "y", "z"]);
	}
}

module.exports = Coordinate

'use strict';

const defineProperties = require("../../utils/defineProperties.js");
const UIPositionVerifier = require("../../utils/UIPositionVerifier.js");

/**
 * Base UI Element instance
 * @param {Object} data - Data to initialize this element
 * @param {number[]} data.posistion - Position of this element ([x, y, width, height])
 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
 */

class UIBaseElement {
	constructor (data, strictMode = false) {
		defineProperties(this, {
			raw: {}
		}, false);

		this.setPosition(data?.position, strictMode);
	}

	/**
	 * Sets data to this element
	 * @param {Object} data - Options to set to. Absent fields from this object will keep the old value
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UIBaseElement} The UI Element in question
	 */

	set (data, strictMode = false) {
		data = data || {};
		
		if ("position" in data) this.setPosition(data.position, strictMode);

		return this;
	}

	/**
	 * Sets position of this UI Element
	 * @param {number[]} position - Position array [x, y, width, height] to set
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UIBaseElement} The UI Element in question
	 */

	setPosition (position, strictMode = false) {
		let pos = UIPositionVerifier(position, strictMode);

		if (!pos.success) throw new Error("Failed to parse component's position. " + pos.value);

		this.raw.position = Object.freeze(pos.value);

		return this;
	}

	/**
	 * The position array ([x, y, width, height]) of this element
	 * @type {number[]}
	 * @readonly
	 */

	get position () {
		return this.raw.position;
	}

	/**
	 * Parent group of this element
	 * @type {UIElementGroup | null}
	 * @readonly
	 */

	get parent () {
		return this.raw.parent ?? null;
	}

	/**
	 * Clone this element
	 * @returns {UIBaseElement}
	 */

	clone () {
		return new this.constructor(this);
	}

	/**
	 * Remove this element from parent element group
	 * @returns {boolean} Indicating if the result is successful or not
	 */

	remove () {
		return this.parent?.removeComponent?.(this) ?? false;
	}

	/**
	 * Serialize this element into JSON object.
	 * Some element type (e.g Group) is not supported by Modding Server, hence calling `toJSON()` method will deconstruct the element.
	 * Use this method to keep serialization of this element.
	 * @returns {Object} Serialized result
	 */
	serialize () {
		return this.toJSON();
	}

	toJSON () {
		return {
			position: this.position
		}
	}
}

module.exports = UIBaseElement;
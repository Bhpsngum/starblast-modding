'use strict';

const toString = require("../../utils/toString.js");
const limitedJSON = require("../../utils/limitedJSON.js");
const UITextBasedElement = require("./TextBased.js");

/**
 * The UI Text Element instance
 * @class StarblastModding.UI.PlayerElement
 * @extends {UITextBasedElement}
 * @param {number} data.id - Ship ID to get info from
 */

class UIPlayerElement extends UITextBasedElement {
	constructor (data, strictMode = false) {
		super(data, strictMode);
		
		this.setId(data?.id, strictMode);
	}

	set (data, strictMode = false) {
		super.set(data, strictMode);

		this.raw.align = "left";

		if (data?.hasOwnProperty?.("id")) this.setId(data.id, strictMode);

		return this;
	}

	setAlign (textAlign, strictMode = false) {
		if (strictMode) throw new Error(`Player component's text alignment cannot be modified. It is always "left".`);
		return this;
	}

	/**
	 * Sets ship id to get info of for this UI Player Element
	 * @param {number} id - Id to set
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UITextElement} The UI Text Element in question
	 */

	setId (id, strictMode = false) {
		if ("number" !== typeof id) throw new Error(`Expects ${this.constructor.name}.id to be a number. Got ${toString(id)} instead.`);

		if (isNaN(id) || id < 0) throw new Error(`Expects ${this.constructor.name}.id to be non-negative. Got ${id} instead.`);

		if (id % 1 !== 0) {
			if (strictMode) throw new Error(`Expects ${this.constructor.name}.id to be an integer. Got ${id} instead.`);
			id = Math.trunc(id);
		}

		this.raw.id = id;
		return this;
	}

	/**
	 * Ship id of this text element
	 * @type {number}
	 * @readonly
	 */

	get id () {
		return this.raw.id;
	}

	toJSON () {
		let raw = {
			type: "player",
			...super.toJSON(),
			id: this.id
		};

		delete raw.align;

		return raw;
	}
}

module.exports = UIPlayerElement;
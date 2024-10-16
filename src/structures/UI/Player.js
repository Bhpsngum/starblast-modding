'use strict';

const toString = require("../../utils/toString.js");
const limitedJSON = require("../../utils/limitedJSON.js");
const UITextBasedElement = require("./TextBased.js");
const UITextElement = require("./Text.js");

/**
 * The UI Text Element instance
 * @extends {UITextBasedElement}
 * @param {number} data.id - Ship ID to get info from
 */

class UIPlayerElement extends UITextBasedElement {
	constructor (data, strictMode = false) {
		super(data, strictMode);

		this.raw.align = "left";
		
		this.setId(data?.id, strictMode).setFontSize(data?.fontSize, strictMode);
	}

	set (data, strictMode = false) {
		super.set(data, strictMode);

		this.raw.fontSize = null;

		data = data || {};

		if ("id" in data) this.setId(data.id, strictMode);

		if ("fontSize" in data) this.setFontSize(data.fontSize, strictMode);

		return this;
	}

	setAlign (textAlign, strictMode = false) {
		if (strictMode && textAlign != null) throw new Error(`Player component's text alignment cannot be modified. It is always "left".`);
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
	 * Sets font size of this UI Player Element
	 * @param {number | null} fontSize - Font size to set, non-negative (in {@link https://en.wikipedia.org/wiki/Point_(typography)|pt}) or `null`/`undefined` to inherit from previous text elements
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UIPlayerElement} The UI Player Element in question
	 */

	setFontSize (fontSize, strictMode = false) {
		if (fontSize != null) {
			if ("number" !== typeof fontSize) {
				if (strictMode) throw new Error(`Expects ${this.constructor.name}.fontSize to be a number. Got ${toString(fontSize)} instead.`);
				fontSize = +fontSize;
			}

			if (isNaN(fontSize) || fontSize < 0) {
				if (strictMode) throw new Error(`Expects ${this.constructor.name}.fontSize to be non-negative. Got ${fontSize} instead.`);
				fontSize = 0;
			}

			if (fontSize % 1 !== 0) {
				if (strictMode) throw new Error(`Expects ${this.constructor.name}.fontSize to be an integer. Got ${fontSize} instead.`);
				fontSize = Math.trunc(fontSize);
			}
		}
		else fontSize = null;

		this.raw.fontSize = fontSize;
		return this;
	}

	/**
	 * Font size of current player element, a number in in {@link https://en.wikipedia.org/wiki/Point_(typography)|pt} or `null` if it's inherited from previous text elements
	 * @type {number | null}
	 * @readonly
	 */

	get fontSize () {
		return this.raw.fontSize;
	}

	/**
	 * Ship id of this text element
	 * @type {number}
	 * @readonly
	 */

	get id () {
		return this.raw.id;
	}

	serialize () {
		return {
			type: "player",
			...super.toJSON(),
			...limitedJSON(this, ["id", "fontSize"])
		};
	}

	toJSON () {
		let raw = this.serialize();

		let { fontSize } = raw;

		delete raw.fontSize;

		if (fontSize != null) return [
			(new UITextElement({ position: [0, 0, 1, fontSize * 1.5], value: "" })).toJSON(),
			raw,
		] 

		return raw;
	}
}

module.exports = UIPlayerElement;
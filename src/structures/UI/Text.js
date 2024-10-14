'use strict';

const toString = require("../../utils/toString.js");
const UITextBasedElement = require("./TextBased.js");

/**
 * The UI Text Element instance
 * @extends {UITextBasedElement}
 * @param {string} data.value - String value of this text element
 */

class UITextElement extends UITextBasedElement {
	constructor (data, strictMode = false) {
		super(data, strictMode);
		
		this.setValue(data?.value, strictMode);
	}

	set (data, strictMode = false) {
		super.set(data, strictMode);

		data = data || {};

		if ("value" in data) this.setValue(data.value, strictMode);

		return this;
	}

	/**
	 * Sets text value of this UI Text Element
	 * @param {string} textValue - Value to set
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UITextElement} The UI Text Element in question
	 */

	setValue (textValue, strictMode = false) {
		if ("string" !== typeof textValue) {
			if (strictMode) throw new Error(`Expects ${this.constructor.name}.value to be a string. Got ${toString(textValue)} instead.`);
			if (textValue == null) textValue = "";
			else textValue = toString(textValue);
		}

		this.raw.value = textValue;
		return this;
	}

	/**
	 * String value of this text element
	 * @type {string}
	 * @readonly
	 */

	get value () {
		return this.raw.value;
	}

	toJSON () {
		return {
			type: "text",
			...super.toJSON(),
			value: this.value
		}
	}
}

module.exports = UITextElement;
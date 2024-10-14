'use strict';

const UIBaseElement = require("./Element.js");
const toString = require("../../utils/toString.js");
const parseColor = require("../../utils/parseColor.js");
const limitedJSON = require("../../utils/limitedJSON.js");

/**
 * The UI Text-Based Element instance
 * @extends {UIBaseElement}
 * @param {string|number} [data.color = "#000"] - Text color of this element, in CSS value or color hex value (ARGB or RGB format)
 * @param {("center" | "left" | "right" | null)} [data.align = "center"] Text alignment of this text element
 */

class UITextBasedElement extends UIBaseElement {
	constructor (data, strictMode = false) {
		super(data, strictMode);
		
		this.setColor(data?.color, strictMode).setAlign(data?.align, strictMode);
	}

	set (data, strictMode = false) {
		super.set(data, strictMode);

		data = data || {};

		if ("color" in data) this.setColor(data.color, strictMode);

		if ("align" in data) this.setAlign(data.align, strictMode);

		return this;
	}

	/**
	 * Sets text color of this UI Text Element
	 * @param {string | number} color - Color value to set, either an CSS color string or a hex color value (ARGB or RGB format)
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UITextElement} The UI Text Element in question
	 */

	setColor (color, strictMode = false) {
		this.raw.color = parseColor(color, strictMode, "#000", `${this.constructor.name}.color`);
		return this;
	}

	/**
	 * Sets alignment of this UI Text Element
	 * @param {("center" | "left" | "right" | null)} [align = "center"] Text alignment to set
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UITextElement} The UI Text Element in question
	 */

	setAlign (align = "center", strictMode = false) {
		if (align == null) align = "center";
		else if (!["center", "left", "right"].includes(align)) {
			if (strictMode) throw new Error(`Expects ${this.constructor.name}.align to be either nullish or one of the values "center", "left" or "right". Got ${toString(this.value)} instead.`);
			align = "center";
		}

		this.raw.align = align;
		return this;
	}

	/**
	 * CSS Color value of this text element
	 * @type {string}
	 * @readonly
	 */

	get color () {
		return this.raw.color;
	}

	/**
	 * Alignment of this text element
	 * @type {string}
	 * @readonly
	 */

	get align () {
		return this.raw.align;
	}

	toJSON () {
		let raw = {
			...super.toJSON(),
			...limitedJSON(this, ["color", "align"])
		};

		if (raw.align === "center") delete raw.align;
		return raw;
	}
}

module.exports = UITextBasedElement;
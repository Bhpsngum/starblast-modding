'use strict';

const UIBaseElement = require("./Element.js");
const toString = require("../../utils/toString.js");
const parseColor = require("../../utils/parseColor.js");
const limitedJSON = require("../../utils/limitedJSON.js");

/**
 * The UI BasicShape Element instance
 * @abstract
 * @extends {UIBaseElement}
 * @param {string|number} [data.fill = "hsla(0,0%,0%,0)"] - Background fill color of this element, in CSS value or color hex value (ARGB or RGB format)
 * @param {string|number} [data.stroke = "hsla(0,0%,0%,0)"] - Border color of this element, in CSS value or color hex value (ARGB or RGB format)
 * @param {number} [data.width = 0] Border width of this text element
 */

class UIBasicShapeElement extends UIBaseElement {
	constructor (data, strictMode = false) {
		super(data, strictMode);
		
		this.setFill(data?.fill, strictMode).setWidth(data?.width, strictMode).setStroke(data?.stroke, strictMode);
	}

	set (data, strictMode = false) {
		super.set(data, strictMode);

		if (data?.hasOwnProperty?.("fill")) this.setFill(data.fill, strictMode);

		if (data?.hasOwnProperty?.("width")) this.setWidth(data.width, strictMode);

		if (data?.hasOwnProperty?.("stroke")) this.setStroke(data.stroke, strictMode);

		return this;
	}

	/**
	 * Sets border width of this UI BasicShape Element
	 * @param {number} width - Width value to set, non-negative
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UIBasicShapeElement} The UI BasicShape Element in question
	 */

	setWidth (width, strictMode = false) {
		if ("number" !== typeof width) {
			if (strictMode) throw new Error(`Expects ${this.constructor.name}.width to be a number. Got ${toString(width)} instead.`);
			width = 0;
		}
		else if (isNaN(width) || width < 0) {
			if (strictMode) throw new Error(`Expects ${this.constructor.name}.width to be non-negative. Got ${toString(width)} instead.`);
			width = 0;
		}

		this.raw.width = width;
		return this;
	}

	/**
	 * Sets background fill color of this UI BasicShape Element
	 * @param {string | number} fill - Color value to set, either an CSS color string or a hex color value (ARGB or RGB format)
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UIBasicShapeElement} The UI BasicShape Element in question
	 */

	setFill (fill, strictMode = false) {
		this.raw.fill = parseColor(fill, strictMode, "hsla(0,0%,0%,0)", `${this.constructor.name}.fill`);
		return this;
	}

	/**
	 * Sets border color of this UI BasicShape Element
	 * @param {string | number} stroke - Color value to set, either an CSS color string or a hex color value (ARGB or RGB format)
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UIBasicShapeElement} The UI BasicShape Element in question
	 */

	setStroke (stroke, strictMode = false) {
		this.raw.stroke = parseColor(stroke, strictMode, "hsla(0,0%,0%,0)", `${this.constructor.name}.stroke`);
		return this;
	}

	/**
	 * Border width of this BasicShape element
	 * @type {number}
	 * @readonly
	 */

	get width () {
		return this.raw.width;
	}

	/**
	 * CSS background color value of this BasicShape element
	 * @type {string}
	 * @readonly
	 */

	get fill () {
		return this.raw.fill;
	}

	/**
	 * CSS border color value of this BasicShape element
	 * @type {string}
	 * @readonly
	 */

	get stroke () {
		return this.raw.stroke;
	}

	toJSON () {
		return {
			...super.toJSON(),
			...limitedJSON(this, ["fill", "width", "stroke"])
		}
	}
}

module.exports = UIBasicShapeElement;
'use strict';

const UIBasicShapeElement = require("./BasicShape.js");

/**
 * The UI Box Element instance
 * @extends {UIBasicShapeElement}
 */

class UIBoxElement extends UIBasicShapeElement {
	toJSON () {
		return {
			type: "box",
			...super.toJSON()
		}
	}
}

module.exports = UIBoxElement;
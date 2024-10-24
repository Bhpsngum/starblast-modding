'use strict';

const UIBasicShapeElement = require("./BasicShape.js");

/**
 * The UI Box Element instance
 * @extends {UIBasicShapeElement}
 * @since 1.4.2-alpha6
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
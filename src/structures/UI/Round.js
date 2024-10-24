'use strict';

const UIBasicShapeElement = require("./BasicShape.js");

/**
 * The UI Round Element instance
 * @extends {UIBasicShapeElement}
 * @since 1.4.2-alpha6
 */

class UIRoundElement extends UIBasicShapeElement {
	toJSON () {
		return {
			type: "round",
			...super.toJSON()
		}
	}
}

module.exports = UIRoundElement;
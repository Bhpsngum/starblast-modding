'use strict';

const UIBasicShapeElement = require("./BasicShape.js");

/**
 * The UI Round Element instance
 * @class StarblastModding.UI.RoundElement
 * @extends {UIBasicShapeElement}
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
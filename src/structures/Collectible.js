'use strict';

const BaseEntity = require("./BaseEntity.js");
const limitedJSON = require("../utils/limitedJSON.js");
const CollectibleCodes = require("../utils/collectibleCodes.js");
const defineProperties = require("../utils/defineProperties.js");

/**
 * The Collectible Instance
 * @extends {BaseEntity}
 * @abstract
 */

class Collectible extends BaseEntity {
	constructor(game, api, options) {
		super(game, api);
		this.#game = game;

		/**
		 * Collectible code
		 * @name Collectible#code
		 * @type {number}
		 * @readonly
		 */

		defineProperties(this, {code: options?.code ?? CollectibleCodes[0]});
		let _this = this.modding.data;
		_this.x = options?.x ?? 0;
		_this.y = options?.y ?? 0;
		_this.vx = _this.vy = 0;
		_this.lastUpdatedStep = game.timer.step;
	}

	#game;

	toJSON () {
		return {
			...super.toJSON(),
			...limitedJSON(this, ["request_id", "code"])
		}
	}
}

defineProperties(Collectible.prototype, {
	structure_type: "collectible",
	inactive_field: "vaporized"
});

module.exports = Collectible

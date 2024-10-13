'use strict';

const limitedJSON = require("../utils/limitedJSON.js");
const Structure = require("./Structure.js");
const parseCoords = function (val, game) {
	if (!game?.options) return val;
	let hSize = game.options.map_size * 5, size = hSize * 2;
	val += hSize;
	return (val - Math.floor(val / size) * size) - hSize;
}

/**
 * Most basic class of entity without stats modification ability
 * @extends {Structure}
 * @abstract
 */

class BaseEntity extends Structure {
	constructor (game, api) {
		super(game, api);
		this.#game = game;
		this.#api = api;
	}

	#game;
	#api;
	#xStep;
	#yStep;
	#lastX = 0;
	#lastY = 0;

	entityUpdate (data, dontMarkSpawned = false) {
		if (!this.isSpawned() && !dontMarkSpawned) this.markAsSpawned();
		let _this = this.modding.data;
		_this.x = data.x;
		_this.y = data.y;
		_this.vx = data.sx;
		_this.vy = data.sy;
		_this.lastUpdatedStep = this.#game.timer.step
	}

	/**
	 * Entity X Position
	 * @type {number}
	 * @readonly
	 */

	get x () {
		if (this.#xStep !== this.#game.timer.step) {
			this.#xStep = this.#game.timer.step;
			let rawX = +(this.modding.data.x + (this.isSpawned() ? ((this.lastAliveStep - this.lastUpdatedStep) * this.vx) : 0)) || 0;
			this.#lastX = parseCoords(rawX, this.#game);
		}

		return this.#lastX;
	}

	/**
	 * Entity Y Position
	 * @type {number}
	 * @readonly
	 */

	get y () {
		if (this.#yStep !== this.#game.timer.step) {
			this.#yStep = this.#game.timer.step;
			let rawY = +(this.modding.data.y + (this.isSpawned() ? ((this.lastAliveStep - this.lastUpdatedStep) * this.vy) : 0)) || 0;
			this.#lastY = parseCoords(rawY, this.#game);
		}

		return this.#lastY;
	}

	/**
	 * Entity X Velocity
	 * @type {number}
	 * @readonly
	 */

	get vx () {
		return this.modding.data.vx
	}

	/**
	 * Entity Y Velocity
	 * @type {number}
	 * @readonly
	 */

	get vy () {
		return this.modding.data.vy
	}

	/**
	 * Entity last updated step
	 * @type {number}
	 * @readonly
	 */

	get lastUpdatedStep () {
		let step = this.modding.data.lastUpdatedStep;
		return (step == null || Number.isNaN(step)) ? -1 : Math.max(0, step);
	}

	toJSON () {
		return limitedJSON(this, ["x", "y", "vx", "vy"]);
	}
}

module.exports = BaseEntity

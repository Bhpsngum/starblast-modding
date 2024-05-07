'use strict';

const Structure = require("./Structure.js");
const parseCoords = function (val, game) {
	let hSize = game.options.map_size * 5, size = hSize * 2;
	val += hSize;
	return (val - Math.floor(val / size) * size) - hSize;
}

/**
 * The Entity Instance - represents any entity in the game
 * @extends {Structure}
 * @abstract
 */

class Entity extends Structure {
	constructor (game, api) {
		super(game, api);
		this.#game = game;
		this.#api = api;
	}

	#game;
	#api;

	/**
	 * Set the entity with given data
	 * @param {object} data - options to set to the entity
	 * @returns {Entity}
	 */

	set (data) {
		data = Object.assign({}, data);
		data.id = this.id;
		data.sx = data.vx;
		data.sy = data.vy;
		this.#api.name("set_"+this.structure_type).data(data).send();
		return this
	}

	/**
	 * Kill the entity
	 * @async
	 * @returns {Entity}
	 */

	kill () {
		return new Promise(function(resolve, reject) {
			this.#api.handlers.destroy.set(this.uuid, {resolve, reject});
			this.#api.name("set_"+this.structure_type).data({id: this.id, kill: true}).send(this.uuid, "destroy")
		}.bind(this))
	}

	entityUpdate (data) {
		if (this.isSpawned()) delete this.firstUpdate;
		else if (this.firstUpdate) {
			this.markAsSpawned();
			delete this.firstUpdate
		}
		else this.firstUpdate = true;
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
		let rawX = +(this.modding.data.x + (this.isSpawned() ? ((this.lastAliveStep - this.lastUpdatedStep) * this.vx) : 0)) || 0;
		return parseCoords(rawX, this.#game);
	}

	/**
	 * Entity Y Position
	 * @type {number}
	 * @readonly
	 */

	get y () {
		let rawY = +(this.modding.data.y + (this.isSpawned() ? ((this.lastAliveStep - this.lastUpdatedStep) * this.vy) : 0)) || 0;
		return parseCoords(rawY, this.#game);
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
		return Number.isNaN(step) ? -1 : Math.max(0, step);
	}
}

module.exports = Entity

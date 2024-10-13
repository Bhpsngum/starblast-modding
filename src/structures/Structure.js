'use strict';

const defineProperties = require("../utils/defineProperties.js");
const createUUID = require("../utils/createUUID.js");

/**
 * The Structure Instance - represents any structrure in the game
 * @abstract
 */

class Structure {
	constructor (game, api) {
		this.#game = game;
		this.#api = api;

		/**
		 * Custom object served for assigning data by the user
		 * @type {object}
		 */

		this.custom = {};

		/**
		 * Structure's UUID
		 * @name Structure#uuid
		 * @type {number}
		 * @readonly
		 */

		/**
		 * Structure's ID
		 * @name Structure#id
		 * @type {number}
		 * @readonly
		 */

		/**
		 * Structure's creation step
		 * @name Structure#createdStep
		 * @type {number}
		 * @readonly
		 */
		
		defineProperties(this, {modding: {data: {}}}, false);
		defineProperties(this, {uuid: createUUID()});
	}

	#game;
	#api;

	markAsInactive () {
		this.modding.data[this.inactive_field] = true;
		this.modding.data[this.inactive_field + "Step"] = this.modding.data.lastAliveStep = this.#game.timer.step;
	}

	markAsSpawned () {
		this.modding.data.spawned = true;
	}

	/**
	 * Check whether if the structure is still active or not
	 * @returns {boolean}
	 */

	isActive () {
		return this.isSpawned() && !this.modding.data[this.inactive_field];
	}

	/**
	 * Check whether if the structure is spawned or not
	 * @returns {boolean}
	 */

	isSpawned () {
		return !!this.modding.data.spawned;
	}

	/**
	 * Indicates whether the structure is alive or not
	 * @type {boolean}
	 * @readonly
	 */

	get alive () {
		return this.isActive()
	}

	/**
	 * The latest alive step of the structure (or null if the structure is never alive)
	 * @type {number | null}
	 * @readonly
	 */

	get lastAliveStep () {
		let alive = this.isActive() && this.alive;
		return (alive ? this.#game.timer.step : this.modding.data.lastAliveStep) ?? null;
	}

	toJSON () {
		return {
			...limitedJSON(this, ["id", "uuid", "alive", "createdStep"]),
			active: this.isActive(),
			spawned: this.isSpawned()
		}
	}
}

module.exports = Structure

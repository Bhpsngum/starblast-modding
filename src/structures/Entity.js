'use strict';

const MassRename = require("../utils/MassivePrototypeDefinition.js");
const BaseEntity = require("./BaseEntity.js");

/**
 * Represents any entity in the game, with ability to modify stats
 * @extends {BaseEntity}
 * @abstract
 */

class Entity extends BaseEntity {
	constructor (game, api) {
		super(game, api);
		this.#game = game;
		this.#api = api;
	}

	#game;
	#api;

	/**
	 * Set entity's X position
	 * @method Entity#setX
	 * @param {number} x - The X position to set
	 * @returns {Entity}
	 */

	/**
	 * Set entity's Y position
	 * @method Entity#setY
	 * @param {number} y - The Y position to set
	 * @returns {Entity}
	 */

	/**
	 * Set entity velocity along the x Axis
	 * @method Entity#setVx
	 * @param {number} vx - The velocity scalar value to set along the x Axis, can be negative
	 * @returns {Entity}
	 */

	/**
	 * Set entity velocity along the y Axis
	 * @method Entity#setVy
	 * @param {number} vy - The velovity scalar value to set along the y Axis, can be negative
	 * @returns {Entity}
	 */

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
}

MassRename(Entity, ["x", "y", "vx", "vy"]);

module.exports = Entity

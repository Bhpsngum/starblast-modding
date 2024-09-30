'use strict';

const ImmutableEntity = require("./ImmutableEntity.js");

/**
 * The Entity Instance - represents any mutable entity in the game
 * @extends {ImmutableEntity}
 * @abstract
 */

class Entity extends ImmutableEntity {
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
}

module.exports = Entity

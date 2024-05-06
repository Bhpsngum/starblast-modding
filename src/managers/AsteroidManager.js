'use strict';

const EntityManager = require("./EntityManager.js");
const Asteroid = require("../structures/Asteroid.js");

/**
 * The Asteroid Manager Instance.
 * @extends {EntityManager}
 * @abstract
 */

class AsteroidManager extends EntityManager {
	constructor(game, api) {
		super(game, api);
		this.#game = game;
	}

	#game;

	get limit () {
		return 300
	}

	[Symbol.toStringTag] = 'AsteroidManager';
	manager_name = "asteroid";
	StructureConstructor = Asteroid;
}

module.exports = AsteroidManager

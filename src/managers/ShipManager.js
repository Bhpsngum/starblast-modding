'use strict';

const EntityManager = require("./EntityManager.js");
const Ship = require("../structures/Ship.js");
const parseIntermission = require("../utils/parseIntermission.js");
const UIComponentManager = require("./UIComponentManager.js");

/**
 * The Ship Manager Instance.
 * @extends {EntityManager}
 * @abstract
 */

class ShipManager extends EntityManager {
	constructor(game, api) {
		super(game, api);
		this.#game = game;
		this.#api = api;
		this.#ui_components = new UIComponentManager(game, api, null);
	}

	#game;
	#api;
	#ui_components;

	async add () {
		throw new Error("Entity class 'ship' could not be added through the Modding API")
	}

	/**
	 * Shows instructor screen to every ships in the game
	 * @returns {ShipManager}
	 */

	showInstructor () {
		this.#api.globalMessage("show_instructor").send();
		return this
	}

	/**
	 * Says something to every ships in the game using instructor screen with given instructor
	 * @param {string} message - The message needs to be delivered
	 * @param {string} character - The instructor's name
	 * @returns {ShipManager}
	 */

	instructorSays (text, character) {
		this.#api.globalMessage("instructor_says", {
			text: text,
			character: character
		}).send();
		return this
	}

	/**
	 * Hide instructor screen from every ships in the game
	 * @returns {ShipManager}
	 */

	hideInstructor () {
		this.#api.globalMessage("hide_instructor").send();
		return this
	}

	/**
	 * Shows intermission to every ships in the game
	 * @param {object} data - message data
	 * @param {boolean} gameOver - to indicate if that intermission screen will gameover the player or not
	 * @returns {ShipManager}
	 * @since 1.0.4-alpha6
	 */

	intermission (data, gameOver) {
		this.#api.globalMessage("intermission", {data: parseIntermission(data, gameOver)}).send();
		return this
	}

	/**
	 * Show game over screen to every ships in the game
	 * @param {data} data - message data
	 * @returns {ShipManager}
	 */

	gameOver (data) {
		return this.intermission(data, true)
	}

	/**
	 * Show game over screen to every ships in the game
	 * @param {data} data - message data
	 * @returns {ShipManager}
	 */

	gameover (data) {
		return this.intermission(data, true)
	}

	update () {
		this.filterList();
		this.clear();
		this.all.forEach(ship => ship.isActive() && this._UUIDset(ship));
		return this
	}

	/**
	 * The global UI Component Manager
	 * @type {UIComponentManager}
	 * @readonly
	 * @since 1.4.2-alpha6
	 */

	get ui_components () {
		return this.#ui_components.update();
	}

	get limit () {
		return this.#game.options.max_players
	}

	[Symbol.toStringTag] = 'ShipManager';
	manager_name = "ship";
	StructureConstructor = Ship;
}

module.exports = ShipManager

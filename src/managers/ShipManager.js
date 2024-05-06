'use strict';

const EntityManager = require("./EntityManager.js");
const Ship = require("../structures/Ship.js");
const parseUI = require("../utils/parseUI.js");
const parseIntermission = require("../utils/parseIntermission.js");

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
	}

	#game;
	#api;

	async add () {
		throw new Error("Entity class 'ship' could not be added through the Modding API")
	}

	/**
	 * Shows instructor screen to every ships in the game
	 * @returns {Ship}
	 */

	showInstructor () {
		this.#api.globalMessage("show_instructor").send();
		return this
	}

	/**
	 * Says something to every ships in the game using instructor screen with given instructor
	 * @param {string} message - The message needs to be delivered
	 * @param {string} character - The instructor's name
	 * @returns {Ship}
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
	 * @returns {Ship}
	 */

	hideInstructor () {
		this.#api.globalMessage("hide_instructor").send();
		return this
	}

	/**
	 * Sets an UIComponent to every ships in the game
	 * @param {object} UIComponent - the UIComponent options
	 * @returns {Ship}
	 */

	setUIComponent (component) {
		this.#api.globalMessage("set_ui_component", {component: parseUI(component)}).send();
		return this
	}

	/**
	 * Shows intermission to every ships in the game
	 * @param {object} data - message data
	 * @param {boolean} gameOver - to indicate if that intermission screen will gameover the player or not
	 * @returns {Ship}
	 */

	intermission (data, gameOver) {
		this.#api.globalMessage("intermission", {data: parseIntermission(data, gameOver)}).send();
		return this
	}

	/**
	 * Show game over screen to every ships in the game
	 * @param {data} data - message data
	 * @returns {Ship}
	 */

	gameOver (data) {
		return this.intermission(data, true)
	}

	/**
	 * Show game over screen to every ships in the game
	 * @param {data} data - message data
	 * @returns {Ship}
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

	get limit () {
		return this.#game.options.max_players
	}

	[Symbol.toStringTag] = 'ShipManager';
	manager_name = "ship";
	StructureConstructor = Ship;
}

module.exports = ShipManager

'use strict';

const Entity = require("./Entity.js");
const MassRename = require("../utils/MassivePrototypeDefinition.js");
const limitedJSON = require("../utils/limitedJSON.js");
const defineProperties = require("../utils/defineProperties.js");
const parseIntermission = require("../utils/parseIntermission.js");
const UIComponentManager = require("../managers/UIComponentManager.js");
const convertStats = function(data) {
	if (isNaN(data)) return 0;
	let stats = [];
	for (let i = 0; i < 8; i++) {
		stats.push(15 & data); // equivalent to data % 16
		data = data >> 4 // equivalent to data = data / 16
	}
	return stats
}

/**
 * The Ship Instance
 * @extends {Entity}
 * @abstract
 */

class Ship extends Entity {
	constructor(game, api) {
		super(game, api);
		this.#game = game;
		this.#api = api;
		this.modding.data.ui_components = new UIComponentManager(game, api, this);
	}

	#game;
	#api;

	get alive () {
		return !!this.modding.data.alive
	}

	update (data, fromGameClient, markSpawn) {
		let _this = this.modding.data;
		if (fromGameClient) {
			_this.customization = data.customization;
			_this.hue = data.hue
		}
		else {
			this.entityUpdate(data, !markSpawn);
			_this.name = data.player_name;
			_this.angle = data.r * 180 / Math.PI; // convert from radian back to degree
			_this.idle = data.idle;
			_this.alive = data.alive;
			_this.type = data.type;
			_this.stats = convertStats(data.stats);
			_this.team = data.team;
			_this.score = data.score;
			_this.shield = data.shield;
			_this.generator = data.generator;
			_this.crystals = data.crystals;
			_this.healing = data.healing
		}
	}

	/**
	 * Show instructor screen to the ship
	 * @returns {Ship}
	 */

	showInstructor () {
		this.#api.clientMessage(this.id, "show_instructor").send();
		return this
	}

	/**
	 * Display message to the ship with instructor screen
	 * @param {string} text - the message to be delivered
	 * @param {string} character - the instructor character name
	 * @returns {Ship}
	 */

	instructorSays (text, character) {
		this.#api.clientMessage(this.id, "instructor_says", {text, character}).send();
		return this
	}

	/**
	 * Hide the instructor screen from the ship
	 * @returns {Ship}
	 */

	hideInstructor () {
		this.#api.clientMessage(this.id, "hide_instructor").send();
		return this
	}

	/**
	 * Show intermission screen to the ship
	 * @param {object} data - Data to show on the screen
	 * @param {boolean} gameOver - To indicate whether it's a gameover screen or not
	 * @returns {Ship}
	 */

	intermission (data, gameOver) {
		this.#api.clientMessage(this.id, "intermission", {data: parseIntermission(data, gameOver)}).send();
		return this
	}

	/**
	 * Show the gameover screen to the ship
	 * @param {object} data - Data to show on the screen
	 * @returns {Ship}
	 */

	gameover (data) {
		return this.intermission(data, true)
	}

	/**
	 * Show the gameover screen to the ship
	 * @param {object} data - Data to show on the screen
	 * @returns {Ship}
	 * @since 1.0.4-alpha6
	 */

	gameOver (data) {
		return this.intermission(data, true)
	}

	setObject (data) {
		this.#api.clientMessage(this.id, "set_object", {data}).send();
	}

	/**
	 * Empty the ship's weapons slot
	 * @returns {Ship}
	 */

	emptyWeapons () {
		this.#api.name("empty_weapons").prop("ship", this.id).send();
		return this
	}

	/**
	 * The UI Component Manager for this ship
	 * @type {UIComponentManager}
	 * @readonly
	 * @since 1.4.2-alpha6
	 */

	get ui_components () {
		return this.modding.data.ui_components.update();
	}

	/**
	 * Ship name
	 * @type {string}
	 * @readonly
	 */

	get name () {
		return this.modding.data.name
	}

	/**
	 * The ship's code whose player are on
	 * @type {number}
	 * @readonly
	 */

	get type () {
		return this.modding.data.type
	}

	/**
	 * Ship angle (in degrees)
	 * @type {number}
	 * @readonly
	 */

	get angle () {
		return this.modding.data.angle
	}

	/**
	 * Ship score
	 * @type {number}
	 * @readonly
	 */

	get score () {
		return this.modding.data.score
	}

	/**
	 * Indicates whether the ship is in idle mode or not
	 * @type {boolean}
	 * @readonly
	 */

	get idle () {
		return this.modding.data.idle
	}

	/**
	 * Ship shield
	 * @type {number}
	 * @readonly
	 */

	get shield () {
		return this.modding.data.shield
	}

	/**
	 * Ship generator's value
	 * @type {number}
	 * @readonly
	 */

	get generator () {
		return this.modding.data.generator
	}

	/**
	 * Indicates whether the ship is in healing mode or not
	 * @type {number}
	 * @readonly
	 */

	get healing () {
		return this.modding.data.healing
	}

	/**
	 * Ship crystals amount
	 * @type {number}
	 * @readonly
	 */

	get crystals () {
		return this.modding.data.crystals
	}

	/**
	 * Ship stats (specs upgrades)
	 * @type {array<number>}
	 * @readonly
	 */

	get stats () {
		return this.modding.data.stats
	}

	/**
	 * Ship team id
	 * @type {number}
	 * @readonly
	 */

	get team () {
		return this.modding.data.team ?? null
	}

	/**
	 * Ship hue. <br>Please note that is property is provided through an external loader, you should not read this on first-spawned event of ships.
	 * @type {number}
	 * @readonly
	 * @since 1.0.3-alpha6
	 */

	get hue () {
		return this.modding.data.hue ?? null
	}

	/**
	 * Ship customization, could be `null`. <br>Please note that is property is provided through an external loader, you should not read this on first-spawned event of ships.
	 * @type {object}
	 * @property {string} badge - Badge name of the ship, or `null` if the ship doesn't have any
	 * @property {string} finish - Finish name of the ship
	 * @property {number} hue - Initial hue when user joins the game
	 * @readonly
	 * @since 1.0.3-alpha6
	 */

	get customization () {
		return this.modding.data.customization ?? null
	}

	/**
	 * Set ship's X position
	 * @method Ship#setX
	 * @param {number} x - The X position to set
	 * @returns {Ship}
	 */

	/**
	 * Set ship's Y position
	 * @method Ship#setY
	 * @param {number} y - The Y position to set
	 * @returns {Ship}
	 */

	/**
	 * Set ship speed along the x Axis
	 * @method Ship#setVx
	 * @param {number} vx - The speed to set along the x Axis, can be negative
	 * @returns {Ship}
	 */

	/**
	 * Set ship speed along the y Axis
	 * @method Ship#setVy
	 * @param {number} vy - The speed to set along the y Axis, can be negative
	 * @returns {Ship}
	 */

	/**
	 * Set ship type
	 * @method Ship#setType
	 * @param {number} type - The type code to set
	 * @returns {Ship}
	 */

	/**
	 * Set ship angle
	 * @method Ship#setAngle
	 * @param {number} angle - The angle to set (in degree)
	 * @returns {Ship}
	 */

	/**
	 * Set ship score
	 * @method Ship#setScore
	 * @param {number} score - The score to set
	 * @returns {Ship}
	 */

	/**
	 * Set ship's idle state
	 * @method Ship#setIdle
	 * @param {boolean} idle - The idle state to set (`true` for true and vice versa)
	 * @returns {Ship}
	 */

	/**
	 * Set ship shield
	 * @method Ship#setShield
	 * @param {number} shield - The shield to set
	 * @returns {Ship}
	 */

	/**
	 * Set ship's generator capacity (the energy bar)
	 * @method Ship#setGenerator
	 * @param {number} generator - The generator capacity value to set
	 * @returns {Ship}
	 */

	/**
	 * Set ship's healing state
	 * @method Ship#setHealing
	 * @param {boolean} healing - The healing state to set (`true` for true and vice versa)
	 * @returns {Ship}
	 */

	/**
	 * Set ship's crystal amount
	 * @method Ship#setCrystals
	 * @param {number} crystals - The crystals amount to set
	 * @returns {Ship}
	 */

	/**
	 * Set ship stats
	 * @method Ship#setStats
	 * @param {number} stats - The stats number to set (8-digit number for 8 specs)
	 * @returns {Ship}
	 */

	/**
	 * Set ship's team
	 * @method Ship#setTeam
	 * @param {number} team - The id of the team to set
	 * @returns {Ship}
	 */

	/**
	 * Set ship's collider (ability to interact with game objects and ships)
	 * @method Ship#setCollider
	 * @param {boolean} collider - The collider state to set (`true` for true and vice versa)
	 * @returns {Ship}
	 */

	/**
	 * Set ship hue
	 * @method Ship#setHue
	 * @param {number} hue - The hue value to set
	 * @returns {Ship}
	 */

	toJSON () {
		return {
			...super.toJSON(),
			...limitedJSON(this, ["name", "type", "angle", "score", "idle", "shield", "generator", "healing", "crystals", "stats", "team", "hue", "customization"])
		}
	}
}

defineProperties(Ship.prototype, {
	structure_type: "ship",
	inactive_field: "disconnected"
});

MassRename(Ship, ["type", "angle", "score", "idle", "shield", "generator", "healing", "crystals", "stats", "team", "collider", "hue"]);

module.exports = Ship

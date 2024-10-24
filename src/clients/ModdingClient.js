'use strict';

const { EventEmitter } = require("node:events");
const defineProperties = require("../utils/defineProperties.js");
const toString = require("../utils/toString.js");
const StructureManager = require("../managers/StructureManager.js");
const packageInfo = require("../../package.json");
const managers = [
	{ path: ["ships"] },
	{ path: ["asteroids"] },
	{ path: ["aliens"] },
	{ path: ["collectibles"] },
	{ path: ["objects"] },
	{ path: ["objects", "types"] },
	{ path: ["teams"], },
	{ path: ["teams", "stations"] },
	{ path: ["teams", "stations"], mapper: v => v.modules }
];

const cloneObj = function (obj) {
	return JSON.parse(JSON.stringify(obj))
}

/**
 * The Modding Client Instance.
 * @extends {EventEmitter} - NodeJS {@link https://nodejs.org/api/events.html#class-eventemitter|EventEmitter} contsructor.
 * @param {object} options - options for calling the object. Note that if mod fails to start, all cached data are not erased.
 * @param {boolean} [options.cacheECPKey = false] - set to `true` if you want to reuse ECP Key for the next run, `false` otherwise
 * @param {boolean} [options.cacheOptions = false] - set to `true` if you want to reuse request options for the next run, `false` otherwise
 * @param {boolean} [options.cacheEvents = false] - set to `true` if you want to reuse all event handlers for the next run, `false` otherwise
 * @param {boolean} [options.compressWSMessages = false] - To decide whether to compress messages in WebSocket requests or not. `true` will use less bandwith but may also be CPU-intensive, and `false` will do the opposite.
 * @param {boolean} [options.extendedMode = false] - Whether to enable extended listener (which includes extended events and ship properties such as station-related events or ship customization)
 */

class ModdingClient extends EventEmitter {

	constructor (options) {
		super(options);
		this.#api = new (require("../rest/ModdingAPI.js"))(this, options);
	}

	#api;

	/**
	 * Indicates if the game is started or not.
	 * @type {boolean}
	 * @readonly
	 */

	get started () {
		return !!this.#api.started
	}

	/**
	 * Indicates if the game alredy started its process (sending starting request to server) or not.
	 * @type {boolean}
	 * @readonly
	 * @since 1.0.20-alpha6
	 */

	get processStarted () {
		return !!this.#api.processStarted
	}

	/**
	 * Indicates if the game is stopped or not.
	 * @type {boolean}
	 * @readonly
	 */

	get stopped () {
		return !!this.#api.stopped
	}

	/**
	 * Trigger the `onError` event.
	 * @param {string} message - Error message
	 * @returns {boolean}
	 */

	error (message) {
		return this.emit('error', (
			message instanceof Error ||
			(message != null && Object.prototype.toString.call(message) === '[object Error]')
		) ? message : new Error(message));
	}

	/**
	 * Trigger the `onLog` event.
	 * @param {...string} messages - Log messages strings
	 * @returns {boolean}
	 */

	log (...data) {
		return this.emit(this.#api.events.LOG, ...data)
	}

	/**
	 * Set the region of the client. If this is called when mod already started process, this will apply for next run
	 * @param {string} regionName - region name, must be either Asia, America or Europe
	 * @returns {ModdingClient}
	 */

	setRegion (region) {
		this.#api.setRegion(region);
		return this
	}

	/**
	 * Set the options for the modded game. If this is called when mod already started process, this will apply for next run
	 * @param {options} options - game options, same as `this.options` uses in browser modding
	 * @returns {ModdingClient}
	 */

	setOptions (options) {
		this.#api.setOptions(options);
		return this
	}

	/**
	 * Set the ECP key that client will use for requests. If this is called when mod already started process, this will apply for next run
	 * @param {string} ECPKey - The ECP key
	 * @returns {ModdingClient}
	 */

	setECPKey (ECPKey) {
		this.#api.setECPKey(ECPKey);
		return this
	}

	/**
	 * Configure the client. If this is called when mod already started process, this will apply for next run
	 * @param {object} options - An options object
	 * @param {object} options.options - Modded game options
	 * @param {string} options.region - Modded game region
	 * @param {string} options.ECPKey - ECP key
	 * @returns {ModdingClient}
	 */

	configure (options) {
		options = options || {};
		if ('region' in options) this.setRegion(options.region);
		if ('options' in options) this.setOptions(options.options);
		if ('ECPKey' in options) this.setECPKey(options.ECPKey);
		return this
	}

	/**
	 * Set the game state to "open"(true) (still attracts new players) or "closed"(false) (not attract new players)
	 * @param {boolean} isOpen - `true` to keep the game open, `false` otherwise.
	 * @returns {ModdingClient}
	 */

	setOpen (value) {
		this.#api.name("set_open").prop("value", value).send();
		return this
	}

	/**
	 * Set the custom map for the game
	 * @param {string} mapPattern - The map pattern
	 * @returns {ModdingClient}
	 */

	setCustomMap (map) {
		this.#api.name("set_custom_map").data(map).send();
		return this
	}

	/**
	 * Find a structrue based on its UUID
	 * @param {string} uuid - An UUID (Universal Unique Identifier) to search for
	 * @returns {Structure} - The structure object, `null` if not found any.
	 */

	findStructureByUUID (uuid, includeInactive = false) {
		Search: for (let keys of managers) {
			let manager = this;
			for (let key of keys.path) {
				manager = manager[key];
				if (manager == null) continue Search
			}
			if (!(manager instanceof StructureManager)) continue Search;
			if (includeInactive) manager = manager.all;
			manager = manager.toArray();
			if ("function" == typeof keys.mapper) manager = manager.map(keys.mapper);
			let results = manager.find(structure => Object.is(structure.uuid, uuid));
			if (results != null) return results
		}

		return null
	}

	/**
	 * Starts the game
	 * @param {object} options - Options Object, same as calling configure(options)
	 * @returns {string} Link of the game
	 */

	async start (options) {
		if (this.started) throw new Error("Mod already started");
		if (this.processStarted) throw new Error("Process is running. The mod will start soon");
		return await this.configure(options).#api.start()
	}

	/**
	 * Stops the game
	 * @returns {ModdingClient}
	 */

	async stop () {
		if (this.stopped) throw new Error("Mod already stopped");
		if (!this.processStarted) throw new Error("Process is not started yet");
		if (!this.started) throw new Error("Mod is not started yet");
		return await this.#api.stop()
	}

	/**
	 * This package version
	 * @type {string}
	 * @readonly
	 * @since 1.4.7-alpha6
	 */

	get version () {
		return packageInfo.version;
	}

	/**
	 * Returns a copy of the options object that was sent to the server from the start
	 * @type {object}
	 * @readonly
	 */

	get requestOptions () {
		return this.#api.getRequestOptions();
	}

	/**
	 * Game region for this modded game, or configured region if mod isn't started yet
	 * @type {string}
	 * @readonly
	 */

	get region () {
		return this.#api.getRegion();
	}

	/**
	 * The ship manager of the game
	 * @type {ShipManager}
	 * @readonly
	 */

	get ships () {
		return this.#api.mod_data.ships.update()
	}

	/**
	 * The alien manager of the game
	 * @type {AlienManager}
	 * @readonly
	 */

	get aliens () {
		return this.#api.mod_data.aliens.update()
	}

	/**
	 * The asteroid manager of the game
	 * @type {AsteroidManager}
	 * @readonly
	 */

	get asteroids () {
		return this.#api.mod_data.asteroids.update()
	}

	/**
	 * The collectible manager of the game
	 * @type {CollectibleManager}
	 * @readonly
	 */

	get collectibles () {
		return this.#api.mod_data.collectibles.update()
	}

	/**
	 * The object manager of the game
	 * @type {ObjectManager}
	 * @readonly
	 */

	get objects () {
		return this.#api.mod_data.objects.update()
	}

	/**
	 * The team manager of the game. Coule be `null` if the modded game is not team-based.
	 * @type {TeamManager}
	 * @readonly
	 */

	get teams () {
		return this.#api.mod_data.teams?.update?.() ?? null
	}

	/**
	 * The time manager (timer) of the game.
	 * @type {TimeManager}
	 * @readonly
	 * @since 1.0.17-alpha6
	 */

	get timer () {
		return this.#api.mod_data.timer
	}

	/**
	 * Returns a copy of game options object
	 * @type {object}
	 * @readonly
	 */

	get options () {
		let opts = this.#api.mod_data.options;
		return this.#api.mod_data.optionsLocked ? opts : cloneObj(opts);
	}

	/**
	 * Whether is the game is running (mod is already active)
	 * @returns {boolean}
	 */

	isRunning () {
		return this.#api.started && !this.#api.stopped;
	}

	/**
	 * The game link
	 * @type {string}
	 * @readonly
	 */

	get link () {
		let api = this.#api;
		return this.isRunning() ? "https://starblast.io/#" + api.id + "@" + api.ip + ":" + api.port : null;
	}
}

module.exports = ModdingClient

'use strict';

const ImmutableEntity = require("./ImmutableEntity.js");
const StationModuleManager = require("../managers/StationModuleManager.js");
const defineProperties = require("../utils/defineProperties.js");
const getAngle = function (phase, step) {
	return (phase / 180 + step / 60 / 3600 % 1 * 2) * Math.PI
}
const getRadius = function (game, api) {
	return (api.mod_data.teams?.stations?.all||[]).length > 1 ? game.options.map_size * 5 * Math.sqrt(2) / 2 : 0
}

/**
 * The Station Instance
 * @extends {ImmutableEntity}
 * @abstract
 */

class Station extends ImmutableEntity {
	constructor(game, api, options) {
		super(game, api);
		this.#game = game;
		this.#api = api;
		let size = Math.trunc(this.#game.options.station_size), _this = this.modding.data;
		_this.size = isNaN(size) || size < 1 || size > 5 ? 2 : size;
		let modules = new StationModuleManager(this.#game, this.#api, this);
		(Array.isArray(options?.modules) ? options.modules : []).forEach(modul => modules.insert(modules.create(modul, this)));

		/**
		 * Station name
		 * @name Station#name
		 * @type {string}
		 * @readonly
		 */

		/**
		 * Station team id
		 * @name Station#team
		 * @type {number}
		 * @readonly
		 */

		/**
		 * Station modules list
		 * @name Station#modules
		 * @type {StationModuleManager}
		 * @readonly
		 */

		/**
		 * Station phase (in degrees)
		 * @name Station#phase
		 * @type {string}
		 * @readonly
		 */

		defineProperties(this, {
			name: "string" == typeof options?.name ? options.name : "Unknown",
			id: options?.id,
			team: options?.id,
			modules,
			phase: options?.phase * 180 / Math.PI
		});
		this.markAsSpawned();
		this.updateInfo({
			level: Math.max(Math.trunc(options?.level), 1) || 1,
			crystals: Math.max(options?.crystals, 0) || 0
		});
	}

	#game;
	#api;

	updateInfo (data) {
		let _this = this.modding.data;
		_this.level = data?.level;
		_this.crystals = data?.crystals;
		_this.crystals_max = this.#game.options.crystal_capacity[_this.level - 1];
		this.modules.updateShield(data?.modules_shield);
		_this.lastUpdatedStep = this.#game.timer.step;
		if (this.isActive() && null == this.modules.array(true).find(modul => modul.isActive() && modul.alive)) {
			this.markAsInactive();
			this.modules.all.forEach(modul => modul.isActive() && modul.markAsInactive());
			this.#game.emit(this.#api.events.STATION_DESTROYED, this);
		}
	}

	get x () {
		return getRadius(this.#game, this.#api) * Math.cos(getAngle(this.phase, this.lastAliveStep))
	}

	get y () {
		return getRadius(this.#game, this.#api) * Math.sin(getAngle(this.phase, this.lastAliveStep))
	}

	get vx () {
		let phase = this.phase, step = this.lastAliveStep;
		return getRadius(this.#game, this.#api) * (Math.cos(getAngle(phase, step + 1)) - Math.cos(getAngle(phase, step)))
	}

	get vy () {
		let phase = this.phase, step = this.lastAliveStep;
		return getRadius(this.#game, this.#api) * (Math.sin(getAngle(phase, step + 1)) - Math.sin(getAngle(phase, step)))
	}

	/**
	 * Station size
	 * @type {number}
	 * @readonly
	 */

	get size () {
		return this.modding.data.size
	}

	/**
	 * Station level
	 * @type {number}
	 * @readonly
	 */

	get level () {
		return this.modding.data.level
	}

	/**
	 * Station crystals progress
	 * @type {number}
	 * @readonly
	 */

	get crystals () {
		return this.modding.data.crystals
	}

	/**
	 * Station's maximum crystals for that level
	 * @type {number}
	 * @readonly
	 */

	get crystals_max () {
		return this.modding.data.crystals_max
	}
}

defineProperties(Station.prototype, {
	structure_type: "station",
	inactive_field: "destroyed"
});

module.exports = Station

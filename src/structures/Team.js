'use strict';

const Structure = require("./Structure.js");
const Station = require("./Station.js");
const limitedJSON = require("../utils/limitedJSON.js");
const defineProperties = require("../utils/defineProperties.js");

/**
 * The Team Instance
 * @extends {Structure}
 * @abstract
 */

class Team extends Structure {
	constructor(game, api, options) {
		super(game, api);
		this.#game = game;
		this.markAsSpawned();

		/**
		 * Team faction name
		 * @name Team#faction
		 * @type {string}
		 * @readonly
		 */

		/**
		 * Team station
		 * @name Team#station
		 * @type {Station}
		 * @readonly
		 */

		/**
		 * Team hue
		 * @name Team#hue
		 * @type {number}
		 * @readonly
		 */

		defineProperties(this, {
			id: options.id,
			hue: options.hue || 0,
			createdStep: 0,
			faction: "string" == typeof options.faction ? options.faction : "Unknown",
			station: new Station(game, api, {
				...(options.station || {}),
				team: this
			})
		});
		let _this = this.modding.data;
		_this.open = true
	}

	#game;

	updateInfo (data) {
		let _this = this.modding.data;
		_this.open = !!data?.open
	}

	update () {
		
	}

	/**
	 * Indicates whether the team is open (accepting more players) or not
	 * @type {boolean}
	 * @readonly
	 */

	get open () {
		return this.modding.data.open
	}

	toJSON () {
		return {
			...super.toJSON(),
			...limitedJSON(this, ["faction", "station", "open", "class", "offsetX", "offsetY", "offsetVx", "offsetVy", "angle", "shield", "finish"])
		}
	}
}

defineProperties(Team.prototype, {
	structure_type: "team",
	inactive_field: "eliminated"
});

module.exports = Team

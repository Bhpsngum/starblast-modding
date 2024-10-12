'use strict';

const StructureManager = require("./StructureManager.js");
const Team = require("../structures/Team.js");
const getEntity = require("../utils/getEntity.js");
const defineProperties = require("../utils/defineProperties.js");

/**
 * The Team Manager Instance.
 * @extends {StructureManager}
 * @abstract
 */

class TeamManager extends StructureManager {
	constructor(game, api) {
		super(game, api);
		this.#game = game;
		this.#api = api;
	}

	#game;
	#api;

	socketUpdate (dataView) {
		let size = Math.round(dataView.byteLength/this.all.length);
		for (let i = 0; i < this.all.length; i++) {
			let team = getEntity(this.#game, {id: i}, this), station = team.station, index = i * size;
			team.updateInfo({
				open: dataView.getUint8(index) > 0
			});
			station.updateInfo({
				level: dataView.getUint8(index + 1) + 1,
				crystals: dataView.getUint32(index + 2, true),
				modules_shield: new DataView(dataView.buffer.slice(index + 7, index + size))
			});
			if (team.isActive() && !station.isActive()) team.markAsInactive();
		}
		this.update()
	}

	update () {
		this.filterList().clear();
		this.all.forEach(team => team.isActive() && this._UUIDset(team));
		return this
	}

	get limit () {
		return this.#game.options.friendly_colors
	}

	[Symbol.toStringTag] = 'TeamManager';
	StructureConstructor = Team;
	manager_name = "team"
}

module.exports = TeamManager

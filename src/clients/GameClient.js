'use strict';

const GameSocket = require("../utils/GameSocket.js");
const TeamManager = require("../managers/TeamManager.js");
const getEntity = require("../utils/getEntity.js");
const defineProperties = require("../utils/defineProperties.js");
const readBinaries = function (data, game) {
	let dataView = new DataView(data), eventID = dataView.getUint8(0);
	dataView = new DataView(data.slice(1));
	switch (eventID) {
		case eventIDs.STATION_UPDATE:
			game.teams.socketUpdate(dataView);
			break;
	}
}
const eventIDs = {
	STATION_UPDATE: 205
}

class GameClient {
	constructor(game, api) {
		this.#game = game;
		this.#api = api;
	}

	#game;
	#api

	connect (ip, id, port, joinPacketName) {
		let socket = GameSocket.create(ip, port, null, this.#api.compressWSMessages), interval, game = this.#game, api = this.#api;
		socket.on("open", function () {
			this.send(JSON.stringify({
				name: joinPacketName,
				data: {
					player_name: "starblast-modding",
					preferred: id
				}
			}))
		});
		socket.on("message", function (event, isBinary) {
			if (!game.started || game.stopped) return socket.close();
			if (!isBinary) {
				let parsed;
				try { parsed = JSON.parse(event.toString()) ?? {} } catch (e) { parsed = {} }
				let data = parsed.data
				switch (parsed.name) {
					case "welcome":
						Object.assign(api.mod_data.options, {
							map_name: data.name,
							map_id: data.seed
						});
						this.socket = socket;
						for (let ship of game.ships) socket.send(JSON.stringify({
							name: "get_name",
							data: {
								id: ship.id
							}
						}));
						interval = setInterval(function(){socket.send(0)}, 1000);
						break;
					case "player_name":
						data.customization = defineProperties({}, {
							badge: data.custom?.badge ?? null,
							finish: data.custom?.finish ?? "zinc",
							laser: data.custom?.laser ?? "0"
						});
						getEntity(game, data, game.ships).update(data, true);
						break;
				}
			}
			else try {
				if ("function" == typeof event.arrayBuffer) event.arrayBuffer().then(e => readBinaries.call(this, e, game));
				else readBinaries.call(this, event.buffer.slice(event.byteOffset, event.byteOffset + event.byteLength), game)
			} catch (e) {}
		}.bind(this));
		socket.on("close", function () {
			if (interval != null) clearInterval(interval)
		})
	}

	initTeamStats () {
		let teams = JSON.parse(JSON.stringify(this.#game.options.teams ?? null));
		if (Array.isArray(teams)) {
			let teamManager = new TeamManager(this.#game, this.#api);
			teamManager.insert(...teams.map((team, i) => Object.assign({}, team, {id: i})));
			this.#api.mod_data.teams = teamManager
		}
	}
}

module.exports = GameClient

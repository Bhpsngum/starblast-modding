'use strict';

const GameSocket = require("../utils/GameSocket.js");
const GameClient = require("../clients/GameClient.js");
const getEntity = require("../utils/getEntity.js");
const events = require("../resources/Events.js");
const defineProperties = require("../utils/defineProperties.js");
const getJoinPacketName = require("../utils/getJoinPacketName.js");

module.exports.create = function (api, address, token) {
	if (api.encodeOptionsError) {
		api.game.error("Failed to encode game options");
		api.game.error("Mod will be run with empty options instead")
	}
	delete api.encodeOptionsError
	let socket = GameSocket.create(address.ip, address.port, "https://starblast.data.neuronality.com", api.compressWSMessages);
	socket.on("open", function() {
		this.send(JSON.stringify({
			name: "run_mod",
			data: {
				token: token,
				options: api.configuration.options
			}
		}))
	});
	return new Promise(function (resolve, reject) {
		socket.on("message", function(event, isBinary) {
			if (!isBinary) {
				try { event = JSON.parse(event.toString()) ?? {} } catch (e) { event = {} }
				let data = event.data;
				switch (event.name) {
					case "mod_started":
						Object.assign(api, {
							socket: socket,
							ip: address.ip,
							id: data.id,
							port: address.port,
							started: true,
							stopped: false
						});
						for (let key of ["map_name", "map_id"]) delete data.options[key]; // in GameClient.js
						api.mod_data.options = data.options;
						getJoinPacketName().then(packet => {
							api.gameClient.connect(address.ip, data.id, address.port, packet);
							api.gameClient.initTeamStats();
						}).catch(e => this.error("Failed to establish extensive connection to the game. Customization and extended team data might not be available."));
						while (api.preflight_requests.length > 0) api.set(api.preflight_requests.shift()).send();
						resolve(this.link);
						this.emit(events.MOD_STARTED, this.link, this.options);
						break;
					case "tick":
						api.mod_data.step = data.step;
						for (let key of ["aliens", "asteroids", "collectibles", "ships", "objects", "teams"]) api.mod_data[key]?.update?.(true);
						api.updateTimer();
						this.emit(events.TICK, data.step);
						break;
					case "alien_created":
					case "asteroid_created":
					case "collectible_created": {
						let entity_name = event.name.split("_")[0], entityList = this[entity_name + "s"], uuid = event.request_id;
						let entity = entityList.array(true).find(entity => {
							if (entityList.isInstance(entity)) {
								try { entity.id = null } catch(e) {}
								return entity.id == null && entity.request_id === uuid
							}
							return false
						});
						if (entity == null) {
							entity = entityList.create(event);
							entityList.insert(entity)
						}
						defineProperties(entity, {
							id: event.id,
							createdStep: Math.max(this.timer.step, 0),
						});
						entity.markAsSpawned();
						entity.modding.data.lastUpdatedStep = this.timer.step;
						entityList.update();
						let createReqs = api.create_requests.splice(0);
						api.create_requests.push(...createReqs.filter(uid => !Object.is(uid, uuid)));
						let resolve = api.handlers.create.get(uuid)?.resolve;
						api.handlers.create.delete(uuid);
						resolve?.(entity);
						this.emit(events[event.name.toUpperCase()], entity);
						break;
					}
					case "ship_update": {
						let ship = getEntity(api.game, event, this.ships);
						if (!ship.isSpawned()) this.objects.forEach(object => api.clientMessage(ship.id, "set_object", {object: object}).send())
						ship.update(event);
						break;
					}
					case "alien_update":
					case "asteroid_update":
						getEntity(api.game, event, this[event.name.split("_")[0] + "s"]).update(event);
						break;
					case "ship_disconnected": {
						let ship = getEntity(api.game, event, this.ships);
						ship.markAsInactive();
						this.ships.update();
						this.emit(events.SHIP_DISCONNECTED, ship);
						break;
					}
					case "error": {
						let error = new Error(event.text);
						switch(event.text) {
							case "Incorrect data":
							case "Too many aliens":
							case "Too many asteroids":
							case "Too many Collectibles":
								let uuid = api.create_requests.shift();
								let handler = api.handlers.create;
								let reject = handler.get(uuid)?.reject
								handler.delete(uuid);
								this.findStructureByUUID(uuid, true)?.markAsInactive?.();
								reject?.(error);
								break;
							default:
								this.error(event.text)
						}
						break
					}
					case "event":
						switch (data.name) {
							case "ship_destroyed": {
								data.id = data.ship;
								let ship = getEntity(api.game, data, this.ships);
								let killer = this.ships.findById(data.killer, true);
								ship.modding.data.alive = false;
								ship.modding.data.lastAliveStep = this.timer.step;
								let uuid = ship.uuid, handler = api.handlers.destroy, resolve = handler.get(uuid)?.resolve;
								handler.delete(uuid);
								resolve?.(ship);
								this.emit(events.SHIP_DESTROYED, ship, killer);
								break;
							}
							case "alien_destroyed":
							case "asteroid_destroyed": {
								let entity_name = data.name.split("_")[0], entityList = this[entity_name + "s"];
								data.id = data[entity_name];
								let entity = getEntity(api.game, data, entityList);
								let killer = this.ships.findById(data.killer, true);
								entity.markAsInactive();
								entityList.update();
								let uuid = entity.uuid, handler = api.handlers.destroy, resolve = handler.get(uuid)?.resolve;
								handler.delete(uuid);
								resolve?.(entity);
								this.emit(events[entity_name.toUpperCase()], entity, killer);
								break;
							}
							case "ship_spawned": {
								data.id = data.ship;
								let ship = getEntity(api.game, data, this.ships);
								let event_name = ship.isSpawned() ? events.SHIP_SPAWNED : events.SHIP_RESPAWNED;
								if (!ship.isSpawned()) ship.markAsSpawned();
								this.ships.update();
								this.emit(event_name, ship);
								break;
							}
							case "collectible_picked": {
								data.id = data.collectible;
								let collectible = getEntity(api.game, data, this.collectibles);
								data.id = data.ship;
								let ship = getEntity(api.game, data, this.ships);
								collectible.markAsInactive();
								this.emit(events.COLLECTIBLE_PICKED, collectible, ship);
								break;
							}
							case "ui_component_clicked":
								let id = data.id;
								data.id = data.ship;
								this.emit(events.UI_COMPONENT_CLICKED, id, getEntity(api.game, data, this.ships));
								break;
						}
						break;
				}
			}
		}.bind(api.game));
		socket.on("close", function () {
			if (GameSocket.OPEN === api.gameClient.socket?.readyState) api.gameClient.socket.close();
			let isStarted = this.started;
			api.clientReset(this);
			if (!isStarted) reject(new Error("Failed to run the mod"));
			this.emit(events.MOD_STOPPED);
		}.bind(api.game))
	}.bind(api))
}

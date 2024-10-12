'use strict';

const GameSocket = require("../utils/GameSocket.js");
const getEntity = require("../utils/getEntity.js");
const events = require("../resources/Events.js");
const defineProperties = require("../utils/defineProperties.js");
const getJoinPacketName = require("../utils/getJoinPacketName.js");

const standard_modes = ["survival", "team", "invasion", "deathmatch", "battleroyale"];

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
						let evt, args, spawned = ship.isSpawned(), isStandardMode = standard_modes.includes(api.game.options.root_mode);
						if (!spawned && !ship.modding.data.initialized) {
							this.objects.forEach(object => api.clientMessage(ship.id, "set_object", {object: object}).send());
							this.ships.ui_components.forEach(component => component.persistent && api.clientMessage(ship.id, "set_ui_component", { component: component.raw.backup }).send());
							ship.modding.data.initialized = true;
						}
						// support some missing ship events in standard modes
						if (isStandardMode) {
							if (spawned) {
								if (ship.alive) {
									if (!event.alive) {
										evt = events.SHIP_DESTROYED;
										args = [ship, null];
									}
								}
								else if (event.alive) {
									evt = events.SHIP_RESPAWNED;
									args = [ship];
								}
							}
							else {
								evt = events.SHIP_SPAWNED;
								args = [ship];
							}
						}
						// somehow ship update packet comes first before the spawning event packet
						// do this to prevent any first update packet to overwrite spawned status
						ship.update(event, false, isStandardMode);
						if (evt) this.emit(evt, ...args);
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
								let event_name = events.SHIP_RESPAWNED;
								if (!ship.isSpawned()) {
									ship.markAsSpawned();
									event_name = events.SHIP_SPAWNED;
								}
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
								let ship = getEntity(api.game, data, this.ships);
								let ship_component = ship.ui_components.findById(id);
								if (ship_component?.raw?.lastClickable) {
									this.emit(events.UI_COMPONENT_CLICKED, ship_component, ship);
								}
								else {
									let global_component = this.ships.ui_components.findById(id);
									if (global_component?.raw?.lastClickable) this.emit(events.UI_COMPONENT_CLICKED, global_component, ship);
								}
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
			console.log("Stopped");
			this.emit(events.MOD_STOPPED);
		}.bind(api.game))
	}.bind(api))
}

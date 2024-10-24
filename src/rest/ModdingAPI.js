'use strict';

const runMod = require("../utils/runMod.js");
const deepFreeze = require("../utils/deepFreeze.js");

class ModdingAPI {
	constructor(game, options) {
		this.game = game;
		this.cacheECPKey = !!options?.cacheECPKey;
		this.cacheOptions = !!options?.cacheOptions;
		this.cacheEvents = !!options?.cacheEvents;
		this.compressWSMessages = !!options?.compressWSMessages;
		this.extendedMode = !!options?.extendedMode;
		this.gameClient = new (require("../clients/GameClient.js"))(this.game, this);
		this.events = require("../resources/Events.js");
		this.handlers = {
			create: new Map(),
			destroy: new Map()
		}
		this.configuration = {};
		this.create_requests = [];
		this.mod_data = {};
		this.stopHandlers = [];
		this.instanced = {};
		this.clientReset(this.game);
		this.stopped = false;
	}

	clear () {
		return this.set()
	}

	setOptions (options) {
		let setup = (this.processStarted ? this.instanced : this.configuration);
		return setup.options = options;
	}

	setRegion (region) {
		let setup = (this.processStarted ? this.instanced : this.configuration);
		return setup.region = region;
	}

	setECPKey (ECPKey) {
		let setup = (this.processStarted ? this.instanced : this.configuration);
		return setup.ECPKey = ECPKey;
	}

	getRequestOptions () {
		return this.configuration.options
	}

	getRegion () {
		return this.configuration.region
	}

	reset (skipStop = false) {
		this.started = false;
		this.stopped = true;
		this.processStarted = false;
		this.preflight_requests = [];
		this.gameClient.socket = null;
		this.clear();

		if (!this.cacheECPKey && !skipStop) delete this.configuration.ECPKey;
		else this.configuration.ECPKey = this.instanced.ECPKey;

		if (!this.cacheOptions && !skipStop) delete this.configuration.options;
		else this.configuration.options = this.instanced.options;

		this.configuration.region = this.instanced.region;

		if (!this.cacheEvents && !skipStop) this.game.removeAllListeners();

		while (this.stopHandlers.length > 0) {
			let { resolve } = this.stopHandlers.shift();
			resolve?.(this.game);
		}
	}

	async start () {
		try {
			this.configuration.options = deepFreeze(JSON.parse(JSON.stringify(this.configuration.options ?? {})));
			this.encodeOptionsError = false
		}
		catch (e) {
			this.configuration.options = deepFreeze({});
			this.encodeOptionsError = true
		}
		this.processStarted = true;
		this.stopTriggered = false;
		Object.assign(this.instanced, {
			region: this.configuration.region,
			options: this.configuration.options,
			ECPKey: this.configuration.ECPKey
		});
		try {
			return await runMod(this);
		}
		catch (e) {
			this.reset(true);
			throw e;
		}
	}

	stop () {
		return new Promise(function(resolve, reject) {
			this.stopHandlers.push({resolve, reject});
			this.name("stop").send(null, "stop")
		}.bind(this))
	}

	name (name) {
		return this.prop("name", name);
	}

	set (data) {
		this.pending_request = Object.assign({}, data);
		return this
	}

	prop (name, data) {
		this.pending_request[name] = data;
		return this
	}

	data (...data) {
		let pData = data[0] ?? {};
		Object.assign(pData, ...data.slice(1));
		return this.prop("data", pData)
	}

	clientMessage (id, name, data) {
		this.name("client_message");
		data = Object.assign({}, data, { name });
		return this.data({id, data})
	}

	globalMessage (name, data) {
		return this.clientMessage(null, name, data)
	}

	send (uuid, action) {
		let pr = this.pending_request;
		if (this.started) try {
			this.socket.send(JSON.stringify(pr));
			if ("string" == typeof pr.name && pr.name.match(/^add_(alien|asteroid|collectible)$/)) this.create_requests.push(pr.data.uuid)
		}
		catch(e) {
			if (arguments.length > 0) {
				let error = new Error("Failed to encode request"), globalMessage;
				switch (action) {
					case "create":
					case "destroy": {
						let handler = this.handlers[action], reject = handler.get(uuid)?.reject;
						handler.delete(uuid);
						this.game.findStructureByUUID(uuid)?.markAsInactive?.();
						reject?.(error);
						break;
					}
					case "stop": {
						while (this.stopHandlers.length > 0) {
							let { reject } = this.stopHandlers.shift();
							reject?.(error);
						}
						break;
					}
					default:
						globalMessage = 1;
				}
				if (globalMessage) this.game.emit('error', error, this.game)
			}
		}
		else this.preflight_requests.push(pr);
		return this.clear()
	}

	clientReset (client) {

		/**
		 * Custom object served for assigning data by the user
		 * @name ModdingClient.prototype.custom
		 * @type {object}
		 */

		client.custom = {};
		let stopError = new Error("Mod had stopped before the action could be completed");
		for (let key of ["create", "destroy"]) {
			let handlers = [...this.handlers[key].entries()];
			this.handlers[key].clear();
			for (let handler of handlers) handler[1]?.reject?.(stopError)
		}
		this.create_requests.splice(0);
		Object.assign(this.mod_data, {
			aliens: new (require("../managers/AlienManager.js"))(client, this),
			asteroids: new (require("../managers/AsteroidManager.js"))(client, this),
			collectibles: new (require("../managers/CollectibleManager.js"))(client, this),
			ships: new (require("../managers/ShipManager.js"))(client, this),
			objects: new (require("../managers/ObjectManager.js"))(client, this),
			timer: new (require("../managers/TimeManager.js"))(client, this),
			teams: null,
			options: null,
			step: -1
		});
		this.reset();
	}

	triggerStopEvent () {
		if (this.stopTriggered) return;
		this.stopTriggered = true;
		let isStarted = this.game.started;
		if (!isStarted) this.lastRejectHandler?.call?.(this.game, new Error("Failed to run the mod"));
		this.game.emit(this.events.MOD_STOPPED, this.game);
		this.clientReset(this.game);
	}
}

module.exports = ModdingAPI

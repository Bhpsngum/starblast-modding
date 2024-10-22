const fs = require('fs').promises;

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

const ModdingEvents = require("../resources/Events.js");

const ModdingClient = require("./ModdingClient.js");

const Game = require("../utils/Game.js");

const URLFetcher = require("../utils/URLFetcher.js");

const toString = require("../utils/toString.js");

const NodeVM = require("node:vm");

const format_open_regex = /\[\[[usoibg!@]*;[^\[]*?;[^\[]*?\]/;
const format_end_regex = /\\*\]/;

const strip_formatting = function (str) {
	// why do people love making text colors bruh
	// strip formatting strings from text (e.g [[bg;#fff;]Example])

	let match, stacks = 0, startIndex = -1;

	// remove string format opener and count stacks
	while (match = str.match(format_open_regex)) {
		let { index } = match;
		++stacks;
		if (startIndex === -1) startIndex = index;
		str = str.slice(0, index) + str.slice(index + match[0].length);
	}

	// replace string format ending
	if (stacks > 0) {
		let first = str.slice(0, startIndex), rest = str.slice(startIndex);
		while (stacks > 0 && (match = rest.match(format_end_regex))) {
			let { index } = match;
			let sub = match[0].slice(0, -1);
			first += rest.slice(0, index) + sub.slice(1);
			if (sub.length % 2 == 0) --stacks;
			else first += "]";
			rest = rest.slice(index + match[0].length);
		}
		
		str = first + rest;
	}
	
	return str;
}

/**
 * The Browser Client Instance for supporting mod codes running in Browser Modding. <br><b>Warning: </b><br><ul><li>This client doesn't support undocumented features like accessing through `game.modding`, etc. </li><li>Some of the latest features of the new ModdingClient (which may not work in browsers) will be available. </li><li>Using Promise-related functionalities (including async/await) in your mod code is highly DISCOURAGED since NodeJS VM doesn't work well with Promise, and will likely crash or hang the running mod.</li>
 * @param {object} options - options for calling the object. <br><b>Note that</b> if both one property and its aliases exist on the object, the value of the main one will be chosen
 * @param {boolean} [options.cacheECPKey = false] - same with option specified at {@link ModdingClient}
 * @param {boolean} [options.extendedMode = false] - same with option specified at {@link ModdingClient}
 * @param {boolean} [options.sameCodeExecution = false] - loading the same code will trigger the execution or not. <br><b>Note:</b> This feature only works when you call `loadCodeFromString`, `loadCodeFromLocal` or `loadCodeFromExternal` methods, and not during the auto-update process
 * @param {boolean} [options.crashOnException = false] - when tick or event function, or mod code execution fails, the mod will crash
 * @param {boolean} options.crashOnError - alias of the property `options.crashOnException`
 * @param {boolean} [options.logErrors = true] - game will log any errors or not
 * @param {boolean} options.logExceptions - alias of the property `options.logErrors`
 * @param {boolean} [options.logMessages = true] - game will log any in-game logs or not
 * @param {boolean} [options.compressWSMessages = false] - same with option specified at {@link ModdingClient}
 */

class BrowserClient {
	constructor(options) {
		this.#sameCodeExecution = !!options?.sameCodeExecution;
		let logErrors = this.#logErrors = !!(options?.logErrors ?? options.logExceptions ?? true);
		let logMessages = this.#logMessages = !!(options?.logMessages ?? true);
		let crashOnError = this.#crashOnError = !!(options?.crashOnException ?? options?.crashOnError);
		let node = this.#node = new ModdingClient({...options, cacheEvents: true, cacheOptions: false});

		this.#vmContext = NodeVM.createContext({
			console
		}, {
			name: "Mod Context (BrowserClient VM)"
		});

		Object.defineProperty(this.#vmContext, 'window', {
			enumerable: true,
			configurable: false,
			get () { return this},
			set (val) { return val }
		});

		let handle = function (spec, ...params) {
			let context = this.#modding.context;
			this.#handle(context?.[spec]?.bind(context), ...params)
		}.bind(this);

		node.on(ModdingEvents.TICK, (tick) => {
			this.#handle(this.#modding?.tick?.bind?.(this.#modding), tick);
		});

		// events

		node.on(ModdingEvents.ERROR, function(error) {
			if (logErrors) console.error("[In-game Error]", error)
		});

		node.on(ModdingEvents.LOG, function(...args) {
			if (logMessages) console.log("[In-game Log]", ...args)
		});

		node.on(ModdingEvents.MOD_STARTED, function (link) {
			node.log("Mod started");
			node.log(link);
			handle('event', {name: "mod_started", link})
		});

		node.on(ModdingEvents.MOD_STOPPED, () => {
			this.#clearWatch();
			this.#lastCode = null;
			node.log("Mod stopped");
			handle('event', {name: "mod_stopped"})
		});

		node.on(ModdingEvents.SHIP_RESPAWNED, function(ship) {
			handle('event', {name: "ship_spawned", ship})
		});

		node.on(ModdingEvents.SHIP_SPAWNED, function(ship) {
			handle('event', {name: "ship_spawned", ship})
		});

		node.on(ModdingEvents.SHIP_DESTROYED, function(ship, killer) {
			handle('event', {name: "ship_destroyed", ship, killer})
		});

		node.on(ModdingEvents.SHIP_DISCONNECTED, function(ship) {
			handle('event', {name: "ship_disconnected", ship})
		});

		node.on(ModdingEvents.ALIEN_CREATED, function(alien) {
			handle('event', {name: "alien_created", alien})
		});

		node.on(ModdingEvents.ALIEN_DESTROYED, function(alien, killer) {
			handle('event', {name: "alien_destroyed", alien, killer})
		});

		node.on(ModdingEvents.ASTEROID_CREATED, function(asteroid) {
			handle('event', {name: "asteroid_created", asteroid})
		});
		node.on(ModdingEvents.ASTEROID_DESTROYED, function(asteroid, killer) {
			handle('event', {name: "asteroid_destroyed", asteroid, killer})
		});

		node.on(ModdingEvents.COLLECTIBLE_CREATED, function(collectible) {
			handle('event', {name: "collectible_created", collectible})
		});

		node.on(ModdingEvents.COLLECTIBLE_PICKED, function(collectible, ship) {
			handle('event', {name: "collectible_picked", collectible, ship})
		});

		node.on(ModdingEvents.STATION_DESTROYED, function(station) {
			handle('event', {name: "station_destroyed", station})
		});

		node.on(ModdingEvents.STATION_MODULE_DESTROYED, function(module) {
			handle('event', {name: "station_module_destroyed", module})
		});

		node.on(ModdingEvents.STATION_MODULE_REPAIRED, function(module) {
			handle('event', {name: "station_module_repaired", module})
		});

		node.on(ModdingEvents.UI_COMPONENT_CLICKED, function ({ id }, ship) {
			handle('event', {name: "ui_component_clicked", id, ship})
		});
	}

	#vmContext;
	#modding = {
		terminal: {
			echo: (item) => this.#node.log(strip_formatting(toString(item))),
			error: (item) => this.#node.error(item)
		},
		commands: {
			clear: () => console.clear(),
			start: async () => void await this.start(),
			stop: async () => void await this.stop(),
			test: () => {
				if (!this.#node.started) throw new Error("Mod isn't started. Use 'start' first");
				return "Test link: " + this.#node.link;
			},
			region: (e) => {
				let region = e.split(" ")[1];
				this.setRegion(region);
				return "Region set to " + region;
			},
			help: () => ("\n" +
				"-----------------------------CONSOLE HELP-----------------------------\n" +
				"start                     launch modded game\n" +
				"stop                      kill modded game\n" +
				"region <region>           change server region.\n" +
				"  ex: region Europe\n" +
				"anything JavaScript       execute JavaScript code (permission required)\n" + 
				"  ex: game.addAlien()\n" +
				"help                      display this help\n\n" +
				`starblast-modding BrowserClient v${this.#node.version}`
			)
		},
		tick: function (tick) {
			this.game.tick(tick);
			this.context.tick?.(this.game);
		}
	};

	/**
	 * Set the region of the client.
	 * @param {string} regionName - region name, must be either Asia, America or Europe
	 * @returns {BrowserClient}
	 */

	setRegion (...data) {
		this.#node.setRegion(...data);
		return this
	}

	#createVMContext () {
		this.#vmContext.game = this.#modding.game = this.#game = new Game(this.#node, this.#modding);
		this.#vmContext.echo = (e) => void this.#modding.terminal?.echo?.(e);
	}

	/**
	 * Set the ECP key that client will use for requests
	 * @param {string} ECPKey - The ECP key
	 * @returns {BrowserClient}
	 */

	setECPKey (...data) {
		this.#node.setECPKey(...data);
		return this
	}

	/**
	 * Get the ModdingClient object running behind the scene
	 * @returns {ModdingClient}
	 */

	getNode () {
		return this.#node;
	}

	/**
	 * Get the game object, which acts the same as the `game` object in browser
	 * @returns {object}
	 */

	getGame () {
		return this.#game
	}

	#path;
	#URL;
	#code;
	#lastCode = null;

	#watchChanges = false;
	#watchInterval = 5000;
	#watchIntervalID = null;
	#assignedWatch = false;

	#node;
	#game;

	#sameCodeExecution;
	#crashOnError;

	#logErrors;
	#logMessages;

	#handle (func, ...params) {
		try { func?.(...params, this.#game) }
		catch (e) {
			if (this.#crashOnError) throw e;
			else this.#node.error(e)
		}
	}

	#clearWatch () {
		clearInterval(this.#watchIntervalID);
		this.#assignedWatch = false;
	}

	#startWatch () {
		let watchFunc = async () => {
			await this.#applyChanges();
			this.#watchIntervalID = setTimeout(watchFunc, this.#watchInterval);
		};
		this.#watchIntervalID = setTimeout(watchFunc, this.#watchInterval);
	}

	#setWatchInterval (watchChanges, interval) {
		this.#clearWatch();
		this.#assignedWatch = false;
		this.#watchChanges = !!watchChanges;
		if (this.#watchChanges) this.#watchInterval = Math.max(1, Math.floor(interval)) || 5000;
		return this
	}

	/**
	 * Load the mod code from a script string
	 * @param {string} text - The code string to execute
	 * @returns {BrowserClient}
	 */

	async loadCodeFromString (text) {
		this.#path = null;
		this.#URL = null;
		this.#code = text;

		this.#setWatchInterval(false, null);

		if (this.#node.processStarted) await this.#applyChanges(true);
		return this
	}

	/**
	 * Load the mod code from a local file (File on your device)
	 * @param {string} path - The path to the local file
	 * @param {boolean} [watchChanges = false] - Whether to watch for changes on the file or not
	 * @param {number} [interval = 5000] - The interval between watches (if `watchChanges` is set to `true`)
	 * @returns {BrowserClient}
	 */

	async loadCodeFromLocal (path, watchChanges = false, interval = 5000) {
		this.#path = path;
		this.#URL = null;
		this.#code = null;

		this.#setWatchInterval(watchChanges, interval);

		if (this.#node.processStarted) await this.#applyChanges(true);
		return this
	}

	/**
	 * Load the mod code from an external URL file
	 * @param {string} URL - The URL to the file
	 * @param {boolean} [watchChanges = false] - Whether to watch for changes on the URL or not
	 * @param {number} [interval = 5000] - The interval between watchs (if `watchChanges` is set to `true`)
	 * @returns {BrowserClient}
	 */

	async loadCodeFromExternal (URL, watchChanges = false, interval = 5000) {
		this.#path = null;
		this.#URL = URL;
		this.#code = null;

		this.#setWatchInterval(watchChanges, interval);

		if (this.#node.processStarted) await this.#applyChanges(true);
		return this
	}

	#fromLocal () {
		return fs.readFile(this.#path, 'utf-8')
	}

	#fromExternal () {
		return URLFetcher(this.#URL)
	}

	async #applyChanges (forced) {
		try {
			let lastCode = this.#lastCode;
			this.#lastCode = this.#URL ? (await this.#fromExternal()) : (this.#path ? (await this.#fromLocal()) : this.#code);
			if (this.#watchChanges && (this.#URL != null || this.#path != null) && !this.#assignedWatch) {
				this.#clearWatch();
				this.#startWatch();
				this.#assignedWatch = true;
			}
			let sameCode = this.#lastCode == lastCode;
			if (!sameCode || (forced && this.#sameCodeExecution)) {
				if (!this.#node.processStarted) this.#createVMContext();
				
				try { this.#modding.context = {} } catch (e) {};

				await this.#vmExec("(" + (new Function("game", this.#lastCode)).toString() + ").call(this.game?.modding?.context, this.game);");
			}
		}
		catch (e) {
			this.#handle(function () { throw e });
		}
	}

	#vmExec (code) {
		return new NodeVM.Script(code, {
			filename: "VM.BrowserClient_ModContext",
			importModuleDynamically: async function (moduleName) {
				throw new Error("Module import is not supported.");
			}
		}).runInContext(this.#vmContext, { displayErrors: true });
	}

	/**
	 * Starts the game
	 * @returns {string} Link of the game
	 */

	async start () {
		let node = this.#node;
		if (!node.processStarted) {
			await this.#applyChanges(true);
			node.setOptions(Object.assign({}, this.#modding.context?.options))
		}
		else if (!node.started) throw new Error("Mod is starting. Please be patience");
		return await node.start()
	}

	/**
	 * Executes any terminal command on current running instance.
	 * @param {string} command - Command to execute
	 * @param {boolean} [allowEval = false] - Whether to allow eval the command as JavaScript or not.<br> WARNING: THIS MAY CAUSE SECURITY ISSUE TO YOUR INSTANCE
	 * @param {boolean} [captureOutput = false] - Whether to capture execution output or pipe it to error/log events instead
	 * @returns {({ success: boolean, output: any })} Success status (boolean) and output of given execution (if ouput capturing is enabled)
	 */

	async execute (command, allowEval = false, captureOutput = false) {
		command = toString(command);
		try {
			let cmdName = command.trim().split(" ")[0] || "";
			let cmd, output;
			if (cmdName && "function" === typeof (cmd = this.#modding.commands?.[cmdName])) {
				output = await cmd.call(this.#game, command);
			}
			else if (!allowEval) {
				if (!cmdName) throw new Error("No terminal command specified");
				throw new Error("Unknown terminal command: " + cmdName);
			}
			else {
				output = await this.#vmExec(command);
			}

			if (captureOutput) return { success: true, output };
			if (output !== undefined) this.#node.log(output);
			return { success: true };
		} catch (e) {
			if (captureOutput) return { success: false, output: e };
			this.#handle(() => { throw e });
			return { success: false };
		}
	}

	/**
	 * Stops the game
	 * @returns {BrowserClient}
	 */

	async stop () {
		await this.#node.stop();
		return this
	}
}

module.exports = BrowserClient

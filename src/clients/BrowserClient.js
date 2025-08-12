const fs1 = require('fs');
const fs = fs1.promises;

const ModdingEvents = require("../resources/Events.js");

const ModdingClient = require("./ModdingClient.js");

const GameCode = fs1.readFileSync(__dirname + "/../utils/GameCode.js", "utf8");

const URLFetcher = require("../utils/URLFetcher.js");

const toString = require("../utils/toString.js");

const NodeVM = require("node:vm");

const { decode } = require("html-entities");

const required_codes = {
	"core-js": fs1.readFileSync(require.resolve("core-js-bundle/minified.js"), "utf8"),
	"xhr": fs1.readFileSync(require.resolve("xmlhttprequest-ssl/lib/XMLHttpRequest.js"), "utf8"),
	"fetch": fs1.readFileSync(require.resolve("whatwg-fetch/fetch.js"), "utf8")
}

/**
 * The Browser Client Instance for supporting mod codes running in Browser Modding. <br><b>Warning: </b><br><ul><li>This client doesn't support undocumented features like accessing through `game.modding`, etc. </li><li>Some of the latest features of the new ModdingClient (which may not work in browsers) will be available. </li><li>Using Promise-related functionalities (including async/await) in your mod code is highly DISCOURAGED since NodeJS VM doesn't work well with Promise, and will likely crash or hang the running mod.</li>
 * @param {object} options - options for calling the object. <br><b>Note that</b> if both one property and its aliases exist on the object, the value of the main one will be chosen
 * @param {boolean} [options.cacheECPKey = false] - same with option specified at {@link ModdingClient}
 * @param {boolean} [options.extendedMode = false] - same with option specified at {@link ModdingClient}
 * @param {boolean} [options.strictMode = false] - Commands that affect the instance configuration (e.g `region`) won't be allowed to execute
 * @param {boolean} [options.persistentContext = true] - context where mod and command is executing on will be persistent across mod runs
 * @param {boolean} [options.sameCodeExecution = false] - loading the same code will trigger the execution or not. <br><b>Note:</b> This feature only works when you call `loadCodeFromString`, `loadCodeFromLocal` or `loadCodeFromExternal` methods, and not during the auto-update process
 * @param {boolean} [options.crashOnException = false] - when tick or event function, or mod code execution fails, the mod will crash
 * @param {boolean} options.crashOnError - alias of the property `options.crashOnException`
 * @param {boolean} [options.logErrors = true] - game will log any errors or not
 * @param {boolean} options.logExceptions - alias of the property `options.logErrors`
 * @param {boolean} [options.logMessages = true] - game will log any in-game logs or not
 * @param {boolean} [options.compressWSMessages = false] - same with option specified at {@link ModdingClient}
 * @param {boolean} [options.disableNetworkRequests = false] - disable network requests (e.g. `fetch`, `XMLHttpRequest`, etc.) or not
 * @since 1.1.0-alpha6
 */

class BrowserClient {
	constructor(options) {
		this.#sameCodeExecution = !!options?.sameCodeExecution;
		this.#disableNetworkRequests = !!options?.disableNetworkRequests;
		this.#strictMode = !!options?.strictMode;
		let logErrors = this.#logErrors = !!(options?.logErrors ?? options.logExceptions ?? true);
		let logMessages = this.#logMessages = !!(options?.logMessages ?? true);
		this.#persistentContext = !!(options?.persistentContext ?? true);
		let crashOnError = this.#crashOnError = !!(options?.crashOnException ?? options?.crashOnError);
		let node = this.#node = new ModdingClient({...options, cacheEvents: true, cacheOptions: false});

		this.resetContext();

		// events

		if (!crashOnError) node.on(ModdingEvents.ERROR, function(error) {
			if (logErrors) console.error("[In-game Error]", error)
		});

		node.on(ModdingEvents.LOG, function(...args) {
			if (logMessages) console.log("[In-game Log]", ...args)
		});

		node.on(ModdingEvents.MOD_STOPPED, () => {
			this.#clearWatch();
			this.#lastCode = null;
		});

		for (let event of Object.values(ModdingEvents)) {
			node.on(event, (...args) => {
				// errors should not be thrown on this since the game code is carefully handled
				// if any errors have stack trace on this part, please contact author (@bhpsngum)
				this.#listeners[event].call(this.#modding.context, ...args);
			});
		}
	}

	#vmContext;
	#contextBridge;
	#modding;
	#listeners = Object.create(null);
	#timer_pool = {
		id: 0,
		data: new Map(),
		add: function (timer, interval) {
			this.data.set(++this.id, { timer, interval });

			return this.id;
		},
		remove: function (timerID, noRemove = false) {
			let timer = this.data.get(timerID);
			if (!timer) return;
			if (!noRemove) this.manualRemove(timer);

			this.data.delete(timerID);
		},
		manualRemove: function (timer) {
			if (timer.interval) clearInterval(timer.timer);
			else clearTimeout(timer.timer);
		},
		reset: function () {
			for (let timer of this.data.values()) this.manualRemove(timer);
			this.id = 0;
			this.data.clear();
		}
	}

	#remoteLog (e) {
		if ("function" === typeof this.#messageHandler) try {
			this.#messageHandler({
				content: decode(e.content),
				raw: e.raw,
				type: e.type
			});
		}
		finally {}
		else this.#node[e.type](decode(e.content));
	}

	/**
	 * Set the region of the client.
	 * @param {string} regionName - region name, must be either Asia, America or Europe
	 * @returns {BrowserClient}
	 */

	setRegion (...data) {
		this.#node.setRegion(...data);
		return this
	}

	/**
	 * Destroy and recreate the context where mod and command execution is running on.
	 * @since 1.4.14-alpha6
	 */

	resetContext () {
		if (this.#node.processStarted) throw new Error("Context cannot be reset because mod/process is currently running.");

		this.#timer_pool.reset();

		this.#listeners = Object.create(null);

		for (let event of Object.values(ModdingEvents)) {
			this.#listeners[event] = () => {}
		}

		let compile = (code, timeout) => {
			return this.#vmExec(code, timeout);
		}

		// apply a new environment
		this.#vmContext = NodeVM.createContext(Object.assign(Object.create(null), {
			require,
			required_codes,
			disableNetwork: this.#disableNetworkRequests,
			parentGlobal: globalThis,
			timer_pool: this.#timer_pool,
			node: this.#node,
			ModdingEvents,
			strictMode: this.#strictMode,
			remoteCompile: async (code) => {
				return await compile(`(${Function("game", code).toString()}).call(this.game.modding.context, this.game)`);
			},
			registerEvent: (event, listener) => void (this.#listeners[event] = listener),
			remoteLog: (e) => {
				this.#remoteLog(e);
			},
			compile,
			getValue: async () => {
				if (this.#lastCode == null) await this.#applyChanges(true, false);
				return this.#lastCode;
			}
		}), {
			name: "Mod Context (BrowserClient VM)"
		});

		Object.defineProperty(this.#vmContext, 'window', {
			enumerable: true,
			configurable: false,
			get: function window () { return this }
		});

		// run setup script and get required parameters
		this.#contextBridge = this.#vmExec(GameCode, 5000);
		this.#modding = this.#contextBridge.modding;
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
		return this.#modding?.game;
	}

	#path;
	#URL;
	#code;
	#lastCode = null;

	#watchChanges = false;
	#watchInterval = 5000;
	#watchIntervalID = null;
	#assignedWatch = false;
	#executionTimeout;

	#node;
	#game;

	#sameCodeExecution;
	#crashOnError;
	#strictMode;

	#logErrors;
	#logMessages;

	#disableNetworkRequests = false;

	#persistentContext;

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

	#setWatchInterval (watchChanges, interval, timeout) {
		this.#clearWatch();
		this.#assignedWatch = false;
		this.#watchChanges = !!watchChanges;
		if (this.#watchChanges) this.#watchInterval = Math.max(1, Math.floor(interval ?? 5000)) || 5000;
		this.#executionTimeout = timeout;
		return this
	}

	/**
	 * Load the mod code from a script string
	 * @param {string} text - The code string to execute
	 * @param {Object} options - execution options
	 * @param {number?} [options.executionTimeout = Infinity] - The timeout for executing this code
	 * @returns {BrowserClient}
	 */

	async loadCodeFromString (text, options) {
		this.#path = null;
		this.#URL = null;
		this.#code = toString(text);

		this.#setWatchInterval(false, null, options?.executionTimeout);

		if (this.#node.processStarted) await this.#applyChanges(true);
		return this
	}

	/**
	 * Load the mod code from a local file (File on your device)
	 * @param {string} path - The path to the local file
	 * @param {Object} options - execution options
	 * @param {boolean} [options.watchChanges = false] - Whether to watch for changes on the file or not
	 * @param {number} [options.watchInterval = 5000] - The interval between watches (if `watchChanges` is set to `true`)
	 * @param {number?} [options.executionTimeout = Infinity] - The timeout for executing this code
	 * @returns {BrowserClient}
	 */

	async loadCodeFromLocal (path, options) {
		this.#path = path;
		this.#URL = null;
		this.#code = null;

		this.#setWatchInterval(options?.watchChanges, options?.watchInterval, options?.executionTimeout);

		if (this.#node.processStarted) await this.#applyChanges(true);
		return this
	}

	/**
	 * Load the mod code from an external URL file
	 * @param {string} URL - The URL to the file
	 * @param {Object} options - execution options
	 * @param {boolean} [options.watchChanges = false] - Whether to watch for changes on the file or not
	 * @param {number} [options.watchInterval = 5000] - The interval between watches (if `watchChanges` is set to `true`)
	 * @param {number?} [options.executionTimeout = Infinity] - The timeout for executing this code
	 * @returns {BrowserClient}
	 */

	async loadCodeFromExternal (URL, options) {
		this.#path = null;
		this.#URL = URL;
		this.#code = null;

		this.#setWatchInterval(options?.watchChanges, options?.watchInterval, options?.executionTimeout);

		if (this.#node.processStarted) await this.#applyChanges(true);
		return this
	}

	#messageHandler = null;

	/**
	 * Message handler function
	 * @name abstract_message_handler
	 * @function
	 * @param {Object} data Message data
	 * @param {"error" | "log"} data.type Type of message
	 * @param {String} data.content Parsed content of the message
	 * @param {String} data.raw Raw content of the message
	*/

	/**
	 * Poll messages (logs and errors) from browser client.
	 * Defaults to logging parsed content/errors if no handler is present.
	 * @param {abstract_message_handler} handler Message handler
	 */

	pollMessages (handler) {
		this.#messageHandler = handler;
	}

	#fromLocal () {
		return fs.readFile(this.#path, 'utf-8')
	}

	#fromExternal () {
		return URLFetcher(this.#URL)
	}

	async #applyChanges (forced, exec) {
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
				if (!this.#node.processStarted) {
					if (!this.#persistentContext) this.resetContext();
				}

				await this.#contextBridge.setCode(exec ?? this.#node.processStarted);
			}
		}
		catch (e) {
			this.#node.error(e);
		}
	}

	#vmExec (code, timeout) {
		return new NodeVM.Script(code, {
			filename: "VM.BrowserClient_ModContext",
			importModuleDynamically: async function (moduleName) {
				throw new Error("Module import is not supported.");
			}
		}).runInContext(this.#vmContext, {
			timeout: arguments.length > 1 ? timeout : this.#executionTimeout,
			displayErrors: true
		});
	}

	/**
	 * Starts the game
	 * @returns {string} Link of the game
	 */

	async start () {
		if (this.#node.processStarted) throw new Error("Mod already running, use stop first");
		try {
			await this.#modding.run();
		}
		catch (e) {
			this.#clearWatch();
			this.#lastCode = null;
			throw e;
		}
	}

	/**
	 * Executes any terminal command on current running instance.
	 * @param {string} command - Command to execute
	 * @param {object} options - Options for this execution
	 * @param {boolean} [options.allowEval = false] - Whether to allow eval the command as JavaScript or not.<br> WARNING: THIS MAY CAUSE SECURITY ISSUES TO YOUR INSTANCE
	 * @param {boolean} [options.captureOutput = false] - Whether to capture execution output or pipe it to error/log events instead
	 * @param {number?} [options.executionTimeout] - Timeout for this execution, set to nullish to use default execution timeout from mod compilation
	 * @returns {({ success: boolean, output: any })} Success status (boolean) and output of given execution (if ouput capturing is enabled)
	 * @since 1.4.7-alpha6
	 */

	async execute (command, options) {
		try {
			let output = await this.#contextBridge.execute(toString(command).replace(/^\s*\[\[([^]*)\]\]\s*$/, "$1"), options?.allowEval, options?.executionTimeout);

			if (options?.captureOutput) return { success: true, output };
			if (output !== undefined && output !== "") this.#contextBridge.echo(output);
			return { success: true };
		} catch (e) {
			if (options?.captureOutput) return { success: false, output: e };
			this.#contextBridge.error(e);
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

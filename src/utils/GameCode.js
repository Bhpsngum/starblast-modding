(function setup () {
	const { defineProperty, getOwnPropertyDescriptor } = Object;
	const { set, get } = WeakMap.prototype, { apply } = Reflect;
	const { includes, splice, push } = Array.prototype;
	const { split, trim } = String.prototype;
	const call = function (func, thisArg, ...args) {
		return apply(func, thisArg, args);
	}
	const timeouts = ["setTimeout", "setInterval", "clearTimeout", "clearInterval"];
	const { disableNetwork, node, compile, getValue, remoteLog, strictMode, timer_pool, parentGlobal, Promise, registerEvent } = this;
	const { console, Buffer } = parentGlobal;
	let coreJsShared;

	const natifyFunc = function (func, name) {
		defineProperty(func, 'name', {
			...getOwnPropertyDescriptor(func, 'name'),
			value: name
		});

		if ("function" === typeof coreJsShared?.state?.set) coreJsShared.state.set(func, {
			source: `function ${func.name || name || "anonymous"}() { [native code] }`,
			facade: func
		});

		return func;
	}

	const protofy = function (mClass, key, value, newName = key) {
		defineProperty(mClass.prototype, key, {
			writable: true,
			configurable: true,
			enumerable: true,
			value: natifyFunc(value, newName)
		});
	}

	const renameClass = function (obj, origin, name) {
		defineProperty(obj, Symbol.toStringTag, {
			...getOwnPropertyDescriptor(origin, Symbol.toStringTag),
			value: name
		});
	}

	renameClass(window, parentGlobal, "Window");

	delete this.timer_pool;
	delete this.parentGlobal;

	// timeout functionality polyfill
	for (let t of timeouts) {
		if (t.startsWith("set")) {
			let interval = t === "setInterval";
			let timerFunc = function (FunctionOrCode, ...params) {
				let exec = FunctionOrCode;
				if ("string" === typeof exec) exec = () => compile(FunctionOrCode);

				let o = timer_pool.add(parentGlobal[t].call(this, function(...args) {
					try { if ("function" === typeof exec) exec.call(this, ...args) }
					catch (e) { node.error(e); }
					if (!interval) timer_pool.remove(o, true);
				}, ...params), interval);

				return o;
			}.bind(this);

			this[t] = function (handler, delay, ...params) {
				return timerFunc(handler, delay, ...params);
			}
		}
		else this[t] = function (timerID) {
			timer_pool.remove(timerID);
		}
	}

	let xhrSuccess = false, fetchSuccess = false;

	// basic functionality polyfill
	try {
		eval(required_codes["core-js"]);
		// remove core-js shared entrypoint (it should still work right)
		coreJsShared = this['__core-js_shared__'];
		delete this['__core-js_shared__'];

		for (let i of timeouts) natifyFunc(this[i], i);

		// polyfill XMLHttpRequest
		if (!disableNetwork) try {
			let mod = { exports: {} };
			Function("module", "Buffer", "require", "process", required_codes.xhr
				.replace(/Error\("(INVALID_STATE_ERR|SecurityError): ([^"])([^"]*?)"/g, (v, a, b, c) => `DomException("${b.toUpperCase()}${c}", "${a == "SecurityError" ? a : "InvalidStateError"}"`)
			)(mod, Buffer, this.require, this.require("process"));
			this.XMLHttpRequest = mod.exports.XMLHttpRequest;
			xhrSuccess = true;
			try {
				// finally, fetch() polyfill
				eval(required_codes.fetch.replaceAll("\nexport ", "\n").replace("this.map = {}", `
					var actualMap = new Map();
					this.map = new Proxy({}, {
						get: function (target, prop, receiver) {
							if (actualMap.has(prop)) return actualMap.get(prop);
							return Reflect.get(target, prop, receiver);
						},
						set: function (target, prop, newValue) {
							actualMap.set(prop, newValue)
							return true;
						},
						ownKeys: function (target) {
							return [...actualMap.keys()]
						},
						getOwnPropertyDescriptor: function (target, prop) {
							if (!actualMap.has(prop)) return undefined;
							return { enumerable: true, writable: true, configurable: true, value: actualMap.get(prop) }
						}
					});
				`));
				fetchSuccess = true;
			}
			catch (e) {
				console.warn("'fetch()' API is unavailable due to polyfill failure.");
			}
		}
		catch (e) {
			console.warn("Failed to polyfill XMLHttpRequest. This feature along with 'fetch()' API will be unavailable.");
		}
	}
	catch (e) {
		console.warn("Basic polyfill has failed. Some features might not be available.");
	}
	delete this.require;
	delete this.required_codes;

	if (!disableNetwork && xhrSuccess) {
		// proxy some class in order not to return some leaked values

		const { TypeError, WeakMap } = this, maps = {}, internals = {};
		const proxiedClasses = [
			{
				name: "XMLHttpRequest",
				functions: ["addEventListener", "removeEventListener", "dispatchEvent", "abort", "getAllResponseHeaders", "getResponseHeader", "open", "send", "setRequestHeader", "overrideMimeType"],
				getters: ["readyState", "responseURL", "responseText", "responseType", "responseXML", ["status", 0], ["statusText", ""], "upload"],
				setters: [["timeout", 0], ["withCredentials", false], "onabort", "onerror", "onload", "onloadend", "onloadstart", "onprogress", "onreadystatechange", "ontimeout"],
				preCall: function (newConst, map, args) {
					call(splice, args, 0, args.length, {
						allowFileSystemResources: false,
						origin: "https://starblast.data.neuronality.com/modding/moddingcontent.html"
					});
				},
				postCall: function (instance) {
					let { getResponseHeader, getAllResponseHeaders } = instance;
					instance.getAllResponseHeaders = function () {
						try { return call(getAllResponseHeaders, this, ...arguments) } catch (e) { return "" };
					}

					instance.getResponseHeader = function () {
						try { return call(getResponseHeader, this, ...arguments) } catch (e) { return null };
					}
				},
				customCaller: function (mClass, map) {
					defineProperty(mClass.prototype, 'response', {
						enumerable: true,
						configurable: true,
						get: natifyFunc(function() {
							let obj = getObj(map, this, { name: "", method: "", promise: false });
							return obj.response instanceof Buffer ? null : obj.response;
						}, `get body`)
					});
				}
			}
		];

		if (fetchSuccess) proxiedClasses.push(
			{
				name: "Headers",
				functions: ["append", "delete", "entries", "forEach", "get", "has", "keys", "set", "values", [Symbol.iterator, false, "entries"]],
				getters: [],
				invoke: false,
				customCaller: function (mClass, map) {
					protofy(mClass, "getSetCookie", function () {
						let object = getObj(map, this, { name: "", method: "", promise: false });
						return call(object.get, object, "Set-Cookie")?.split?.(", ") || [];
					});
				}
			},
			{
				name: "Request",
				functions: [["arrayBuffer", true], ["blob", true], ["bytes", true], ["formData", true], ["json", true], ["text", true]],
				getters: ["bodyUsed", "cache", "credentials", "destination", "headers", "integrity", "isHistoryNavigation", "keepalive", "method", "mode", "redirect", "referrer", "referrerPolicy", "signal", "url"],
				preCall: function (newConst, map, args) {
					if (args[0] instanceof newConst) args[0] = getObj(map, args[0], { name: "", method: "", promise: false });
				},
				postCall: function (instance) {
					let oldheader = instance.headers;
					instance.headers = new nativeHeader();
					for (let entries of oldheader) call(headerSet, instance.headers, ...entries);
				},
				customCaller: function (mClass, map) {
					protofy(mClass, "clone", function () {
						let object = getObj(map, this, { name: "", method: "", promise: false });
						return new nativeRequest(object, {body: object._bodyInit});
					});

					defineProperty(mClass.prototype, 'body', {
						enumerable: true,
						configurable: true,
						get: natifyFunc(function() {
							let obj = getObj(map, this, { name: "", method: "", promise: false });
							return obj._noBody ? null : (obj._bodyInit ?? obj._bodyArrayBuffer ?? obj._bodyBlob ?? obj._bodyText ?? obj._bodyFormData ?? null);
						}, `get body`)
					});
				}
			},
			{
				name: "Response",
				functions: [["arrayBuffer", true], ["blob", true], ["bytes", true], ["formData", true], ["json", true], ["text", true]],
				getters: ["bodyUsed", "headers", "ok", "status", "statusText", "type", "url"],
				preCall: function (newConst, map, args) {
					if (args[0] instanceof newConst) args[0] = getObj(map, args[0], { name: "", method: "", promise: false });
				},
				postCall: function (instance) {
					let oldheader = instance.headers;
					instance.headers = new nativeHeader();
					for (let entries of oldheader) call(headerSet, instance.headers, ...entries);
				},
				customCaller: function (mClass, map) {
					protofy(mClass, "clone", function () {
						let object = getObj(map, this, { name: "", method: "", promise: false });
						return new nativeResponse(object._bodyInit, {
							status: object.status,
							statusText: object.statusText || '',
							headers: new Headers(object.headers),
							url: object.url
						});
					});

					defineProperty(mClass.prototype, 'body', {
						enumerable: true,
						configurable: true,
						get: natifyFunc(function() {
							let obj = getObj(map, this, { name: "", method: "", promise: false });
							return obj._noBody ? null : (obj._bodyInit ?? obj._bodyArrayBuffer ?? obj._bodyBlob ?? obj._bodyText ?? obj._bodyFormData ?? null);
						}, `get body`)
					});

					defineProperty(mClass.prototype, 'redirected', {
						enumerable: true,
						configurable: true,
						get: natifyFunc(function() {
							let obj = getObj(map, this, { name: "", method: "", promise: false });
							return call(includes, [301, 302, 303, 307, 308], obj.status);
						}, `get redirected`)
					});
				}
			},
		);

		const getObj = function (map, instance, { name, method, promise }) {
			let val = call(get, map, instance);
			if (!val) {
				let err_msg = "Illegal invocation";
				if (promise) err_msg = `Failed to execute '${method}' on '${name}': ` + err_msg;
				let err = new TypeError(err_msg);
				if (promise) return new Promise((rs, rj) => rj(err));
				throw err;
			}
			return val;
		}

		for (let { name, functions, getters, setters, customCaller, postCall, preCall } of proxiedClasses) {
			let internal = this[name];
			internals[name] = internal;
			let classMap = maps[name] = new WeakMap();
			let modified = function FetchAPIComponent (...params) {
				if (!(this instanceof modified)) {
					throw new TypeError(`Failed to construct '${name}': Please use the 'new' operator, this DOM object constructor cannot be called as a function.`);
				}

				if ("function" === typeof preCall) preCall(modified, classMap, params);

				let o = new internal(...params);
				if ("function" === typeof postCall) postCall(o);
				// renameClass(o, o, name);

				call(set, classMap, this, o);
			}

			for (let k of functions) {
				let promise = false, mName = k;
				if ("string" !== typeof k) {
					promise = k[1],
					mName = k[2] || k[0];
					k = k[0];
				}
				protofy(modified, k, function (...args) {
					let object = getObj(classMap, this, { name, method: mName, promise });
					return call(object[k], object, ...args);
				}, mName);
			}

			for (let k of getters) {
				let defaultVal = null;
				if ("string" !== typeof k) {
					defaultVal = k[1];
					k = k[0];
				}
				defineProperty(modified.prototype, k, {
					enumerable: true,
					configurable: true,
					get: natifyFunc(function() {
						return getObj(classMap, this, { name: "", method: "", promise: false })[k] ?? defaultVal;
					}, `get ${k}`)
				});
			}

			if (setters) for (let k of setters) {
				let defaultVal = null;
				if ("string" !== typeof k) {
					defaultVal = k[1];
					k = k[0];
				}
				defineProperty(modified.prototype, k, {
					enumerable: true,
					configurable: true,
					get: natifyFunc(function() {
						return getObj(classMap, this, { name: "", method: "", promise: false })[k] ?? defaultVal;
					}, `get ${k}`),
					set: natifyFunc(function(v) {
						getObj(classMap, this, { name: "", method: "", promise: false })[k] = v;
					}, `set ${k}`)
				});
			}

			if ("function" === typeof customCaller) customCaller(modified, classMap);

			renameClass(modified.prototype, modified.prototype, name);

			this[name] = natifyFunc(modified, name);
		}

		let fakeXhr = new internals.XMLHttpRequest;

		for (let i of ["UNSENT", "OPENED", "HEADERS_RECEIVED", "LOADING", "DONE"]) defineProperty(this.XMLHttpRequest, i, {
			writable: false,
			configurable: false,
			enumerable: true,
			value: fakeXhr[i]
		});

		let nativeHeader = this.Headers, headerSet = nativeHeader?.prototype?.set;
		let nativeRequest = this.Request, nativeResponse = this.Response;

		if (fetchSuccess) {
			this.Response.error = natifyFunc(function () {
				let newRes = new nativeResponse(null, { status: 200, statusText: '' });
				let ref = getObj(maps.Response, newRes, { name: "", method: "", promise: false });
				ref.type = "error";
				ref.status = 0;
				ref.ok = false;
				return newRes;
			}, "error");

			this.Response.redirect = natifyFunc(function (url, status) {
				if (!call(includes, [301, 302, 303, 307, 308], status)) {
					throw new RangeError('Invalid status code');
				}

				return new nativeResponse(null, {status: status, headers: {location: url}});
			}, "redirect");

			this.Response.json = natifyFunc(function (data, options) {
				return new nativeResponse(data == null ? null : JSON.stringify(data), options);
			}, "json");

			let iFetch = this.fetch;

			this.fetch = natifyFunc(function(resource, options) {
				return new Promise((rs, rj) => iFetch(resource, options).then(res => rs(new nativeResponse(res._bodyInit, {
					status: res.status,
    				statusText: res.statusText || '',
    				headers: new Headers(res.headers),
    				url: res.url
				}))).catch(rj));
			}, "fetch");
		}
	}

	// open | macro | close
	const tokenizer_regex = /(\[\[[usoibg!@]*;[^\[]*?;[^\[]*?\])|(\[\[([^\]]+)\]\])|(\\{0,1}\])/;

	let echo = (item) => {
		item += "";
		remoteLog({
			type: "log",
			raw: item,
			content: strip_formatting(item)
		});
	};

	let error = (item) => {
		item += "";
		remoteLog({
			type: "error",
			raw: item,
			content: strip_formatting(item)
		});
	}

	const execute = function (command, allowEval = false, timeout) {
		let cmdName = call(split, call(trim, command), /\s+/)[0] || "";
		if (cmdName && "function" === typeof (cmd = modding.commands?.[cmdName])) {
			return call(cmd, modding.commands, command);
		}
		else if (!allowEval) {
			if (!cmdName) throw "No terminal command specified";
			throw "Unknown terminal command: " + cmdName;
		}
		else {
			return compile(command, timeout);
		}
	}

	const strip_formatting = function (str) {
		let newStr = "", match, stacks = 0;

		while (match = str.match(tokenizer_regex)) {
			let { index } = match;
			newStr += str.slice(0, index);

			if (match[1]) {
				// opener
				++stacks;
			}
			else if (match[2]) {
				// macro
				try {
					newStr += `${strip_formatting(execute(match[3], true) + "")}\n`;
				}
				catch (e) {
					error(e);
					newStr += "\n";
				}
			}
			else {
				// close bracket
				if (match[4] === "\\]" || stacks < 1) newStr += "]";
				else --stacks;
			}

			str = str.slice(index + match[0].length);
		}

		return newStr + str;
	}
	const dataLength = data => JSON.stringify(data).length;
	const safeHandler = function (func) {
		try { return func() } catch (e) {
			if (e.name && this[e.name]?.prototype instanceof Error) throw new this[e.name](e.message);
			else throw cloneObject(e);
		}
	}
	const cloneObject = obj => JSON.parse(JSON.stringify(obj));

	const setCode = async function (exec = false) {
		if (exec) await modding.editorContentsChanged();
	}

	// base hooking class
	class Entity {
		constructor (game, baseEntity, excludeList = []) {
			this.game = game;
			this.#baseEntity = baseEntity;
			baseEntity.modding.data.browser_proxy_initialized = true;

			call(push, excludeList, "id", "uuid", "custom", "__proto__", "inactive_field", "structure_type", "lastAliveStep", "createdStep");

			for (let k in baseEntity) {
				if (!call(includes, excludeList, k) && "function" !== typeof baseEntity[k]) {
					defineProperty(this, k, {
						enumerable: true,
						configurable: false,
						get () { return baseEntity[k] },
						set (v) {}
					});
				}
			}
		}

		custom = {};
		#killed;

		get killed () {
			return this.#killed ?? !!this.#baseEntity.modding.data[this.#baseEntity.inactive_field];
		}

		set killed (value) {
			this.#killed = value;
		}

		get id () {
			return this.#baseEntity.id ?? -1;
		}

		get last_updated () {
			return this.#baseEntity.lastUpdatedStep ?? -1;
		}

		set (data) {
			safeHandler(() => this.#baseEntity.set(data));
			return dataLength(data);
		}

		toString () {
			return JSON.stringify(this.#baseEntity);
		}

		#baseEntity;
	}

	// polyfill classes
	class Ship extends Entity {
		constructor (game, baseEntity) {
			super(game, baseEntity, ["objects", "ui_components", "customization", "stats", "angle"]);

			this.#ship = baseEntity;
		}

		#ship;

		get stats () {
			return this.#ship.stats?.reduce?.((a, b) => a * 10 + b, 0) ?? 0;
		}

		get r () {
			return this.#ship.angle * Math.PI / 180;
		}

		setUIComponent (component) {
			safeHandler(() => this.#ship.ui_components.set(component));
			return dataLength(component);
		}

		showInstructor () {
			safeHandler(() => this.#ship.showInstructor());
			return 0;
		}

		instructorSays (data) {
			safeHandler(() => this.#ship.instructorSays(data));
			return dataLength(data);
		}

		hideInstructor () {
			safeHandler(() => this.#ship.hideInstructor());
			return 0;
		}

		gameover (data) {
			safeHandler(() => this.#ship.gameover(data));
			return dataLength(data);
		}

		emptyWeapons () {
			safeHandler(() => this.#ship.emptyWeapons());
			return 0;
		}

		intermission (data) {
			safeHandler(() => this.#ship.intermission(data));
			return dataLength(data);
		}

		setObject (obj) {
			safeHandler(() => {
				this.#ship.objects.set(obj);
			});
			return dataLength(obj);
		}

		removeObject (id) {
			safeHandler(() => {
				this.#ship.objects.remove(id);
			});
			return dataLength(id);
		}
	};
	class Alien extends Entity {};
	class Asteroid extends Entity {};
	class Collectible extends Entity {};

	const creators = new Map([
		["ship", { f: Ship, name: "Ship" }],
		["alien", { f: Alien, name: "Alien" }],
		["collectible", { f: Collectible, name: "Collectible" }],
		["asteroid", { f: Asteroid, name: "Asteroid" }]
	]);

	const locateEntity = function (game, entity, ns, create = false) {
		if (entity == null) return null;
		let creator = creators.get(ns);
		let gEntity = game["find" + creator.name](entity.id);

		if (gEntity == null && (create || !entity.modding.data.browser_proxy_initialized)) {
			gEntity = new creator.f(game, entity);
			if (create || !gEntity.killed) game[ns + "s"].push(gEntity);
		}

		return gEntity;
	}

	class ModObject {
		constructor (object) {
			this.set(object);
		}

		set (object) {
			this.object = object;
		}

		toData () {
			return this.object;
		}
	}

	class ModObjectType {
		constructor (spec) {
			this.spec = spec;
			this.id = spec.id;
		}
	}

	class Modding {
		constructor (node, remoteCompile) {
			this.#node = node;
			this.#remoteCompile = remoteCompile;

			registerEvent(ModdingEvents.TICK, (tick) => {
				this.#handle(() => this.tick({ step: tick }));
			});

			registerEvent(ModdingEvents.MOD_STARTED, (link) => {
				this.#handle(() => {
					this.game.options = cloneObject(this.#node.options);
					this.modStarted(link);
				});
			});

			registerEvent(ModdingEvents.MOD_STOPPED, () => {
				this.#handle(() => {
					this.stopped();
				})
			});

			registerEvent(ModdingEvents.SHIP_RESPAWNED, (ship) => {
				this.#handle(() => {
					this.context?.event?.({
						name: "ship_spawned",
						ship: locateEntity(this.game, ship, "ship")
					}, this.game);
				})
			});

			registerEvent(ModdingEvents.SHIP_SPAWNED, (ship) => {
				this.#handle(() => {
					this.context?.event?.({
						name: "ship_spawned",
						ship: locateEntity(this.game, ship, "ship", true)
					}, this.game);
				})
			});

			registerEvent(ModdingEvents.SHIP_DESTROYED, (ship, killer) => {
				this.#handle(() => {
					this.context?.event?.({
						name: "ship_destroyed",
						ship: locateEntity(this.game, ship, "ship"),
						killer: locateEntity(this.game, killer, "ship")
					}, this.game);
				})
			});

			registerEvent(ModdingEvents.SHIP_DISCONNECTED, (ship) => {
				this.#handle(() => {
					ship = locateEntity(this.game, ship, "ship");
					if (ship) ship.killed = true;
				})
			});

			registerEvent(ModdingEvents.ALIEN_CREATED, (alien) => {
				this.#handle(() => this.game.alienCreated(alien.request_id, alien.id));
			});

			registerEvent(ModdingEvents.ALIEN_DESTROYED, (alien, killer) => {
				this.#handle(() => {
					alien = locateEntity(this.game, alien, "alien");
					if (alien) alien.killed = true;
					this.context?.event?.({
						name: "alien_destroyed",
						alien,
						killer: locateEntity(this.game, killer, "ship")
					})
				});
			});

			registerEvent(ModdingEvents.ASTEROID_CREATED, (asteroid) => {
				this.#handle(() => this.game.asteroidCreated(asteroid.request_id, asteroid.id));
			});

			registerEvent(ModdingEvents.ASTEROID_DESTROYED, (asteroid, killer) => {
				this.#handle(() => {
					asteroid = locateEntity(this.game, asteroid, "asteroid");
					if (asteroid) asteroid.killed = true;
					this.context?.event?.({
						name: "asteroid_destroyed",
						asteroid,
						killer: locateEntity(this.game, killer, "ship")
					})
				})
			});

			registerEvent(ModdingEvents.COLLECTIBLE_CREATED, (collectible) => {
				this.#handle(() => this.game.collectibleCreated(collectible.request_id, collectible.id));
			});

			registerEvent(ModdingEvents.COLLECTIBLE_PICKED, (collectible, ship) => {
				this.#handle(() => {
					collectible = locateEntity(this.game, collectible, "collectible");
					if (collectible) collectible.killed = true;
					this.context?.event?.({
						name: "collectible_picked",
						collectible,
						ship: locateEntity(this.game, ship, "ship")
					})
				})
			});

			registerEvent(ModdingEvents.UI_COMPONENT_CLICKED, (component, ship) => {
				this.#handle(() => {
					this.context?.event?.({
						name: "ui_component_clicked",
						id: component.id,
						ship: locateEntity(this.game, ship, "ship")
					}, this.game);
				})
			});

			if (strictMode) {
				this.commands.region = (e) => {
					throw "Changing region through commands is disabled because this client is in strict mode";
				}
				defineProperty(this, 'run', { value: runMod, writable: false, configurable: false });
			}
		}

		#handle (func) {
			try { func () } catch (e) {
				this.#node.error(e);
			}
		}

		#node;
		#remoteCompile;

		terminal = { echo, error };

		commands = {
			clear: () => {},
			start: async () => void await this.run(),
			stop: async () => void await this.stop(),
			test: () => {
				if (!this.#node.started) throw "Mod isn't started. Use 'start' first";
				return "Test link: " + this.#node.link;
			},
			region: (e) => {
				let region = e.split(" ")[1];
				this.#node.setRegion(region);
				return "Region set to " + region;
			},
			help: () => ("\n" +
				"start                     launch modded game\n" +
				"stop                      kill modded game\n" +
				"region <region>           change server region (permission required)\n" +
				"  ex: region Europe\n" +
				"anything JavaScript       execute JavaScript code (permission required)\n" +
				"  ex: game.addAlien()\n" +
				"help                      display this help\n\n" +
				`starblast-modding BrowserClient v${this.#node.version}`
			)
		}

		async stop () {
			await this.#node.stop();
		}

		modStarted (link) {
			this.terminal.echo("Mod started");
			this.terminal.echo(link);
			this.field_view = {};
		}

		stopped () {
			this.terminal.echo("Mod stopped");
			this.field_view = null;
			this.context = null;
		}

		async editorContentsChanged () {
			await this.compile();
		}

		async run () {
			if (this.#node.processStarted) throw "Mod already running, use stop first";

			this.game = new Game(this.#node, this);
			window.game = this.game;
			window.echo = (str) => this.terminal.echo(str);

			let t = Date.now();
			try {
				await this.compile();
			}
			catch (e) {
				error(e);
				this.#node.error(e);
			}
			this.terminal.echo("Code initialization took " + (Date.now() - t) + "ms");

			this.#node.setOptions(cloneObject(Object.assign(Object.create(null), this.context?.options ?? {})));
			await this.#node.start();
		}

		async compile () {
			this.context = {};
			await this.#remoteCompile(await getValue());
		}

		tick (data) {
			this.#handle(() => {
				this.game.tick(data);
				this.context?.tick?.(this.game);
			});
		}
	}

	if (strictMode) {
		defineProperty(Modding.prototype, 'run', { ...Object.getOwnPropertyDescriptor(Modding.prototype, 'run'), writable: false, configurable: false });
	}

	const runMod = Modding.prototype.run;

	class Game {
		constructor (node, modding) {
			this.#node = node;
			this.modding = modding;
		}

		#node;

		custom = {};
		ships = [];
		aliens = [];
		asteroids = [];
		collectibles = [];
		objects = [];
		objects_by_id = {};
		shaping_list = {};
		step = -1;

		setCustomMap (...args) {
			safeHandler(() => this.#node.setCustomMap(...args));
		}

		setOpen (isOpen) {
			safeHandler(() => {
				this.#node.setOpen(isOpen);
				this.is_open = !!isOpen;
			});
		}

		findShip (id) {
			return this.ships.find(ship => ship.id === id) ?? null
		}

		findAlien (id) {
			return this.aliens.find(alien => alien.id === id) ?? null
		}

		findAsteroid (id) {
			return this.asteroids.find(asteroid => asteroid.id === id) ?? null
		}

		findCollectible (id) {
			return this.collectibles.find(collectible => collectible.id === id) ?? null
		}

		#addEntity (data, manager_name, construct) {
			return safeHandler(() => {
				let manager = this.#node[manager_name];
				let entity = manager.create(data);
				let gameEntity = new construct(this, entity);
				this[manager_name].push(gameEntity);
				manager.add(entity).catch(e => {
					gameEntity.killed = true;
					this.#node.error(e);
				});
				return gameEntity;
			});
		}

		addAlien (data) {
			return this.#addEntity(data, "aliens", Alien);
		}

		addAsteroid (data) {
			return this.#addEntity(data, "asteroids", Asteroid);
		}

		addCollectible (data) {
			return this.#addEntity(data, "collectibles", Collectible);
		}

		setUIComponent (component) {
			safeHandler(() => this.#node.ships.ui_components.set(component));
			return dataLength(component);
		}

		setObject (data) {
			safeHandler(() => {
				if (data?.type?.physics && data.type.physics.shape == null) data.type.physics.autoShape = true;

				this.#node.objects.set(data).then(obj => {
					let result = cloneObject(obj);
					let found = this.objects.find(o => o.object.id === result.id);

					if (found != null) found.set(result);
					else {
						found = new ModObject(result);
						this.objects.push(found);
						this.objects_by_id[result.id] = found;
					}

					let { type } = found.object;
					if (!this.shaping_list[type.id]) this.shaping_list[type.id] = new ModObjectType(type);
				});
			});
		}

		removeObject (id) {
			safeHandler(() => {
				this.#node.objects.remove(id);
				if (id != null) {
					delete this.objects_by_id[id];
					let index = this.objects.find(o => o.object.id === id);
					if (index >= 0) this.objects.splice(index, 1);
				}
				else {
					this.objects = [];
					this.objects_by_id = {};
				}
			});
		}

		setUIComponent (component) {
			safeHandler(() => this.#node.ships.ui_components.set(component));
			return dataLength(component);
		}

		#handleList (array, construct) {
			for (let entity of this.#node[array]) {
				if (!entity.modding.data.browser_proxy_initialized) this[array].push(new construct(this, entity));
			}
			let i = 0;
			while (i < this[array].length) {
				if (this[array][i].killed) {
					this[array].splice(i, 1);
				}
				else ++i;
			}
		}

		tick (t) {
			this.step = t.step;

			this.#handleList("aliens", Alien);
			this.#handleList("asteroids", Asteroid);
			this.#handleList("collectibles", Collectible);
			this.#handleList("ships", Ship);
		}

		collectibleCreated () {

		}

		asteroidCreated () {

		}

		alienCreated () {

		}
	}

	// hide the console
	this.console = {};

	renameClass(this.console, parentGlobal.console, "console");

	for (let k of Object.keys(console)) {
		if (k === "Console") continue;
		if ("function" === typeof console[k]) this.console[k] = natifyFunc(function (...args) {
			console[k](...args);
		}, k);
		else Object.defineProperty(this.console, k, {
			enumerable: true,
			configurable: false,
			get: natifyFunc(function () { return cloneObject(console[k]) }, `get ${k}`)
		});
	}

	// start modding session
	const modding = new Modding(node, this.remoteCompile);

	// cleanup
	delete this.node;
	delete this.ModdingEvents;
	delete this.remoteCompile;
	delete this.compile;
	delete this.getValue;
	delete this.remoteLog;
	delete this.strictMode;
	delete this.registerEvent;
	delete this.disableNetwork;

	return { setCode, modding, execute, echo, error };
}).call(globalThis);

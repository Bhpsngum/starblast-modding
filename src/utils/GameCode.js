(function setup () {
	// open | macro | close
	const tokenizer_regex = /(\[\[[usoibg!@]*;[^\[]*?;[^\[]*?\])|(\[\[([^\]]+)\]\])|(\\{0,1}\])/;

	const { compile, getValue } = window;

	const execute = function (command, allowEval = false, timeout) {
		let cmdName = command.trim().split(" ")[0] || "";
		if (cmdName && "function" === typeof (cmd = modding.commands?.[cmdName])) {
			return cmd.call(modding.commands, command);
		}
		else if (!allowEval) {
			if (!cmdName) throw new Error("No terminal command specified");
			throw new Error("Unknown terminal command: " + cmdName);
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
					newStr += `${strip_formatting(String(execute(match[3], true)))}\n`;
				}
				catch (e) {
					modding.terminal.error(e);
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

			excludeList.push("id", "uuid", "custom", "__proto__", "inactive_field", "structure_type", "lastAliveStep", "createdStep");

			for (let k in baseEntity) {
				if (!excludeList.includes(k) && "function" !== typeof baseEntity[k]) {
					Object.defineProperty(this, k, {
						enumerable: true,
						configurable: false,
						get () { return baseEntity[k] },
						set (v) {}
					})
				}
			}
		}

		modding = {};
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
			super(game, baseEntity, ["ui_components", "customization", "stats", "angle"]);

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

		if (gEntity == null && create) {
			gEntity = new creator.f(game, entity);
			game[ns + "s"].push(gEntity);
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

			node.on(ModdingEvents.TICK, (tick) => {
				this.#handle(() => this.tick({ step: tick }));
			});
	
			node.on(ModdingEvents.MOD_STARTED, (link) => {
				this.#handle(() => {
					this.game.options = cloneObject(this.#node.options);
					this.modStarted(link);
				});
			});
	
			node.on(ModdingEvents.MOD_STOPPED, () => {
				this.#handle(() => {
					this.stopped();
				})
			});
	
			node.on(ModdingEvents.SHIP_RESPAWNED, (ship) => {
				this.#handle(() => {
					this.context?.event?.({
						name: "ship_spawned",
						ship: locateEntity(this.game, ship, "ship")
					}, this.game);
				})
			});
	
			node.on(ModdingEvents.SHIP_SPAWNED, (ship) => {
				this.#handle(() => {
					this.context?.event?.({
						name: "ship_spawned",
						ship: locateEntity(this.game, ship, "ship", true)
					}, this.game);
				})
			});
	
			node.on(ModdingEvents.SHIP_DESTROYED, (ship, killer) => {
				this.#handle(() => {
					this.context?.event?.({
						name: "ship_destroyed",
						ship: locateEntity(this.game, ship, "ship"),
						killer: locateEntity(this.game, killer, "ship")
					}, this.game);
				})
			});

			node.on(ModdingEvents.SHIP_DISCONNECTED, (ship) => {
				this.#handle(() => {
					ship = locateEntity(this.game, ship, "ship");
					if (ship) ship.killed = true;
				})
			});
	
			node.on(ModdingEvents.ALIEN_CREATED, (alien) => {
				this.#handle(() => this.game.alienCreated(alien.request_id, alien.id));
			});
	
			node.on(ModdingEvents.ALIEN_DESTROYED, (alien, killer) => {
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
	
			node.on(ModdingEvents.ASTEROID_CREATED, (asteroid) => {
				this.#handle(() => this.game.asteroidCreated(asteroid.request_id, asteroid.id));
			});

			node.on(ModdingEvents.ASTEROID_DESTROYED, (asteroid, killer) => {
				this.#handle(() => {
					asteroid = locateEntity(this.game, asteroid, "asteroid");
					if (!asteroid) asteroid.killed = true; 
					this.context?.event?.({
						name: "asteroid_destroyed",
						asteroid,
						killer: locateEntity(this.game, killer, "ship")
					})
				})
			});
	
			node.on(ModdingEvents.COLLECTIBLE_CREATED, (collectible) => {
				this.#handle(() => this.game.collectibleCreated(collectible.request_id, collectible.id));
			});
	
			node.on(ModdingEvents.COLLECTIBLE_PICKED, (collectible, ship) => {
				this.#handle(() => {
					collectible = locateEntity(this.game, collectible, "collectible");
					if (!collectible) collectible.killed = true; 
					this.context?.event?.({
						name: "collectible_picked",
						collectible,
						ship: locateEntity(this.game, ship, "ship")
					})
				})
			});

			node.on(ModdingEvents.UI_COMPONENT_CLICKED, (component, ship) => {
				this.#handle(() => {
					this.context?.event?.({
						name: "ui_component_clicked",
						id: component.id,
						ship: locateEntity(this.game, ship, "ship")
					}, this.game);
				})
			});
		}

		#handle (func) {
			try { func () } catch (e) {
				this.#node.error(e);
			}
		}

		#node;
		#remoteCompile;

		terminal = {
			echo: (item) => this.#node.log(strip_formatting(String(item))),
			error: (item) => this.#node.error(String(item))
		};

		commands = {
			clear: () => console.clear(),
			start: async () => void await this.run(),
			stop: async () => void await this.stop(),
			test: () => {
				if (!this.#node.started) throw new Error("Mod isn't started. Use 'start' first");
				return "Test link: " + this.#node.link;
			},
			region: (e) => {
				let region = e.split(" ")[1];
				this.#node.setRegion(region);
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
			if (this.#node.processStarted) this.terminal.error("Mod already running, use stop first");

			this.game = new Game(this.#node, this);
			window.game = this.game;
			window.echo = (str) => this.terminal.echo(str);

			let t = Date.now();
			try {
				await this.compile();
			}
			catch (e) { this.#node.error(e) }
			this.terminal.echo("Code initialization took " + (Date.now() - t) + "ms");

			this.#node.setOptions(Object.assign({}, this.context?.options ?? {}));
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

		setObject () {}

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

				let result = cloneObject(this.#node.objects.set(data));
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

	(function hideConsole () {
		let { console } = this;
		this.console = {
			[Symbol.toStringTag]: "console"
		};

		for (let k of Object.keys(console)) {
			if ("function" === typeof console[k]) this.console[k] = function (...args) {
				console[k](...args);
			}
			else Object.defineProperty(this.console, k, {
				enumerable: true,
				configurable: false,
				get () { return cloneObject(console[k]) },
				set (v) {}
			});
		}
	})();

	// start modding session
	const modding = new Modding(this.node, this.remoteCompile);

	// cleanup
	delete this.node;
	delete this.ModdingEvents;
	delete this.remoteCompile;
	delete this.compile;
	delete this.getValue;

	return { setCode, modding, execute };
})();
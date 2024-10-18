const hookClass = function(game, origin, addtionalHookFunc) {
	let oldClass = origin.StructureConstructor;
	let newClass = class HookedStructure extends oldClass {
		id = -1;
		
		get game () {
			return game;
		}

		get killed () {
			return !!this.modding.data[this.inactive_field];
		}

		get last_updated () {
			return this.lastUpdatedStep;
		}

		[Symbol.toStringTag] = `HookedClass (${oldClass.name})`;
	}

	if ("function" == typeof addtionalHookFunc) addtionalHookFunc(newClass);

	origin.StructureConstructor = newClass;
	origin.isInstance = function (entity) {
		return entity instanceof oldClass;
	}
}

class Game {
	constructor (node, browser) {
		this.#node = node;
		this.modding.terminal = {
			echo: node.log.bind(node),
			error: node.error.bind(node)
		}

		Object.assign(this.modding.commands, {
			start: function () {
				browser.start();
			},
			stop: function () {
				browser.stop();
			},
			test: function () {
				if (!node.started) throw new Error("Mod isn't started. Use 'start' first");
				return "Test link: " + node.link;
			},
			region: function (e) {
				let region = e.split(" ")[1];
				node.setRegion(region);
				return "Region set to " + region;
			},
			help: function () {
				return ("\n" +
					"-----------------------------CONSOLE HELP-----------------------------\n" +
					"start                     launch modded game\n" +
					"stop                      kill modded game\n" +
					"region <region>           change server region.\n" +
					"  ex: region Europe\n" +
					"anything JavaScript       execute JavaScript code (permission required)\n" + 
					"  ex: game.addAlien()\n" +
					"help                      display this help\n\n" +
					`starblast-modding BrowserClient v${node.version}`
				);
			}
		});

		// hook the classes
		for (let i of ["alien", "asteroid", "collectible"]) {
			hookClass(this, node[i + "s"]);
		}

		hookClass(this, node.ships, function (newClass) {
			newClass.prototype.setUIComponent = function (data) {
				this.ui_components.set(data);
			};
			Object.defineProperties(newClass.prototype, {
				stats: {
					get () { return this.modding.data.stats?.reduce?.((a, b) => a * 10 + b, 0) ?? 0 }
				},
				r: {
					get () { return this.angle * Math.PI / 180 }
				}
			});
		});
	}

	#node;

	modding = {
		game: this,
		context: {},
		commands: {
			clear: function () {
				console.clear();
			}
		},
		tick: function (tick) {
			this.game.tick(tick);
			this.context.tick?.(this.game);
		}
	}

	get custom () {
		return this.#node.custom
	}

	set custom (value) {
		this.#node.custom = value
	}

	setCustomMap (...args) {
		this.#node.setCustomMap(...args)
	}

	setOpen (...args) {
		this.#node.setOpen(...args)
	}

	get options () {
		return this.#node.options ?? null
	}

	get step () {
		return this.#node.timer.step
	}

	get link () {
		return this.#node.link ?? null
	}

	get ships () {
		return this.#node.ships.array(true).filter(ship => ship.isActive());
	}

	get aliens () {
		return this.#node.aliens.array(true).filter(alien => !alien.killed);
	}

	get asteroids () {
		return this.#node.asteroids.array(true).filter(asteroid => !asteroid.killed);
	}

	get collectibles () {
		return this.#node.collectibles.array(true).filter(collectible => !collectible.killed);
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

	addAlien (data) {
		let { aliens } = this.#node;
		let alien = aliens.create(data); 
		aliens.add(alien).then(a => {}).catch(e => this.#node.error(e));
		return alien;
	}

	addAsteroid (data) {
		let { asteroids } = this.#node;
		let asteroid = asteroids.create(data); 
		asteroids.add(asteroid).then(a => {}).catch(e => this.#node.error(e));
		return asteroid;
	}

	addCollectible (data) {
		let { collectibles } = this.#node;
		let collectible = collectibles.create(data); 
		collectibles.add(collectible).then(a => {}).catch(e => this.#node.error(e));
		return collectible;
	}

	setUIComponent (...data) {
		this.#node.ships.ui_components.set(...data)
	}

	setObject (...data) {
		let obj = data[0];
		if (obj?.type?.physics && obj.type.physics.shape == null) obj.type.physics.autoShape = true;
		this.#node.objects.set(...data)
	}

	removeObject (...data) {
		this.#node.objects.remove(...data)
	}

	tick (tick) {

	}

	collectibleCreated () {

	}
}

module.exports = Game

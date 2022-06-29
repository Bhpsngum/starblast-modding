const fs = require('fs').promises;
const https = require('https');
const http = require('http');

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

const ModdingEvents = require("../resources/Events.js");

const ModdingClient = require("./ModdingClient.js");

const Game = require("../utils/Game.js");

/**
 * The Browser Client Instance for supporting mod codes running in Browser Modding.
 * @param {object} options - options for calling the object.<br><b>Note that</b> if both one property and its aliases exist on the object, the value of the main one will be chosen
 * @param {boolean} options.cacheECPKey - set to <code>true</code> if you want to reuse ECP Key for the next run, <code>false</code> otherwise
 * @param {boolean} [options.sameCodeExecution = false] - loading the same code will trigger the execution or not<br>**Note:** This feature only works when you call `loadCodeFromString`, `loadCodeFromLocal` or `loadCodeFromExternal` methods, and not during the auto-update process
 * @param {boolean} [options.crashOnException = false] - when tick or event function, or mod code execution fails, the mod will crash (true)
 * @param {boolean} options.crashOnError - alias of the property <code>options.crashOnException</code>
 * @param {boolean} [options.logErrors = true] - game will log any errors or not
 * @param {boolean} options.logExceptions - alias of the property <code>options.logErrors</code>
 * @param {boolean} [options.logMessages = true] - game will log any in-game logs or not
 */

class BrowserClient {
  constructor(options) {
    this.#sameCodeExecution = !!options?.sameCodeExecution;
    let logErrors = this.#logErrors = !!(options?.logErrors ?? options.logExceptions ?? true);
    let logMessages = this.#logMessages = !!(options?.logMessages ?? true);
    let crashOnError = this.#crashOnError = !!(options?.crashOnException ?? options?.crashOnError);
    let node = this.#node = new ModdingClient({...options, cacheEvents: true, cacheOptions: false});

    let _this = this, handle = function (spec, ...params) {
      let context = this.#game.modding?.context;
      this.#handle(context?.[spec]?.bind(context), ...params, this.#game)
    }.bind(this);

    for (let i of ["ship", "alien", "asteroid", "collectible"]) {
      Object.defineProperty(node[i + "s"].StructureConstructor.prototype, 'game', {
        get () { return _this.#game },
        set (value) {}
      });
    }

    node.on(ModdingEvents.TICK, function (tick) {
      _this.#game?.modding?.tick?.();
      handle('tick')
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

    node.on(ModdingEvents.MOD_STOPPED, function () {
      _this.#setWatchInterval(false, null);
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

    node.on(ModdingEvents.UI_COMPONENT_CLICKED, function (id, ship) {
      handle('event', {name: "ui_component_clicked", id, ship})
    });
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
    return this.#node
  }

  /**
   * Get the game object, which acts the same as the <code>game</code> object in browser
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
    try { func?.(...params) }
    catch (e) {
      if (this.#crashOnError) throw e;
      else this.#node.error(e)
    }
  }

  #setWatchInterval (watchChanges, interval) {
    clearInterval(this.#watchIntervalID);
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
   * @param {number} [interval = 5000] - The interval between watchs (if <code>watchChanges<code> is set to <code>true</code>)
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
   * @param {number} [interval = 5000] - The interval between watchs (if <code>watchChanges<code> is set to <code>true</code>)
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
    let URL = String(this.#URL);
    return new Promise(function (resolve, reject) {
      let fetcher = URL.startsWith("https://") ? https : http;
      fetcher.get(URL, function (res) {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let error;
        // Any 2xx status code signals a successful response but
        // here we're only checking for 200.
        if (Math.trunc(statusCode / 100) != 2) {
          res.resume();
          reject(new Error("Failed to fetch the file at URL '" + URL + "'. Resource status code: "+ statusCode))
        }

        let rawData = '';

        res.setEncoding('utf8');
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', function () {
          resolve(rawData)
        });
      }).on('error', reject)
    })
  }

  async #applyChanges (forced) {
    try {
      let lastCode = this.#lastCode;
      this.#lastCode = this.#URL ? (await this.#fromExternal()) : (this.#path ? (await this.#fromLocal()) : this.#code);
      if (this.#watchChanges && (this.#URL != null || this.#path != null) && !this.#assignedWatch) {
        clearInterval(this.#watchIntervalID);
        this.#watchIntervalID = setInterval(this.#applyChanges.bind(this), this.#watchInterval);
        this.#assignedWatch = true;
      }
      let sameCode = this.#lastCode == lastCode;
      if (forced ? (!sameCode || this.#sameCodeExecution) : !sameCode) {
        if (!this.#node.processStarted) this.#game = new Game(this.#node);
        else try { this.#game.modding.context = {} } catch (e) {};
        let game = this.#game;
        await new AsyncFunction("game", "echo", "window", "global", this.#lastCode).call(game.modding.context, game, game.modding.terminal.echo, global, void 0)
      }

    }
    catch (e) {
      this.#handle(function () { throw e })
    }
  }

  /**
   * Starts the game
   * @returns {string} Link of the game
   */

  async start () {
    let node = this.#node;
    if (!this.#node.processStarted) {
      await this.#applyChanges(true);
      node.setOptions(Object.assign({}, this.#game.modding?.context?.options))
    }
    else if (!this.#node.started) throw new Error("Mod is starting. Please be patience");
    return await node.start()
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

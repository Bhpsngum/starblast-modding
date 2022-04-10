'use strict';

const EventEmitter = require("events");
const defineProperties = require("../utils/defineProperties.js");
const toString = require("../utils/toString.js");
const StructureManager = require("../managers/StructureManager.js");
const managers = [
  { path: ["ships"] },
  { path: ["asteroids"] },
  { path: ["aliens"] },
  { path: ["collectibles"] },
  { path: ["objects"] },
  { path: ["objects", "types"] },
  { path: ["teams"], },
  { path: ["teams", "stations"] },
  { path: ["teams", "stations"], mapper: v => v.modules }
];

/**
 * The Modding Client Instance.
 * @extends {EventEmitter}
 * @param {object} options - options for calling the object, currently has the following properties:<br><ul><li><b><code>cacheConfiguration</code></b> - set to <code>true</code> if you want to reuse data (ECP Key, regions, etc.) for the next run, <code>false</code> otherwise</li></ul>
 */

class ModdingClient extends EventEmitter {

  constructor (options) {
    super();
    var modding = {};
    defineProperties(modding, {
      api: new (require("../rest/ModdingAPI.js"))(this, options),
      gameClient: new (require("./GameClient.js"))(this),
      events: require("../resources/Events.js"),
      handlers: defineProperties({}, {
        create: new Map(),
        destroy: new Map()
      }),
      create_requests: [],
      data: {}
    });
    defineProperties(this, {modding});
    this.reset(true)
  }

  #gameClient;

  /**
   * Indicates if the game is started or not.
   * @type {boolean}
   * @readonly
   */

  get started () {
    return !!this.modding.api.started
  }

  /**
   * Indicates if the game is stopped or not.
   * @type {boolean}
   * @readonly
   */

  get stopped () {
    return !!this.modding.api.stopped
  }

  /**
   * Trigger the <code>onError</code> event.
   * @param {string} message - Error message
   * @returns {boolean}
   */

  error (message) {
    return this.emit('error', new Error(message), this)
  }

  /**
   * Trigger the <code>onLog</code> event.
   * @param {string} messages - Log messages strings
   * @returns {boolean}
   */

  log (...data) {
    return this.emit(this.modding.events.LOG, ...data)
  }

  /**
   * Set the region of the client.
   * @param {string} regionName - region name, must be either Asia, America or Europe
   * @returns {ModdingClient}
   */

  setRegion (region) {
    if (this.started) return this.error("Could not set region while the mod is running");
    this.modding.api.configuration.region = region;
    return this
  }

  /**
   * Set the options for the modded game
   * @param {options} options - game options, same as <code>this.options</code> uses in browser modding
   * @returns {ModdingClient}
   */

  setOptions (options) {
    if (this.started) return this.error("Could not set options while the mod is running");
    this.modding.api.configuration.options = options;
    return this
  }

  /**
   * Set the ECP key that client will use for requests
   * @param {string} ECPKey - The ECP key
   * @returns {ModdingClient}
   */

  setECPKey (ECPKey) {
    if (this.started) return this.error("Could not set ECPKey while the mod is running");
    this.modding.api.configuration.ECPKey = ECPKey;
    return this
  }

  /**
   * Configure the client
   * @param {object} options - An object with the following properties:<br><ul><li><b><code>options</code></b> - Modded game options</li><li><b><code>region</code></b> - Modded game region</li><li><b><code>ECPKey</code></b> - ECP key</li></ul>
   * @returns {ModdingClient}
   */

  configure (options) {
    if (this.started) return this.error("Could not configure while the mod is running");
    if (options?.hasOwnProperty?.('region')) this.setRegion(options.region);
    if (options?.hasOwnProperty?.('options')) this.setOptions(options.options);
    if (options?.hasOwnProperty?.('ECPKey')) this.setECPKey(options.ECPKey);
    return this
  }

  /**
   * Set the game state to "open"(true) (still attracts new players) or "closed"(false) (not attract new players)
   * @param {boolean} isOpen - <code>true</code> to keep the game open, <code>false</code> otherwise.
   * @returns {ModdingClient}
   */

  setOpen (value) {
    this.modding.api.name("set_open").prop("value", value).send();
    return this
  }

  /**
   * Set the custom map for the game
   * @param {string} mapPattern - The map pattern
   * @returns {ModdingClient}
   */

  setCustomMap (map) {
    this.modding.api.name("set_custom_map").data(map).send();
    return this
  }

  /**
   * Find a structrue based on its UUID
   * @param {string} uuid - An UUID (Universal Unique Identifier) to search for
   * @returns {Structure} - The structure object, <code>null</code> if not found any.
   */

  findStructureByUUID (uuid, includeInactive = false) {
    Search: for (let keys of managers) {
      let manager = this;
      for (let key of keys.path) {
        manager = manager[key];
        if (manager == null) continue Search
      }
      if (!(manager instanceof StructureManager)) continue Search;
      if (includeInactive) manager = manager.all;
      if ("function" == typeof keys.mapper) manager = manager.map(keys.mapper);
      let results = manager.flat(Infinity).find(structure => Object.is(structure.uuid, uuid));
      if (results != null) return results
    }

    return null
  }

  /**
   * Starts the game
   * @param {object} options - Options Object, same as calling configure(options)
   * @returns {Promise<string>} Link of the game
   */

  async start (options) {
    if (this.started) throw new Error("Mod already started");
    return await this.configure(options).modding.api.start()
  }

  /**
   * Stops the game
   * @returns {Promise<ModdingClient>}
   */

  async stop () {
    if (this.stopped) throw new Error("Mod already stopped");
    return await this.modding.api.stop()
  }

  /**
   * The ship manager of the game
   * @type {ShipManager}
   * @readonly
   */

  get ships () {
    return this.modding.data.ships.update()
  }

  /**
   * The alien manager of the game
   * @type {AlienManager}
   * @readonly
   */

  get aliens () {
    return this.modding.data.aliens.update()
  }

  /**
   * The asteroid manager of the game
   * @type {AsteroidManager}
   * @readonly
   */

  get asteroids () {
    return this.modding.data.asteroids.update()
  }

  /**
   * The collectible manager of the game
   * @type {CollectibleManager}
   * @readonly
   */

  get collectibles () {
    return this.modding.data.collectibles.update()
  }

  /**
   * The object manager of the game
   * @type {ObjectManager}
   * @readonly
   */

  get objects () {
    return this.modding.data.objects.update()
  }

  /**
   * The team manager of the game. Coule be <code>null</code> if the modded game is not team-based.
   * @type {TeamManager}
   * @readonly
   */

  get teams () {
    return this.modding.data.teams?.update?.() ?? null
  }

  /**
   * The game options object
   * @type {object}
   * @readonly
   */

  get options () {
    return this.modding.data.options
  }

  /**
   * The game step
   * @type {number}
   * @readonly
   */

  get step () {
    return this.modding.data.step
  }

  /**
   * The game link
   * @type {string}
   * @readonly
   */

  get link () {
    let api = this.modding.api;
    return (api.started && !api.stopped) ? "https://starblast.io/#" + api.id + "@" + api.ip + ":" + api.port : null
  }

  reset (init) {

    /**
     * Custom object served for assigning data by the user
     * @type {object}
     */

    this.custom = {};
    let stopError = new Error("Mod had stopped before the action could be completed");
    for (let key of ["create", "destroy"]) {
      let handlers = [...this.modding.handlers[key].entries()];
      this.modding.handlers[key].clear();
      for (let handler of handlers) handler[1]?.reject?.(stopError)
    }
    this.modding.create_requests.splice(0);
    Object.assign(this.modding.data, {
      aliens: new (require("../managers/AlienManager.js"))(this),
      asteroids: new (require("../managers/AsteroidManager.js"))(this),
      collectibles: new (require("../managers/CollectibleManager.js"))(this),
      ships: new (require("../managers/ShipManager.js"))(this),
      objects: new (require("../managers/ObjectManager.js"))(this),
      teams: null,
      options: null,
      step: -1
    });
    if (!init) this.modding.api.reset()
  }
}

module.exports = ModdingClient

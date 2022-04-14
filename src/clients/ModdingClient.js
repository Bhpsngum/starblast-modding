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

const cloneObj = function (obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * The Modding Client Instance.
 * @extends {EventEmitter}
 * @param {object} options - options for calling the object, currently has the following properties:<br><ul><li><b><code>cacheECPKey</code></b> - set to <code>true</code> if you want to reuse ECP Key for the next run, <code>false</code> otherwise</li><li><b><code>cacheOptions</code></b> - set to <code>true</code> if you want to reuse request options for the next run, <code>false</code> otherwise</li><li><b><code>cacheEvents</code></b> - set to <code>true</code> if you want to reuse all event handlers for the next run, <code>false</code> otherwise</li></ul>
 */

class ModdingClient extends EventEmitter {

  constructor (options) {
    super();
    this.#api = new (require("../rest/ModdingAPI.js"))(this, options);
    this.reset(true)
  }

  #api;

  /**
   * Indicates if the game is started or not.
   * @type {boolean}
   * @readonly
   */

  get started () {
    return !!this.#api.started
  }

  /**
   * Indicates if the game is stopped or not.
   * @type {boolean}
   * @readonly
   */

  get stopped () {
    return !!this.#api.stopped
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
    return this.emit(this.#api.events.LOG, ...data)
  }

  /**
   * Set the region of the client.
   * @param {string} regionName - region name, must be either Asia, America or Europe
   * @returns {ModdingClient}
   */

  setRegion (region) {
    if (this.started) return this.error("Could not set region while the mod is running");
    this.#api.setRegion(region);
    return this
  }

  /**
   * Set the options for the modded game
   * @param {options} options - game options, same as <code>this.options</code> uses in browser modding
   * @returns {ModdingClient}
   */

  setOptions (options) {
    if (this.started) return this.error("Could not set options while the mod is running");
    this.#api.setOptions(options);
    return this
  }

  /**
   * Set the ECP key that client will use for requests
   * @param {string} ECPKey - The ECP key
   * @returns {ModdingClient}
   */

  setECPKey (ECPKey) {
    if (this.started) return this.error("Could not set ECPKey while the mod is running");
    this.#api.setECPKey(ECPKey);
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
    this.#api.name("set_open").prop("value", value).send();
    return this
  }

  /**
   * Set the custom map for the game
   * @param {string} mapPattern - The map pattern
   * @returns {ModdingClient}
   */

  setCustomMap (map) {
    this.#api.name("set_custom_map").data(map).send();
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
    return await this.configure(options).#api.start()
  }

  /**
   * Stops the game
   * @returns {Promise<ModdingClient>}
   */

  async stop () {
    if (this.stopped) throw new Error("Mod already stopped");
    return await this.#api.stop()
  }

  /**
   * Returns a copy of the options object that was sent to the server from the start
   * @type {object}
   * @readonly
   */

  get requestOptions () {
    return cloneObj(this.#api.getRequestOptions())
  }

  /**
   * Game region
   * @type {string}
   * @readonly
   */

  get region () {
    return this.started && !this.stopped ? this.#api.getRegion() : null;
  }

  /**
   * The ship manager of the game
   * @type {ShipManager}
   * @readonly
   */

  get ships () {
    return this.#api.mod_data.ships.update()
  }

  /**
   * The alien manager of the game
   * @type {AlienManager}
   * @readonly
   */

  get aliens () {
    return this.#api.mod_data.aliens.update()
  }

  /**
   * The asteroid manager of the game
   * @type {AsteroidManager}
   * @readonly
   */

  get asteroids () {
    return this.#api.mod_data.asteroids.update()
  }

  /**
   * The collectible manager of the game
   * @type {CollectibleManager}
   * @readonly
   */

  get collectibles () {
    return this.#api.mod_data.collectibles.update()
  }

  /**
   * The object manager of the game
   * @type {ObjectManager}
   * @readonly
   */

  get objects () {
    return this.#api.mod_data.objects.update()
  }

  /**
   * The team manager of the game. Coule be <code>null</code> if the modded game is not team-based.
   * @type {TeamManager}
   * @readonly
   */

  get teams () {
    return this.#api.mod_data.teams?.update?.() ?? null
  }

  /**
   * Returns a copy of game options object
   * @type {object}
   * @readonly
   */

  get options () {
    return cloneObj(this.#api.mod_data.options)
  }

  /**
   * The game step
   * @type {number}
   * @readonly
   */

  get step () {
    return this.#api.mod_data.step
  }

  /**
   * The game link
   * @type {string}
   * @readonly
   */

  get link () {
    let api = this.#api;
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
      let handlers = [...this.#api.handlers[key].entries()];
      this.#api.handlers[key].clear();
      for (let handler of handlers) handler[1]?.reject?.(stopError)
    }
    this.#api.create_requests.splice(0);
    Object.assign(this.#api.mod_data, {
      aliens: new (require("../managers/AlienManager.js"))(this, this.#api),
      asteroids: new (require("../managers/AsteroidManager.js"))(this, this.#api),
      collectibles: new (require("../managers/CollectibleManager.js"))(this, this.#api),
      ships: new (require("../managers/ShipManager.js"))(this, this.#api),
      objects: new (require("../managers/ObjectManager.js"))(this, this.#api),
      teams: null,
      options: null,
      step: -1
    });
    if (!init) this.#api.reset()
  }
}

module.exports = ModdingClient

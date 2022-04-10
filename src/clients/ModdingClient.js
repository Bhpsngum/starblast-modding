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

  get started () {
    return !!this.modding.api.started
  }

  get stopped () {
    return !!this.modding.api.stopped
  }

  error (message) {
    return this.emit('error', new Error(message), this)
  }

  log (...data) {
    return this.emit(this.modding.events.LOG, ...data)
  }

  setRegion (region) {
    if (this.started) return this.error("Could not set region while the mod is running");
    this.modding.api.configuration.region = region;
    return this
  }

  setOptions (options) {
    if (this.started) return this.error("Could not set options while the mod is running");
    this.modding.api.configuration.options = options;
    return this
  }

  setECPKey (ECPKey) {
    if (this.started) return this.error("Could not set ECPKey while the mod is running");
    this.modding.api.configuration.ECPKey = ECPKey;
    return this
  }

  configure (options) {
    if (this.started) return this.error("Could not configure while the mod is running");
    if (options?.hasOwnProperty?.('region')) this.setRegion(options.region);
    if (options?.hasOwnProperty?.('options')) this.setOptions(options.options);
    if (options?.hasOwnProperty?.('ECPKey')) this.setECPKey(options.ECPKey);
    return this
  }

  setOpen (value) {
    this.modding.api.name("set_open").prop("value", value).send();
    return this
  }

  setCustomMap (map) {
    this.modding.api.name("set_custom_map").data(map).send();
    return this
  }

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

  async start (options) {
    if (this.started) throw new Error("Mod already started");
    return await this.configure(options).modding.api.start()
  }

  async stop () {
    if (this.stopped) throw new Error("Mod already stopped");
    return await this.modding.api.stop()
  }

  get ships () {
    return this.modding.data.ships.update()
  }

  get aliens () {
    return this.modding.data.aliens.update()
  }

  get asteroids () {
    return this.modding.data.asteroids.update()
  }

  get collectibles () {
    return this.modding.data.collectibles.update()
  }

  get objects () {
    return this.modding.data.objects.update()
  }

  get teams () {
    return this.modding.data.teams?.update?.() ?? null
  }

  get options () {
    return this.modding.data.options
  }

  get step () {
    return this.modding.data.step
  }

  get link () {
    let api = this.modding.api;
    return (api.started && !api.stopped) ? "https://starblast.io/#" + api.id + "@" + api.ip + ":" + api.port : null
  }

  reset (init) {
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

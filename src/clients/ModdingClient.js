'use strict';

const EventEmitter = require("events");
const defineProperties = require("../utils/defineProperties.js");
const toString = require("../utils/toString.js");

class ModdingClient extends EventEmitter {
  constructor (options) {
    super();
    var modding = {};
    defineProperties(modding, {
      api: new (require("../rest/ModdingAPI.js"))(this, options),
      gameClient: new (require("./GameClient.js"))(this),
      events: require("../resources/Events.js")(),
      // handlers: defineProperties({}, {
      //   create: new Map(),
      //   destroy: new Map()
      // }),
      data: {}
    });
    defineProperties(this, {modding});
    this.reset(true)
  }

  get started () {
    return !!this.modding.api.started
  }

  get stopped () {
    return !!this.modding.api.stopped
  }

  error (message) {
    return this.emit('error', new Error(message), this)
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

  findStructureByUUId (uuid) {
    let manager_name = toString(uuid).split("-")[0], manager;
    switch (manager_name) {
      case "station_module":
        manager = this.teams?.stations?.map(station => station?.modules)?.flat?.() ?? [];
        break;
      case "object_type":
        manager = this.objects.types;
        break;
      case "station":
        manager = this.teams.stations;
        break;
      default:
        manager = this[manager_name + "s"]
    }
    return manager?.find(structure => Object.is(structure.uuid, uuid)) ?? null
  }

  async start (options) {
    if (this.started) throw new Error("Mod already started");
    return await this.configure(options).modding.api.start()
  }

  stop () {
    if (this.stopped) this.error("Mod already stopped");
    this.modding.api.stop()
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
    // let stopError = new Error("Mod had stopped before the action could be completed");
    // for (let key of ["create", "destroy"]) {
    //   let handlers = this.modding.handlers[key];
    //   for (let handler of handlers) {
    //     let reject = handler[1]?.reject;
    //     if ("function" == typeof reject) reject(error)
    //   }
    //   handlers.clear()
    // }
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

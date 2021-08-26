'use strict';

const EventEmitter = require("events");
const defineProperties = require("../utils/defineProperties.js");

class ModdingClient extends EventEmitter {
  constructor (options) {
    super();
    var modding = {};
    defineProperties(modding, {
      api: new (require("../rest/ModdingAPI.js"))(this, options),
      events: require("../resources/Events.js")(),
      data: {}
    });
    defineProperties(this, {modding});
    this.reset()
  }

  get started () {
    return !!this.modding.api.started
  }

  get stopped () {
    return !!this.modding.api.stopped
  }

  setRegion (region) {
    this.modding.api.region = region;
    return this
  }

  setOptions (options) {
    this.modding.api.options = options;
    return this
  }

  setECPKey (ECPKey) {
    this.modding.api.ECPKey = ECPKey;
    return this
  }

  setOpen (value) {
    this.modding.api.name("set_open").prop("value",!!value).send();
    return this
  }

  setCustomMap (map) {
    this.modding.api.name("set_custom_map").data(map).send();
    return this
  }

  async start (options) {
    if (this.started) throw new Error("Mod already started");
    if (options.hasOwnProperty('region')) this.setRegion(options?.region);
    if (options.hasOwnProperty('options')) this.setOptions(options?.options);
    if (options.hasOwnProperty('ECPKey')) this.setECPKey(options?.ECPKey);
    return await this.modding.api.start()
  }

  stop () {
    if (!this.stopped) this.modding.api.stop()
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

  reset () {
    this.custom = {}
    Object.assign(this.modding.data, {
      aliens: new (require("../managers/AlienManager.js"))(this),
      asteroids: new (require("../managers/AsteroidManager.js"))(this),
      collectibles: new (require("../managers/CollectibleManager.js"))(this),
      ships: new (require("../managers/ShipManager.js"))(this),
      objects: new (require("../managers/ObjectManager.js"))(this),
      teams: null,
      step: -1
    })
  }
}

module.exports = ModdingClient

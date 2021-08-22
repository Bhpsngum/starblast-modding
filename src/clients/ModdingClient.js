'use strict';

const EventEmitter = require("events");
const defineProperties = require("../utils/defineProperties.js");

class ModdingClient extends EventEmitter {
  constructor (options) {
    super();
    options = Object.assign({}, options);
    var modding = {};
    defineProperties(modding, {
      api: new (require("../rest/ModdingAPI.js"))(this, options),
      events: require("../resources/Events.js")()
    });
    defineProperties(this, {
      modding,
      client_custom: {}
    });
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
    options = options || {}
    if (options.hasOwnProperty('region')) this.setRegion(options.region);
    if (options.hasOwnProperty('options')) this.setOptions(options.options);
    if (options.hasOwnProperty('ECPKey')) this.setECPKey(options.ECPKey);
    return await this.modding.api.start()
  }

  stop () {
    if (!this.stopped) this.modding.api.stop()
  }

  get ships () {
    return this.modding.api.ships.update()
  }

  get aliens () {
    return this.modding.api.aliens.update()
  }

  get asteroids () {
    return this.modding.api.asteroids.update()
  }

  get collectibles () {
    return this.modding.api.collectibles.update()
  }

  get objects () {
    return this.modding.api.objects.update()
  }

  reset () {
    this.custom = {}
    this.step = -1;
    this.link = null;
    this.modding.api.resetManagers();
  }
}

module.exports = ModdingClient

'use strict';

const EventEmitter = require("events");

class ModdingClient extends EventEmitter {
  constructor (options) {
    super();
    options = options || {}
    this.aliens = new (require("../managers/AlienManager.js"))(this);
    this.asteroids = new (require("../managers/AsteroidManager.js"))(this);
    this.collectibles = new (require("../managers/CollectibleManager.js"))(this);
    this.ships = new (require("../managers/ShipManager.js"))(this);
    this.objects = new (require("../managers/ObjectManager.js"))(this);
    this.custom = {}
    this.step = -1;
    this.on('error', function(){});
    this.link = null;
    this.modding = {
      api: new (require("../rest/ModdingAPI.js"))(this, options),
      events: require("../resources/Events.js")
    }
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
    options = options || {}
    if (options.hasOwnProperty('region')) this.setRegion(options.region);
    if (options.hasOwnProperty('options')) this.setOptions(options.options);
    if (options.hasOwnProperty('ECPKey')) this.setECPKey(options.ECPKey);
    return await this.modding.api.start()
  }

  stop () {
    this.modding.api.stop()
  }

  reset () {
    this.aliens.reset();
    this.asteroids.reset();
    this.collectibles.reset();
    this.ships.reset();
    this.objects.reset();
    this.objects.types.reset();
    this.custom = {}
    this.step = -1;
    this.link = null;
  }
}

module.exports = ModdingClient

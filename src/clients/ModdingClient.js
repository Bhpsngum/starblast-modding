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
    this.started = false;
    this.stopped = false;
    this.custom = {}
    this.on('error', function(){});
    this.link = null;
    this.modding = {
      api: new (require("../rest/ModdingAPI.js"))(this, options)
    }
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

  setUIComponent (component) {
    this.modding.api.clientMessage(null, "set_ui_component", {component: component}).send();
    return this
  }

  start (options) {
    options = options || {}
    if (options.hasOwnProperty('region')) this.setRegion(options.region);
    if (options.hasOwnProperty('options')) this.setOptions(options.options);
    if (options.hasOwnProperty('ECPKey')) this.setECPKey(options.ECPKey);
    return this.modding.api.start()
  }

  stop () {
    this.modding.api.stop()
  }
}

module.exports = ModdingClient

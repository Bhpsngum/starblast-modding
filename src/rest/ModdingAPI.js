'use strict';

const runMod = require("../utils/runMod.js");

class ModdingAPI {
  constructor(game, options) {
    this.game = game;
    this.cacheECPKey = !!options?.cacheECPKey;
    this.cacheOptions = !!options?.cacheOptions;
    this.cacheEvents = !!options?.cacheEvents;
    this.compressWSMessages = !!options?.compressWSMessages;
    this.gameClient = new (require("../clients/GameClient.js"))(this.game, this),
    this.events = require("../resources/Events.js");
    this.handlers = {
      create: new Map(),
      destroy: new Map()
    }
    this.configuration = {};
    this.create_requests = [];
    this.mod_data = {};
    this.onstop = [];
    this.clientReset(this.game);
    this.stopped = false;
  }

  clear () {
    return this.set()
  }

  setOptions (options) {
    return this.configuration.options = options
  }

  setRegion (region) {
    return this.configuration.region = region
  }

  setECPKey (ECPKey) {
    return this.configuration.ECPKey = ECPKey
  }

  getRequestOptions () {
    return this.configuration.options
  }

  getRegion () {
    return this.configuration.region
  }

  reset () {
    this.started = false;
    this.stopped = true;
    this.processStarted = false;
    this.preflight_requests = [];
    this.clear();
    if (!this.cacheECPKey) delete this.configuration.ECPKey;
    if (!this.cacheOptions) delete this.configuration.options;
    if (!this.cacheEvents) this.game.removeAllListeners();
    if (this.game.listeners('error').length == 0) this.game.on('error', function () {});
    let onstops = this.onstop.splice(0);
    onstops.forEach(onstop => onstop?.resolve?.(this.game))
  }

  async start () {
    try {
      this.configuration.options = JSON.parse(JSON.stringify(this.configuration.options ?? {}));
      this.encodeOptionsError = false
    }
    catch (e) {
      this.configuration.options = {}
      this.encodeOptionsError = true
    }
    this.processStarted = true;
    return await runMod(this)
  }

  stop () {
    return new Promise(function(resolve, reject) {
      this.onstop.push({resolve, reject});
      this.name("stop").send(null, "stop")
    }.bind(this))
  }

  name (name) {
    return this.prop("name", name);
  }

  set (data) {
    this.pending_request = Object.assign({}, data);
    return this
  }

  prop (name, data) {
    this.pending_request[name] = data;
    return this
  }

  data (...data) {
    let pData = data[0] ?? {};
    Object.assign(pData, ...data.slice(1));
    return this.prop("data", pData)
  }

  clientMessage (id, name, data) {
    this.name("client_message");
    data = Object.assign({}, data, {name: name});
    return this.data({id, data})
  }

  globalMessage (name, data) {
    return this.clientMessage(null, name, data)
  }

  send (uuid, action) {
    let pr = this.pending_request;
    if (this.started) try {
      this.socket.send(JSON.stringify(pr));
      if ("string" == typeof pr.name && pr.name.match(/^add_(alien|asteroid|collectible)$/)) this.create_requests.push(pr.data.uuid)
    }
    catch(e) {
      if (arguments.length > 0) {
        let error = new Error("Failed to encoding request"), globalMessage;
        switch (action) {
          case "create":
          case "destroy": {
            let hanlder = this.handlers[action], reject = handler.get(uuid)?.reject;
            handler.delete(uuid);
            this.game.findStructureByUUID(uuid)?.markAsInactive?.();
            reject?.(error);
            break
          }
          case "stop":
            this.onstop.shift()?.reject?.(error);
            break;
          default:
            globalMessage = 1;
        }
        if (globalMessage) this.game.emit('error', error, this.game)
      }
    }
    else this.preflight_requests.push(pr);
    return this.clear()
  }

  clientReset (client) {

    /**
     * Custom object served for assigning data by the user
     * @name ModdingClient.prototype.custom
     * @type {object}
     */

    client.custom = {};
    let stopError = new Error("Mod had stopped before the action could be completed");
    for (let key of ["create", "destroy"]) {
      let handlers = [...this.handlers[key].entries()];
      this.handlers[key].clear();
      for (let handler of handlers) handler[1]?.reject?.(stopError)
    }
    this.create_requests.splice(0);
    Object.assign(this.mod_data, {
      aliens: new (require("../managers/AlienManager.js"))(client, this),
      asteroids: new (require("../managers/AsteroidManager.js"))(client, this),
      collectibles: new (require("../managers/CollectibleManager.js"))(client, this),
      ships: new (require("../managers/ShipManager.js"))(client, this),
      objects: new (require("../managers/ObjectManager.js"))(client, this),
      timer: new (require("../managers/TimeManager.js"))(client, this),
      teams: null,
      options: null,
      step: -1
    });
    this.reset();
  }
}

module.exports = ModdingAPI

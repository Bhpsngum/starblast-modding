'use strict';

const runMod = require("../utils/runMod.js");
const defineProperties = require("../utils/defineProperties.js");

class ModdingAPI {
  constructor(game, options) {
    this.#game = game;
    defineProperties(this, {
      preflight_requests: [],
      cacheConfiguration: !!options?.cacheConfiguration
    });
    this.clear();
    this.started = false;
    this.stopped = false;
    this.onstop = [];
    this.configuration = {}
  }

  #game;

  clear () {
    return this.set({})
  }

  reset () {
    this.started = false;
    this.stopped = true;
    this.preflight_requests.splice(0);
    this.clear();
    if (!this.cacheConfiguration) this.configuration = {};
    let onstops = this.onstop.splice(0);
    onstops.forEach(onstop => onstop?.resolve?.(this.#game))
  }

  async start () {
    try {
      this.data.options = JSON.parse(JSON.stringify(this.data.options ?? {}));
      this.encodeOptionsError = false
    }
    catch (e) {
      this.data.options = {}
      this.encodeOptionsError = true
    }
    return await runMod(this, this.#game)
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
    return this.data({id: id, data: data})
  }

  globalMessage (name, data) {
    return this.clientMessage(null, name, data)
  }

  send (uuid, action) {
    let pr = this.pending_request;
    if (this.started) try {
      this.socket.send(JSON.stringify(pr));
      if ("string" == typeof pr.name && pr.name.match(/^add_(alien|asteroid|collectible)$/)) this.#game.modding.create_requests.push(pr.data.uuid)
    }
    catch(e) {
      if (arguments.length > 0) {
        let error = new Error("Failed to encoding request"), globalMessage;
        switch (action) {
          case "create":
          case "destroy": {
            let hanlder = this.#game.modding.handlers[action], reject = handler.get(uuid)?.reject;
            handler.delete(uuid);
            this.#game.findStructureByUUID(uuid)?.markAsInactive?.();
            reject?.(error);
            break
          }
          case "stop":
            this.onstop.shift()?.[0]?.reject?.(error);
            break;
          default:
            globalMessage = 1;
        }
        if (globalMessage) this.#game.emit('error', error, this.#game)
      }
    }
    else this.preflight_requests.push(pr);
    return this.clear()
  }
}

module.exports = ModdingAPI

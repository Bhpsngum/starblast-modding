'use strict';

const runMod = require("../utils/runMod.js");
const defineProperties = require("../utils/defineProperties.js");

class ModdingAPI {
  constructor(game, options) {
    defineProperties(this, {
      game,
      preflight_requests: [],
      cacheConfiguration: !!options?.cacheConfiguration
    });
    this.clear();
    this.started = false;
    this.stopped = false;
    this.request_id = 0;
    this.configuration = {}
  }

  clear () {
    return this.set({})
  }

  reset () {
    this.started = false;
    this.stopped = true;
    this.request_id = 0;
    this.preflight_requests.splice(0);
    this.clear();
    if (!this.cacheConfiguration) this.configuration = {}
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
    return await runMod(this)
  }

  stop () {
    this.name("stop").send()
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
    let pData = Object.assign({}, ...data);
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

  send (uid) {
    if (this.started) try { this.socket.send(JSON.stringify(this.pending_request)) }
    catch(e) {
      // let error = new Error("Failed to encoding request");
      // if (arguments.length > 0) {
      //   let reject = this.game.modding.handlers.create.get(uid)?.reject;
      //   if ("function" == typeof reject) {
      //     this.game.modding.handlers.create.delete(uid);
      //     reject(error)
      //   }
      // }
      this.game.emit('error', error, this.game)
    }
    else this.preflight_requests.push(this.pending_request);
    return this.clear()
  }
}

module.exports = ModdingAPI

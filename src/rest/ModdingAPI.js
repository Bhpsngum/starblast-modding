'use strict';

const runMod = require("../utils/runMod.js");

class ModdingAPI {
  constructor(game, options) {
    this.game = game;
    this.cacheECPKey = !!options.cacheECPKey;
    this.clearPendingRequest();
    this.preflight_requests = [];
  }

  clearPendingRequest () {
    this.pending_request = {
      name: "",
      data: {}
    }
  }
  async start () {
    try { this.options = JSON.parse(JSON.stringify(this.options)) ?? {} }
    catch (e) {
      this.options = {}
      this.encodeOptionsError = true;
    }
    return await runMod(this)
  }

  stop () {
    this.name("stop").send()
  }

  name (name) {
    this.prop("name", name);
    return this
  }

  assign (data) {
    this.pending_request = Object.assign({}, data);
    return this
  }

  prop (name, data) {
    this.pending_request[name] = data;
    return this
  }

  data (...data) {
    let pData = Object.assign(data[0]||{}, ...data.slice(1));
    this.prop("data", pData);
    return this
  }

  clientMessage (id, name, data) {
    this.name("client_message");
    data = Object.assign(data||{}, {name: name});
    this.data({id: id, data: data});
    return this
  }

  send () {
    if (this.game.started) try { this.socket.send(JSON.stringify(this.pending_request)) }
    catch(e) { this.game.emit('error', new Error("Failed to encoding request"), this.game) }
    else this.preflight_requests.push(this.pending_request);
    this.clearPendingRequest();
    return this
  }
}

module.exports = ModdingAPI

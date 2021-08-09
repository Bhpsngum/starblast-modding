'use strict';

const GameSocket = require("../GameSocket.js");
const runMod = require("../utils/runMod.js");

class ModdingAPI {
  constructor(game, options) {
    this.game = game;
    this.cacheECPKey = !!options.cacheECPKey;
    this.clearPendingRequest()
  }

  clearPendingRequest () {
    this.pending_request = {
      name: "",
      data: {}
    }
  }
  start () {
    return new Promise(function (resolve, reject) {
      try { this.options = JSON.parse(JSON.stringify(this.options)) ?? {} }
      catch (e) {
        this.options = {}
        this.encodeOptionsError = true;
      }
      runMod(this).then(resolve).catch(reject)
    }.bind(this))
  }

  stop () {
    this.name("stop").send()
  }

  name (name) {
    this.prop("name", name);
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
    this.data(data, {id: id, name: name});
    return this
  }

  send () {
    try { this.socket.send(JSON.stringify(this.pending_request)) } catch(e) { console.log(e) }
    this.clearPendingRequest();
    return this
  }
}

module.exports = ModdingAPI

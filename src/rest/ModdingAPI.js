'use strict';

const GameSocket = require("../GameSocket.js");
const PrivateServerFinder = require("../utils/PrivateServerFinder.js");
const getToken = require("../utils/getToken.js");
const EventManager = require("../managers/EventManager.js");

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
    return new Promise(function (resolve, rejec) {
      let reject = function (e) {
        this.game.emit('error', e, this.game);
        rejec(e)
      }.bind(this);
      PrivateServerFinder(this.region).then(function (address) {
        getToken(address, this.ECPKey).then(function (token) {
          EventManager.create(this, address, token).then(resolve).catch(reject)
        }.bind(this)).catch(reject)
      }.bind(this))
    }.bind(this))
  }

  name (name) {
    this.pending_request.name = name;
    return this
  }

  data (...data) {
    Object.assign(this.pending_request.data, ...data);
    return this
  }

  clientMessage (id, name, data) {
    this.name("client_message");
    this.data(data, {id: id, name: name});
    return this
  }

  send () {
    try { this.socket.send(JSON.stringify(this.pending_request)) } catch(e) {}
    this.clearPendingRequest();
    return this
  }
}

module.exports = ModdingAPI

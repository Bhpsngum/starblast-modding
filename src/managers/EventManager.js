'use strict';

const GameSocket = require("../GameSocket.js");

module.exports.create = function (api, address, token) {
  let socket = GameSocket.create(address.ip, address.port);
  socket.onopen = function() {
    this.send(JSON.stringify({
      name: "run_mod",
      data: {
        token: token,
        options: api.options
      }
    }))
  }
  return new Promise(function (resolve, reject) {
    let ECPKey = this.ECPKey;
    socket.onmessage = function(event) {
      event = event.data;
      if ("string" == typeof event) {
        try { event = JSON.parse(event) } catch (e) {}
        switch (event.name) {
          case "mod_started":
            Object.assign(this.modding.api, {
              socket: socket,
              ip: address.ip,
              id: event.data.id,
              port: address.port
            });
            delete this.modding.api.ECPKey;
            Object.assign(this, {
              started: true,
              stopped: false,
              link: "https://starblast.io/#" + event.data.id + "@" + address.ip + ":" + address.port,
              options: event.data.options
            });
            this.emit('start', this.link, this);
            resolve(this.link);
            break;
          case "tick":
            this.step = event.data.step;
            // step the game
            this.emit('tick', this);
            break;
          default:
            console.log(event);
        }
      }
    }.bind(this.game);
    socket.onerror = function () {
      var error = new Error("Failed to connect to the server");
      this.emit('error', error, this);
      reject(error)
    }.bind(this.game);
    socket.onclose = function () {
      this.started = false;
      this.stopped = true;
      this.link = null;
      this.emit('stop', this);
      if (this.modding.api.cacheECPKey) this.modding.api.ECPKey = ECPKey
    }.bind(this.game)
  }.bind(api))
}

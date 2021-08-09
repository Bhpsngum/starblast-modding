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
  socket.onmessage = function(event) {
    console.log(event);
  }
  // return new Promise(function (resolve, reject) {
  //   socket.onmessage = function(event) {
  //     console.log(event);
  //   }
  // })
}

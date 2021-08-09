'use strict';

const GameSocket = require("../GameSocket.js");

module.exports = function (address, ECPKey) {
  let success, socket = GameSocket.create(address.ip, address.port);
  socket.onopen = function () {
    this.send(JSON.stringify({
      name: "modding_token",
      data: {
        ecp_key: ECPKey
      }
    }))
  }
  return new Promise(function (resolve, reject) {
    socket.onmessage = function (event) {
      event = event.data;
      if ("string" == typeof event) {
        try { event = JSON.parse(event) } catch(e){}
        switch (event.name) {
          case "token": success = 1; socket.close(); resolve(event.data.token)
        }
      }
    }
    socket.onerror = function () {
      reject(new Error("Failed to connect to the server"))
    }
    socket.onclose = function () {
      if (!success) reject(new Error("Invalid ECP Key"))
    }
  })
}

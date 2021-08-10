'use strict';

const WebSocket = require("ws");
const GameSocket = {};

GameSocket.create = function(ip, port) {
  ip = (ip || "").replace(/\./g,"-"), port = port || "";
  return new WebSocket("wss://"+ip+".starblast.io:"+port+"/", {
    origin: "https://starblast.io"
  })
}

for (let i of ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']) GameSocket[i] = WebSocket[i];

module.exports = GameSocket

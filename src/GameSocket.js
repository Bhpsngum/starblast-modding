'use strict';

const WebSocket = require("ws");
const GameSocket = {};

GameSocket.create = function(ip, port) {
  ip = (ip || "").replace(/\./g,"-"), port = port || "";
  return new WebSocket("wss://"+ip+".starblast.io:"+port+"/", {
    origin: "https://starblast.io"
  })
}

module.exports = GameSocket

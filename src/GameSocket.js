const WebSocket = require("ws");
const GameSocket = {};

GameSocket.create = function(ip, port) {
  ip = (ip || "").replace(/-/g,"."), port = port || "";
  return new WebSocket(ip+".starblast.io:"+port+"/")
}

module.exports = GameSocket

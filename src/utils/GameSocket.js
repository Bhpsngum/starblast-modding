'use strict';

const { WebSocket } = require("ws");
const GameSocket = {};

GameSocket.create = function(ip, port, origin, perMessageDeflate) {
	ip = (ip || "").replace(/\./g,"-"), port = port || "";
	return new WebSocket("wss://"+ip+".starblast.io:"+port+"/", {
		origin: origin ?? "https://starblast.io",
		perMessageDeflate: !!perMessageDeflate
	})
}

for (let i of ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']) GameSocket[i] = WebSocket[i];

module.exports = GameSocket

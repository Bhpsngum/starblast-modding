'use strict';

const GameSocket = require("./GameSocket.js");

module.exports = function (address, ECPKey, perMessageDeflate) {
	let success, socket = GameSocket.create(address.ip, address.port, null, perMessageDeflate);
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
			success = 1;
			reject(new Error("Failed to connect to the server"))
		}
		socket.onclose = function () {
			if (!success) reject(new Error("Failed to validate the specified ECP key"))
		}
	})
}

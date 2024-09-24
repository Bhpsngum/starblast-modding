'use strict';

const URLFetcher = require("./URLFetcher");

module.exports = async function PrivateServerFinder (region) {
	let servers, server;
	try {
		servers = await URLFetcher("https://starblast.io/simstatus.json")
	}
	catch (e) {
		throw new Error("Failed to connect to server listing")
	}
	try {
		server = servers.filter(server => server.modding && server.location === region).sort((a,b) => a.usage.cpu - b.usage.cpu)[0];
	}
	catch (e) {
		throw new Error("Server listing malformed or updated")
	}
	if (!server) throw new Error("Could not find any servers with the specified region");
	let data = server.address.split(":");
	return {ip: data[0], port: data[1]}
}

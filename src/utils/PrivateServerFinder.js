'use strict';

const URLFetcher = require("./URLFetcher");

module.exports = async function PrivateServerFinder (region) {
	let server;
	try {
		server = await URLFetcher("https://starblast.io/simstatus.json")
	}
	catch (e) {
		throw new Error("Failed to connect to the database")
	}
	try {
		server = JSON.parse(server).filter(server => server.modding && server.location === region).sort((a,b) => a.usage.cpu - b.usage.cpu)[0];
	}
	catch (e) {
		throw new Error("Server database malformed or updated")
	}
	if (!server) throw new Error("Could not find any servers with the specified region");
	let data = server.address.split(":");
	return {ip: data[0], port: data[1]}
}

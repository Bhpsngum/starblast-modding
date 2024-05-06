const URLFetcher = require("./URLFetcher");

const scriptRegex = /<script>([^]+?)<\/script>/g;
const joinParamSearcher = /"ecp_verified".+?socket\.onopen\s*=.+?\.send.+?name:([^]+?),data:/;

// parse string to value (if it's a JSON)
const parseValue = function (str) {
	return JSON.parse(String(str).replace(/^('|`)(.+)\1$/, '"$2"'));
}

// Get join packet name
const getJoinPacketName = async function () {
	let scripts = await URLFetcher("https://starblast.io");

	// get all stuffs inside script tags
	scripts = scripts.match(scriptRegex)?.map?.(e => e.replace(scriptRegex, "$1")) ?? [];

	// get the last script (game script) [Process 1]
	let gameScript = scripts.at(-1) ?? null;

	if (gameScript == null) throw new Error("Failed to get join message packet name. [Process 1]");

	gameScript = String(gameScript);

	// get the variable and its attribute name of join packet message [Process 2]
	let joinPacketVariable = gameScript.match(joinParamSearcher)?.[1] ?? null;

	if (joinPacketVariable == null) throw new Error("Failed to get join message packet name. [Process 2]");

	// if it appears to be a value, return it
	try {
		return parseValue(joinPacketVariable)
	} catch (e) {
	}

	let [obfVar, obfAttr, ...notUsed] = String(joinPacketVariable).split(".");

	// search through script to get value of it [Process 3]
	let joinPacketName = gameScript.match(new RegExp(obfVar + "=.+?" + obfAttr + ":([^]+?),([lI10O]{5}:|\})"))?.[1];

	try {
		if (joinPacketName == null) throw "null";
		return parseValue(joinPacketName);
	} catch (e) {
		throw new Error("Failed to get join message packet name. [Process 3]");
	}
}

module.exports = getJoinPacketName;
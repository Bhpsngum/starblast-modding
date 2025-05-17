const { dataUriToBuffer } = require("data-uri-to-buffer");

module.exports = function parseDataURI (uri) {
	let result = dataUriToBuffer(uri);
	return new TextDecoder(result.charset || "utf-8").decode(result.buffer);
}

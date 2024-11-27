const { dataUriToBuffer } = require("data-uri-to-buffer");
const decoder = new TextDecoder("utf8");

module.exports = function parseDataURI (uri) {
	return decoder.decode(dataUriToBuffer(uri).buffer);
}
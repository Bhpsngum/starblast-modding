const axios = require("axios");
const toString = require("./toString.js");
const parseDataURI = require("./dataUriParser.js");

module.exports = async function URLFetcher (URL) {
	URL = toString(URL);
	if (URL.startsWith("data:")) return parseDataURI(URL);
	return (await axios.get(URL)).data;
}
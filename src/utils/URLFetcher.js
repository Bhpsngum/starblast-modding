const axios = require("axios");

module.exports = async function URLFetcher (URL) {
	return (await axios.get(URL)).data;
}
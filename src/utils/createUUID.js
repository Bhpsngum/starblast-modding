'use strict';

const crypto = require("crypto");

module.exports = function () {
	return crypto.randomUUID({ disableEntropyCache: true }).toUpperCase()
}
'use strict';

module.exports = function (obj, properties = []) {
	let res = {};

	for (let k of properties) {
		res[k] = obj[k];
	}

	return res;
}

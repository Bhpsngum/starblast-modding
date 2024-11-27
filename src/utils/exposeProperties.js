'use strict';

module.exports = function (obj, list = []) {
	for (let k of list) Object.defineProperty(obj, k, {
		...Object.getOwnPropertyDescriptor(obj, k),
		enumerable: true,
		configurable: false
	});
}
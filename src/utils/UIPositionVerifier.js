'use strict';

module.exports = function (array, strictMode = false) {
	if (!Array.isArray(array)) {
		if (strictMode) return { success: false, value: `Given position value is not an array: ${toString(array)}` };
		return { success: true, value: [0, 0, 0, 0] }
	}
	let res = [];
	for (let i = 0; i < 4; ++i) {
		if ("number" != typeof array[i] || isNaN(i)) {
			if (strictMode) return { success: false, value: `Invalid position value (not a number) at index ${i}: ${toString(array)}` };
			res.push(0);
		}
		else res.push(array[i]);
	}

	return { success: true, value: res };
}
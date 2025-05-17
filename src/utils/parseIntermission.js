'use strict';

const toString = require("./toString.js");

module.exports = function (data, gameOver) {
	data = Object.assign(Object.create(null), data);
	for (let i in data) if (i != "gameover") data[i] = toString(data[i]);
	if (gameOver) {
		if (!Object.prototype.hasOwnProperty.call(data, 'gameover')) data.gameover = true;
		else data.gameover = toString(data.gameover)
	}
	else delete data.gameover
	return data
}

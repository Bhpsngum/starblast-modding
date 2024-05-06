'use strict';

const toString = require("./toString.js");

module.exports = function (data, gameOver) {
	data = Object.assign({}, data);
	for (let i in data) if (i != "gameover") data[i] = toString(data[i]);
	if (gameOver) {
		if (!data.hasOwnProperty('gameover')) data.gameover = true;
		else data.gameover = toString(data.gameover)
	}
	else delete data.gameover
	return data
}

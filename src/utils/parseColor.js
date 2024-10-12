const fieldCounts = 4;
const parseColor = function (n) {
	// parse hex color either to ARGB or RGB format
	// this actually works with NaN btw, it just returns black hex
	let value = [0, 0, 0, 0];
	
	for (let i = 0; i < fieldCounts; ++i) {
		let byte = n & 0xff;
		if (byte === 0) break;
		value[fieldCounts - i - 1] = byte;
		n >>= 8;
	}

	// if alpha channel is 0 (<=6 digits used), skip the alpha channel
	if (value[0] === 0) value.shift();

	return "#" + value.map(e => e.padStart(2, "0")).join("");
}

module.exports = function (color, strictMode, defaultColor, field = "color") {
	if (color == null) color = defaultColor;
		
	if ("number" === typeof color) color = parseColor(color);

	if ("string" !== typeof color) {
		if (strictMode) throw new Error(`Expects ${field} to be either a string or number. Got ${toString(color)} instead.`);
		color = toString(color);
	}

	return color;
}
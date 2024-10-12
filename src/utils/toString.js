'use strict';

module.exports = function (value) {
	try { return String(value) } catch (e) {
		try { return JSON.stringify(value) } catch (e) { return "" }
	}
}

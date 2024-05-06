module.exports = function(obj, properties, enumerable = true) {
	for (let key in properties) properties[key] = {
		value: properties[key],
		enumerable: !!enumerable,
		configurable: false,
		writable: false
	}
	return Object.defineProperties(obj, properties)
}

module.exports = function(obj, properties, enumerable = false) {
  for (let key in properties) properties[key] = {
    value: properties[key],
    enumerable: !!enumerable,
    configurable: false,
    writable: false
  }
  return Object.defineProperties(obj, properties)
}

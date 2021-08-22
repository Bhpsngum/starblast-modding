module.exports = function(obj, properties) {
  for (let key in properties) properties[key] = {
    value: properties[key],
    configurable: false,
    writable: false
  }
  return Object.defineProperties(obj, properties)
}

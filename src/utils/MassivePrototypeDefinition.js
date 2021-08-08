module.exports = function(obj, array) {
  for (let i of array) {
    let prop = i, field;
    if (typeof i != "string") [prop, field] = i;
    else field = i;
    obj.prototype["set"+prop[0].toUpperCase()+prop.slice(1)] = function (data) {
      this.set({[field]: data});
      return this
    }
  }
}

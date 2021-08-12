'use strict';

module.exports = function (value) {
  let temp = {};
  if (value == null) return (temp[value] = 1, Object.keys(temp)[0]);
  try { return value.toString() } catch (e) { return "" }
}

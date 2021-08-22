'use strict';

const defineProperties = require("../utils/defineProperties.js");

class Coordinate {
  constructor (position) {
    position = Object.assign({}, position);
    defineProperties(this, {
      x: "number" == typeof position.x ? position.x : 0,
      y: "number" == typeof position.y ? position.y : 0,
      z: "number" == typeof position.z ? position.z : 0,
    })
  }
}

module.exports = Coordinate

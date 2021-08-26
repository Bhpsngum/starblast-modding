'use strict';

const defineProperties = require("../utils/defineProperties.js");

class Coordinate {
  constructor (position) {
    defineProperties(this, {
      x: "number" == typeof position?.x ? position.x : 0,
      y: "number" == typeof position?.y ? position.y : 0,
      z: "number" == typeof position?.z ? position.z : 0,
    })
  }

  toJSON () {
    return {
      x: this.x,
      y: this.y,
      z: this.z
    }
  }
}

module.exports = Coordinate

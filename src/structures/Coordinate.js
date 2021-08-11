'use strict';

class Coordinate {
  constructor (position) {
    position = Object.assign({}, position);
    this.x = position.x ?? 0;
    this.y = position.y ?? 0;
    this.z = position.z ?? 0;
  }
}

module.exports = Coordinate

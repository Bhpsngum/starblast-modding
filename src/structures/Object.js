'use strict';

const Structure = require("./Structure.js");
const ObjectType = require("./ObjectType.js");
const Coordinate = require("./Coordinate.js");
const getObjectShapeFromURL = require("../utils/getObjectShapeFromURL.js");
const limitedJSON = require("../utils/limitedJSON.js");

class Object3D extends Structure {
  constructor (game, options) {
    super(game);
    options = Object.assign({}, options);
    this.id = options.id;
    this.type = new ObjectType(options.type);
    this.position = new Coordinate(options.position);
    this.rotation = new Coordinate(options.rotation);
    this.scale = new Coordinate(options.scale);
  }

  toJSON () {
    return limitedJSON(this, ["type", "position", "rotation", "scale"])
  }
}

Object.defineProperties(Object3D.prototype, {
  entity_type: {value: "object"},
  inactive_field: {value: "removed"}
});

module.exports = Object3D

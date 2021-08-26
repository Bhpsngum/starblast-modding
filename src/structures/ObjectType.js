'use strict';

const Structure = require("./Structure.js");
const getObjectShapeFromURL = require("../utils/getObjectShapeFromURL.js");
const toString = require("../utils/toString.js");
const limitedJSON = require("../utils/limitedJSON.js");
const defineProperties = require("../utils/defineProperties.js");

class ObjectType extends Structure {
  constructor (game, type) {
    super(game);
    let pysics = type?.physics ?? {}
    let physics = {}
    defineProperties(physics, {
      mass: pysics.mass ?? 0,
      autoShape: pysics.autoShape === true
    });
    if (Array.isArray(pysics.shape)) defineProperties(physics, {shape: pysics.shape});
    else if (!physics.autoShape) defineProperties(physics, {shape: []});
    defineProperties(this, {
      id: toString(type?.id),
      obj:  type?.obj ?? null,
      diffuse: type?.diffuse ?? null,
      emissive: type?.emissive ?? null,
      specular: type?.specular ?? null,
      bump: type?.bump ?? null,
      diffuseColor: type?.diffuseColor ?? 0x0,
      emissiveColor: type?.emissiveColor ?? 0x0,
      specularColor: type?.specularColor ?? 0x0,
      bumpScale: "number" == typeof type?.bumpScale ? type.bumpScale : 1,
      transparent: type?.transparent === true,
      shininess: "number" == typeof type?.shininess ? type.shininess : 0,
      physics
    });
  }

  markAsInactive () {

  }

  isActive () {
    return true
  }

  async getShape () {
    return await getObjectShapeFromURL(this.obj)
  }

  toJSON () {
    return Object.assign(limitedJSON(this, ["id", "obj", "diffuse", "emissive", "specular", "bump", "diffuseColor", "emissiveColor", "specularColor", "bumpScale", "transparent", "shininess"]), {physics: limitedJSON(this.physics, ["mass", "shape"])})
  }
}

defineProperties(ObjectType.prototype, {
  structure_type: "object_type"
});

module.exports = ObjectType

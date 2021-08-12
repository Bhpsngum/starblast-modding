'use strict';

const Structure = require("./Structure.js");
const getObjectShapeFromURL = require("../utils/getObjectShapeFromURL.js");
const toString = require("../utils/toString.js");
const limitedJSON = require("../utils/limitedJSON.js");

class ObjectType extends Structure {
  constructor (game, type) {
    super(game);
    type = Object.assign({}, type);
    let physics = type.physics ?? {}
    this.id = toString(type.id);
    this.obj =  type.obj ?? null;
    this.diffuse = type.diffuse ?? null;
    this.emissive = type.emissive ?? null;
    this.specular = type.specular ?? null;
    this.bump = type.bump ?? null;
    this.diffuseColor = type.diffuseColor ?? 0x0;
    this.emissiveColor = type.emissiveColor ?? 0x0;
    this.specularColor = type.specularColor ?? 0x0;
    this.bumpScale = "number" == typeof type.bumpScale ? type.bumpScale : 1;
    this.transparent = !!type.transparent;
    this.shininess = "number" == typeof type.shininess ? type.shininess : 0;
    this.physics = {
      mass: physics.mass ?? 0,
      shape: physics.shape ?? null,
      autoShape: !!physics.autoShape
    }
  }

  markAsInactive () {

  }

  isActive () {
    return true
  }

  async getShape () {
    this.obj = await getObjectShapeFromURL(this.obj)
  }

  toJSON () {
    return limitedJSON(this, ["id", "obj", "diffuse", "emissive", "specular", "bump", "diffuseColor", "emissiveColor", "specularColor", "bumpScale", "transparent", "shininess", "physics"])
  }
}

module.exports = ObjectType

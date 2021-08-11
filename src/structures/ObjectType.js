'use strict';

const getObjectShapeFromURL = require("../utils/getObjectShapeFromURL.js");

class ObjectType {
  constructor (type) {
    type = Object.assign({}, type);
    let physics = type.physics ?? {}
    this.id = type.id;
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

  async getShape () {
    return await getObjectShapeFromURL(this.obj)
  }
}

module.exports = ObjectType

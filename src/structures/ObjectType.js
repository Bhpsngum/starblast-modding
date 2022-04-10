'use strict';

const Structure = require("./Structure.js");
const getObjectShapeFromURL = require("../utils/getObjectShapeFromURL.js");
const toString = require("../utils/toString.js");
const limitedJSON = require("../utils/limitedJSON.js");
const defineProperties = require("../utils/defineProperties.js");

/**
 * The ObjectType Instance
 * @extends {Structure}
 * @param {ModdingClient} game - The <code>ModdingClient</code> object
 * @param {object} options - Instance options
 */

class ObjectType extends Structure {
  constructor (game, type) {
    super(game);
    this.#game = game;
    let pysics = type?.physics ?? {}
    let physics = {}
    defineProperties(physics, {
      mass: pysics.mass ?? 0,
      autoShape: !!pysics.autoShape
    });
    if (Array.isArray(pysics.shape)) defineProperties(physics, {shape: pysics.shape});
    else if (!physics.autoShape) defineProperties(physics, {shape: []});
    /**
    * ObjectType ID
    * @name ObjectType.prototype.id
    * @type {string}
    * @readonly
    */

    /**
    * ObjectType model link (.obj file)
    * @name ObjectType.prototype.obj
    * @type {string}
    * @readonly
    */

    /**
    * ObjectType diffuse texture link
    * @name ObjectType.prototype.diffuse
    * @type {string}
    * @readonly
    */

    /**
    * ObjectType emissive texture link
    * @name ObjectType.prototype.emissive
    * @type {string}
    * @readonly
    */

    /**
    * ObjectType specular texture link
    * @name ObjectType.prototype.specular
    * @type {string}
    * @readonly
    */

    /**
    * ObjectType bump texture link
    * @name ObjectType.prototype.bump
    * @type {string}
    * @readonly
    */

    /**
    * ObjectType diffuse color
    * @name ObjectType.prototype.diffuseColor
    * @type {(string|number)}
    * @readonly
    */

    /**
    * ObjectType emissive color
    * @name ObjectType.prototype.emissiveColor
    * @type {(string|number)}
    * @readonly
    */

    /**
    * ObjectType specular color
    * @name ObjectType.prototype.specularColor
    * @type {(string|number)}
    * @readonly
    */

    /**
    * ObjectType bump scale
    * @name ObjectType.prototype.bumpScale
    * @type {(string|number)}
    * @readonly
    */

    /**
    * ObjectType transparency
    * @name ObjectType.prototype.transparent
    * @type {boolean}
    * @readonly
    */

    /**
    * ObjectType shininess
    * @name ObjectType.prototype.shininess
    * @type {boolean}
    * @readonly
    */

    /**
    * ObjectType physics with 3 properties: (array) shape, (boolean) fixed and (number) mass
    * @name ObjectType.prototype.physics
    * @type {object}
    * @readonly
    */

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
      transparent: !!type?.transparent,
      shininess: "number" == typeof type?.shininess ? type.shininess : 0,
      physics
    });
  }

  #game;

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

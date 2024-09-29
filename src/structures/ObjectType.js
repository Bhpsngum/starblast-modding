'use strict';

const Structure = require("./Structure.js");
const getObjectShapeFromURL = require("../utils/getObjectShapeFromURL.js");
const toString = require("../utils/toString.js");
const limitedJSON = require("../utils/limitedJSON.js");
const defineProperties = require("../utils/defineProperties.js");

/**
 * The ObjectType Instance
 * @extends {Structure}
 * @abstract
 */

class ObjectType extends Structure {
	constructor (game, api, type) {
		super(game, api);
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
		 * @name ObjectType#id
		 * @type {string}
		 * @readonly
		 */

		/**
		 * ObjectType model link (.obj file)
		 * @name ObjectType#obj
		 * @type {string}
		 * @readonly
		 */

		/**
		 * ObjectType diffuse texture link
		 * @name ObjectType#diffuse
		 * @type {string}
		 * @readonly
		 */

		/**
		 * ObjectType emissive texture link
		 * @name ObjectType#emissive
		 * @type {string}
		 * @readonly
		 */

		/**
		 * ObjectType specular texture link
		 * @name ObjectType#specular
		 * @type {string}
		 * @readonly
		 */

		/**
		 * ObjectType bump texture link
		 * @name ObjectType#bump
		 * @type {string}
		 * @readonly
		 */

		/**
		 * ObjectType diffuse color
		 * @name ObjectType#diffuseColor
		 * @type {(string|number)}
		 * @readonly
		 */

		/**
		 * ObjectType emissive color
		 * @name ObjectType#emissiveColor
		 * @type {(string|number)}
		 * @readonly
		 */

		/**
		 * ObjectType specular color
		 * @name ObjectType#specularColor
		 * @type {(string|number)}
		 * @readonly
		 */

		/**
		 * ObjectType bump scale
		 * @name ObjectType#bumpScale
		 * @type {(string|number)}
		 * @readonly
		 */

		/**
		 * ObjectType transparency
		 * @name ObjectType#transparent
		 * @type {boolean}
		 * @readonly
		 */

		/**
		 * ObjectType shininess
		 * @name ObjectType#shininess
		 * @type {boolean}
		 * @readonly
		 */

		/**
		 * ObjectType physics
		 * @name ObjectType#physics
		 * @type {object}
		 * @property {array} shape - Object type's hitbox shape
		 * @property {number} mass - The mass of the object type
		 * @property {boolean} fixed - Indicates if the object type is movable or not (honestly this doesn't do anything much)
		 * @property {boolean} autoShape - Indicates if the object type's hitbox shape will be/was rendered automatically
		 * @readonly
		 */

		defineProperties(this, {
			id: toString(type?.id),
			obj:  type?.obj ?? null,
			diffuse: type?.diffuse ?? null,
			emissive: type?.emissive ?? null,
			specular: type?.specular ?? null,
			bump: type?.bump ?? null,
			diffuseColor: type?.diffuseColor ?? 0xFFFFFF,
			emissiveColor: type?.emissiveColor ?? 0xFFFFFF,
			specularColor: type?.specularColor ?? 0xFFFFFF,
			bumpScale: "number" == typeof type?.bumpScale ? type.bumpScale : 1,
			transparent: !!(type?.transparent ?? true),
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
		let raw = Object.assign(limitedJSON(this, ["id", "obj", "diffuse", "emissive", "specular", "bump", "diffuseColor", "emissiveColor", "specularColor", "bumpScale", "transparent", "shininess"]), {physics: limitedJSON(this.physics, ["mass", "shape"])});
		// remove any fields with nullish value since it causes client to completely ignore this object
		for (let i in raw) if (raw[i] == null) delete raw[i];
		return raw;
	}
}

defineProperties(ObjectType.prototype, {
	structure_type: "object_type"
});

module.exports = ObjectType

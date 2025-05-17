'use strict';

const Structure = require("./Structure.js");
const getObjectShapeFromURL = require("../utils/getObjectShapeFromURL.js");
const toString = require("../utils/toString.js");
const limitedJSON = require("../utils/limitedJSON.js");
const defineProperties = require("../utils/defineProperties.js");
const { Color } = require("three");

const parseColor = function (value) {
	return (new Color(value))?.getHex?.() ?? 0xFFFFFF;
}

const isNumber = function (value) {
	// finite check also fails with NaN so we're safe
	return "number" === typeof value && Number.isFinite(value);
}

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
		}, true);

		if (Array.isArray(pysics.shape)) defineProperties(physics, {shape: pysics.shape}, true);
		else if (!physics.autoShape) defineProperties(physics, {shape: []}, true);
		
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
		 * ObjectType diffuse hex color code
		 * @name ObjectType#diffuseColor
		 * @type {number}
		 * @readonly
		 */

		/**
		 * ObjectType emissive hex color code
		 * @name ObjectType#emissiveColor
		 * @type {number}
		 * @readonly
		 */

		/**
		 * ObjectType specular hex color code
		 * @name ObjectType#specularColor
		 * @type {number}
		 * @readonly
		 */

		/**
		 * ObjectType bump scale
		 * @name ObjectType#bumpScale
		 * @type {number}
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
			diffuseColor: type?.diffuse != null ? parseColor(type?.diffuseColor) : 0,
			emissiveColor: type?.emissive != null ? parseColor(type?.emissiveColor) : 0,
			specularColor: type?.specular != null ? parseColor(type?.specularColor) : 0,
			bumpScale: isNumber(type?.bumpScale) ? type.bumpScale : 0.1,
			transparent: !!(type?.transparent ?? true),
			shininess: isNumber(type?.shininess) ? type.shininess : 30,
			physics
		}, true);
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
		// copy specs
		let raw = Object.assign(
			limitedJSON(this, ["id", "obj", "diffuse", "emissive", "specular", "bump", "diffuseColor", "emissiveColor", "specularColor", "bumpScale", "transparent", "shininess"]),
			{ physics: limitedJSON(this.physics, ["mass", "shape"]) }
		);
		
		// check maps and colors
		for (let i of ["diffuse", "emissive", "specular"]) {
			// remove any color field if their respective map is not set or color is set to white
			if (raw[i] == null || raw[`${i}Color`] === 0xFFFFFF) {
				delete raw[`${i}Color`];
			}
		}

		// remove other fields if they are at default value
		if (raw.transparent) delete raw.transparent;
		if (raw.bumpScale === 0.1) delete raw.bumpScale;
		if (raw.shininess === 30) delete raw.shininess;

		// remove any fields with nullish value since it causes client to completely ignore this object
		for (let i in raw) if (raw[i] == null) delete raw[i];
		return raw;
	}
}

defineProperties(ObjectType.prototype, {
	structure_type: "object_type"
});

module.exports = ObjectType

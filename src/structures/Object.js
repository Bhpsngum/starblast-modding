'use strict';

const Structure = require("./Structure.js");
const Coordinate = require("./Coordinate.js");
const limitedJSON = require("../utils/limitedJSON.js");
const MassRename = require("../utils/MassivePrototypeDefinition.js");
const toString = require("../utils/toString.js");
const defineProperties = require("../utils/defineProperties.js");
const exposeProperties = require("../utils/exposeProperties.js");
const ModdingClient = require("../clients/ModdingClient.js");

/**
 * The Object3D Instance
 * @extends {Structure}
 * @abstract
 */

class Object3D extends Structure {
	constructor (game, api, options, parent, send) {
		super(game, api);
		this.#game = game;
		this.#api = api;
		this.#parent = parent;
		this.#send = send;

		/**
		 * Object ID
		 * @name Object3D#id
		 * @type {string}
		 * @readonly
		 */

		defineProperties(this, {id: toString(options?.id)});
		this.assign(options, true);
	}

	#game;
	#parent;
	#api;
	#send;

	markAsActive () {
		let _this = this.modding.data;
		_this[this.inactive_field] = false;
		_this[this.inactive_field + "Step"] = _this.lastAliveStep = null;
	}

	assign(options, forceAssign = false) {
		let _this = this.modding.data;
		if (forceAssign || options?.type != null) {
			let objTypeManager = this.#game.objects.types;
			let objType = objTypeManager.create(options?.type);
			let type = objTypeManager.findById(objType.id, true);
			if (type == null) {
				type = objType;
				objTypeManager.insert(type)
			}
			_this.type = type
		}
		if (forceAssign || options?.position != null) _this.position = new Coordinate(options?.position);
		if (forceAssign || options?.rotation != null) _this.rotation = new Coordinate(options?.rotation);
		if (forceAssign || options?.scale != null) _this.scale = new Coordinate(options?.scale);
	}

	/**
	 * Set the object with given data. Note that physics is only available on global object.
	 * @param {object} data - options to set to the object
	 * @returns {Object3D}
	 */

	async set (data) {
		this.assign(data);
		if (this.type.physics.autoShape && this.type.physics.shape == null) try {
			if (!(this.#parent.parent instanceof ModdingClient) || "string" !== typeof this.type.obj) throw "Invalid obj";
			defineProperties(this.type.physics, { shape: await this.type.getShape() });
		}
		catch (e) {
			defineProperties(this.type.physics, { shape: [] })
		}
		this.#send(this);
		this.markAsActive();
		this.#game.objects.update();
		return this
	}

	/**
	 * Remove the object from the game
	 * @returns {Object3D}
	 */

	remove () {
		this.#send(this, "remove");
		this.markAsInactive();
		this.#game.objects.update();
		return this
	}

	/**
	 * Object type
	 * @type {ObjectType}
	 * @readonly
	 */

	get type () {
		return this.modding.data.type
	}

	/**
	 * Object position
	 * @type {Coordinate}
	 * @readonly
	 */

	get position () {
		return this.modding.data.position
	}

	/**
	 * Object rotation
	 * @type {Coordinate}
	 * @readonly
	 */

	get rotation () {
		return this.modding.data.rotation
	}

	/**
	 * Object scale
	 * @type {Coordinate}
	 * @readonly
	 */

	get scale () {
		return this.modding.data.scale
	}

	/**
	 * Parent manager of this object
	 * @type {ObjectManager}
	 * @readonly
	 * @since 1.4.30-alpha6
	 */

	get parent () {
		return this.#parent;
	}

	/**
	 * Set object type
	 * @method Object3D#setType
	 * @param {object} type - The type object to set
	 * @returns {Object3D}
	 */

	/**
	 * Set object position
	 * @method Object3D#setPosition
	 * @param {object} position - The position object to set
	 * @returns {Object3D}
	 */

	/**
	 * Set object rotation
	 * @method Object3D#setRotation
	 * @param {object} rotation - The rotation object to set
	 * @returns {Object3D}
	 */

	/**
	 * Set object scale
	 * @method Object3D#setScale
	 * @param {object} type - The scale object to set
	 * @returns {Object3D}
	 */

	toJSON () {
		return limitedJSON(this, ["id", "type", "position", "rotation", "scale"])
	}
}

defineProperties(Object3D.prototype, {
	structure_type: "object",
	inactive_field: "removed"
});

MassRename(Object3D, ["type", "position", "rotation", "scale"]);

exposeProperties(Object3D.prototype, ["type", "position", "rotation", "scale", "parent"]);

module.exports = Object3D

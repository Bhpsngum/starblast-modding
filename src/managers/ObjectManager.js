'use strict';

const StructureManager = require("./StructureManager.js");
const ObjectTypeManager = require("./ObjectTypeManager.js");
const Object3D = require("../structures/Object.js");
const getEntity = require("../utils/getEntity.js");
const defineProperties = require("../utils/defineProperties.js");
const toString = require("../utils/toString.js");
const exposeProperties = require("../utils/exposeProperties.js");
const setObject = async function (game, data, api) {
	let object = getEntity(game, data, this, this, api);
	if (!object.spawned) object.markAsSpawned();
	return await object.set(data);
}

/**
 * The Object3D Manager Instance.
 * @extends {StructureManager}
 * @abstract
 */

class ObjectManager extends StructureManager {
	constructor(game, api, parent) {
		super(game, api);
		this.#game = game;
		this.#api = api;
		this.#parent = parent;
		defineProperties(this, {types: new ObjectTypeManager(game)})
	}

	#game;
	#api;
	#parent;
	#toServer = this.#sendToServer.bind(this);

	#sendToServer (object, action = "set") {
		let api = this.#api;
		if (this.#parent == null) {
			api.name(`${action}_server_object`);
			if (action === "set") api.data(object);
			else api.prop("id", object.id);
			api.send();
		}
		api.clientMessage(this.#parent?.id ?? null, `${action}_object`, action === "set" ? ({ object }) : ({ id: object.id })).send();
	}

	/**
	 * Parent object (ship or modding client) of this manager
	 * @type {Ship|ModdingClient}
	 * @readonly
	 * @since 1.4.30-alpha6
	 */

	get parent () {
		return this.#parent ?? this.#game;
	}

	/**
	 * Add a new object to the game. Note that physics is only available on global object.
	 * @param {object} data - object creation options
	 * @returns {Object3D} - The newly created object
	 */

	async add (data) {
		return setObject.call(this, this.#game, data, this.#toServer);
	}

	/**
	 * Set options to an object; can also be used to add a new object with given data to the game. Note that physics is only available on global object.
	 * @param {object} data - Options to be set on the object including the object ID itself
	 * @returns {Object3D}
	 */

	async set (data) {
		return setObject.call(this, this.#game, data, this.#toServer);
	}

	/**
	 * Set options to an object based on ID
	 * @param {number} id - The object's ID
	 * @param {object} data - Options to be set on the object
	 * @returns {Object3D}
	 */

	setById (id, data) {
		this.set(Object.assign(Object.create(null), data, {id}))
	}

	/**
	 * Remove an object based on ID
	 * @param {number} id - The object's ID needs to be killed, `null` to remove all objects in the scene
	 * @returns {Object3D}
	 */

	remove (id) {
		if (id == null) {
			this.filterList().all.forEach(object => (object.isActive() || !object.isSpawned()) && object.markAsInactive());
			this.#sendToServer({ id: null }, "remove");
		}
		else {
			id = toString(id);
			let object = this.findById(id, true);
			if (object) object.remove();
			else this.#sendToServer({ id }, "remove");
		}
		return this.update()
	}

	update () {
		this.filterList().clear();
		this.all.forEach(object => object.isActive() && this._UUIDset(object));
		return this
	}

	[Symbol.toStringTag] = 'ObjectManager';
	manager_name = "object";
	StructureConstructor = Object3D;
}

exposeProperties(ObjectManager.prototype, ["parent"]);

module.exports = ObjectManager

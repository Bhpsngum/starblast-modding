'use strict';

const StructureManager = require("./StructureManager.js");
const ObjectTypeManager = require("./ObjectTypeManager.js");
const Object3D = require("../structures/Object.js");
const getEntity = require("../utils/getEntity.js");
const defineProperties = require("../utils/defineProperties.js");
const toString = require("../utils/toString.js");
const setObject = function (game, data) {
  let object = getEntity(game, data, this);
  if (!object.spawned) object.markAsSpawned();
  return object.set(data)
}

/**
 * The Object3D Manager Instance.
 * @extends {StructureManager}
 * @abstract
 */

class ObjectManager extends StructureManager {
  constructor(game, api) {
    super(game, api);
    this.#game = game;
    this.#api = api;
    defineProperties(this, {types: new ObjectTypeManager(game)})
  }

  #game;
  #api;

  /**
   * Add a new object to the game
   * @param {object} data - object creation options
   * @returns {Promise<Object3D>}
   */

  add (data) {
    return setObject.call(this, this.#game, data)
  }

  /**
   * Set options to an object; can also be used to add a new object with given data to the game
   * @param {object} data - Options to be set on the object including the object ID itself
   * @returns {Object3D}
   */

  set (data) {
    return setObject.call(this, this.#game, data)
  }

  /**
  * Set options to an object based on ID
  * @param {number} id - The object's ID
  * @param {object} data - Options to be set on the object
  * @returns {Object3D}
  */

  setById (id, data) {
    this.set(Object.assign({}, data, {id}))
  }

  /**
   * Remove an object based on ID
   * @param {number} id - The object's ID needs to be killed, <code>null</code> to remove all objects in the scene
   * @returns {Object3D}
   */

  remove (id) {
    if (id != null) id = toString(id);
    this.#api.name("remove_server_object").prop("id", id).send().globalMessage("remove_object", {id}).send();
    if (id == null) this.filterList().all.forEach(object => (object.isActive() || !object.isSpawned()) && object.markAsInactive())
    else this.findById(id, true)?.markAsInactive?.();
    return this.update()
  }

  update () {
    this.filterList().clear();
    this.all.forEach(object => object.isActive() && this._UUIDset(object));
    return this
  }

  [Symbol.toStringTag] = 'ObjectManager'
}

defineProperties(ObjectManager.prototype, {
  manager_name: "object",
  StructureConstructor: Object3D
});

module.exports = ObjectManager

'use strict';

const StructureManager = require("./StructureManager.js");
const ObjectTypeManager = require("./ObjectTypeManager.js");
const Object3D = require("../structures/Object.js");
const getEntity = require("../utils/getEntity.js");
const defineProperties = require("../utils/defineProperties.js");
const setObject = function (data) {
  let object = getEntity(data, this);
  if (!object.spawned) object.markAsSpawned();
  return object.set(data)
}

class ObjectManager extends StructureManager {
  constructor(game) {
    super(game);
    defineProperties(this, {types: new ObjectTypeManager(game)})
  }

  add (data) {
    return setObject.call(this, data)
  }

  set (data) {
    return setObject.call(this, data)
  }

  setById (id, data) {
    this.set(Object.assign({}, data, {id}))
  }

  remove (id) {
    this.game.modding.api.name("remove_server_object").prop("id", id).send().globalMessage("remove_object").send();
    this.findById(id)?.markAsInactive?.();
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

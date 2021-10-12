'use strict';

const StructureManager = require("./StructureManager.js");
const ObjectTypeManager = require("./ObjectTypeManager.js");
const Object3D = require("../structures/Object.js");
const getEntity = require("../utils/getEntity.js");
const defineProperties = require("../utils/defineProperties.js");

class ObjectManager extends StructureManager {
  constructor(game) {
    super(game);
    defineProperties(this, {types: new ObjectTypeManager(game)})
  }

  add (data) {
    let object = getEntity(data, this);
    if (!object.spawned) object.markAsSpawned();
    object.set(data)
  }

  setById (id, data) {
    this.set(Object.assign({}, data, {id}))
  }

  update () {
    this.filterList().clear();
    this.all.forEach(object => object.isActive() && this.set(object.uuid, object));
    return this
  }

  [Symbol.toStringTag] = 'ObjectManager'
}

defineProperties(ObjectManager.prototype, {
  manager_name: "object",
  StructureConstructor: Object3D
});

module.exports = ObjectManager

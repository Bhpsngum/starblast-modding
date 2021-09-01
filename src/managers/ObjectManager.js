'use strict';

const StructureManager = require("./StructureManager.js");
const ObjectTypeManager = require("./ObjectTypeManager.js");
const Object3D = require("../structures/Object.js");
const getEntity = require("../utils/getEntity.js");
const defineProperties = require("../utils/defineProperties.js");
const setObject = function (data) {
  let object = getEntity(data, this);
  if (!object.spawned) object.markAsSpawned();
  object.set(data)
}

class ObjectManager extends StructureManager {
  constructor(game) {
    super(game);
    defineProperties(this, {types: new ObjectTypeManager(game)})
  }

  set (data) {
    setObject.call(this, data)
  }

  add (data) { // placeholder, same functionality as 'ObjectManager.set'
    setObject.call(this, data)
  }

  setById (id, data) {
    this.set(Object.assign({}, data, {id}))
  }

  update () {
    this.filterList().splice(0);
    this.push(...this.all.filter(object => object.isActive()));
    return this
  }
}

defineProperties(ObjectManager.prototype, {
  manager_name: "object",
  StructureConstructor: Object3D
});

module.exports = ObjectManager

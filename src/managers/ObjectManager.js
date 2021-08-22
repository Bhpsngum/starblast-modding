'use strict';

const StructureManager = require("./StructureManager.js");
const ObjectTypeManager = require("./ObjectTypeManager.js");
const Object3D = require("../structures/Object.js");
const getEntity = require("../utils/getEntity.js");
const defineProperties = require("../utils/defineProperties.js");
const setObject = function (data) {
  let object = getEntity(data, this);
  if (!object.spawned) defineProperties(object, {spawned: true});
  object.set(data)
}

class ObjectManager extends StructureManager {
  constructor(game) {
    super(game);
    defineProperties(this, {types: new ObjectTypeManager(game)})
  }

  set (data) {
    return setObject.call(this, data)
  }

  add (data) { // placeholder, same functionality as 'ObjectManager.set'
    return setObject.call(this, data)
  }

  update () {
    let x = this.all.splice(0).filter(object => this.isInstance(object));
    this.all.push(...x);
    this.splice(0);
    this.push(...this.all.filter(object => object.isActive()))
  }
}

defineProperties(ObjectManager.prototype, {
  manager_name: "object",
  StructureConstructor: Object3D
});

module.exports = ObjectManager

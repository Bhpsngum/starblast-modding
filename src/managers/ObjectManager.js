'use strict';

const StructureManager = require("./StructureManager.js");
const ObjectTypeManager = require("./ObjectTypeManager.js");
const Object3D = require("../structures/Object.js");
const getEntity = require("../utils/getEntity.js");
const setObject = function (data) {
  let object = getEntity(data, this);
  if (!object.spawned) Object.defineProperty(object, 'spawned', {value: true});
  object.set(data)
}

class ObjectManager extends StructureManager {
  constructor(game) {
    super(game);
    Object.defineProperty(this, 'types', {value: new ObjectTypeManager(game)})
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

Object.defineProperties(ObjectManager.prototype, {
  manager_name: {value: "object"},
  StructureConstructor: {value: Object3D}
});

module.exports = ObjectManager

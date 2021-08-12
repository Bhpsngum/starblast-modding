'use strict';

const StructureManager = require("./StructureManager.js");
const ObjectTypeManager = require("./ObjectTypeManager.js");
const Object3D = require("../structures/Object.js");

class ObjectManager extends StructureManager {
  constructor(game) {
    super(game);
    this.all = [];
    this.types = new ObjectTypeManager(game);
  }

  add (data) {
    let object = this.create(data);
    let fObject = this.findById(object, true);
    if (fObject == null) {
      this.push(object);
      this.update();
    }
    else object = fObject;
    object.set(data)
  }

  push (...data) {
    return this.all.push(...data)
  }

  update () {
    let x = this.all.splice(0).filter(entity => this.isInstance(entity));
    this.push(...x);
    this.splice(0);
    Array.prototype.push.call(this, ...this.all.filter(entity => entity.isActive()))
  }
}

Object.defineProperties(ObjectManager.prototype, {
  manager_name: {value: "object"},
  EntityConstructor: {value: Object3D}
});

module.exports = ObjectManager

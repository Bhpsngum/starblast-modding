'use strict';

const StructureManager = require("./StructureManager.js");
const ObjectType = require("../structures/ObjectType.js");

class ObjectTypeManager extends StructureManager {
  constructor(game) {
    super(game)
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


Object.defineProperties(ObjectType.prototype, {
  manager_name: {value: "object_type"},
  EntityConstructor: {value: ObjectType}
});

module.exports = ObjectTypeManager

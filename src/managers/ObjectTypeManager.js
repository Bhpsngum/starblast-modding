'use strict';

const StructureManager = require("./StructureManager.js");
const ObjectType = require("../structures/ObjectType.js");

class ObjectTypeManager extends StructureManager {
  constructor(game) {
    super(game);
  }

  update () {
    let x = this.all.splice(0).filter(entity => this.isInstance(entity));
    this.all.push(...x);
    this.splice(0);
    this.push(...this.all)
  }
}


Object.defineProperties(ObjectTypeManager.prototype, {
  manager_name: {value: "object_type"},
  EntityConstructor: {value: ObjectType}
});

module.exports = ObjectTypeManager

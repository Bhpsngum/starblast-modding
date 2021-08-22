'use strict';

const StructureManager = require("./StructureManager.js");
const ObjectType = require("../structures/ObjectType.js");
const defineProperties = require("../utils/defineProperties.js");

class ObjectTypeManager extends StructureManager {
  constructor(game) {
    super(game);
  }
}


defineProperties(ObjectTypeManager.prototype, {
  manager_name: "object_type",
  StructureConstructor: ObjectType
});

module.exports = ObjectTypeManager

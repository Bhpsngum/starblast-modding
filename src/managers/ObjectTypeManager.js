'use strict';

const StructureManager = require("./StructureManager.js");
const ObjectType = require("../structures/ObjectType.js");
const defineProperties = require("../utils/defineProperties.js");

/**
 * The Object Type Manager Instance.
 * @extends {StructureManager}
 * @abstract
 */

class ObjectTypeManager extends StructureManager {
  constructor(game, api) {
    super(game, api);
    this.#game = game;
  }

  #game;

  update () {
    this.filterList().clear();
    this.all.forEach(objectType => this._UUIDset(objectType));
    return this
  }

  [Symbol.toStringTag] = 'ObjectTypeManager'
}


defineProperties(ObjectTypeManager.prototype, {
  manager_name: "object_type",
  StructureConstructor: ObjectType
});

module.exports = ObjectTypeManager

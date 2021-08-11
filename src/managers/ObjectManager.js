'use strict';

const StructureManager = require("./StructureManager.js");
const Object3D = require("../structures/Object.js");

class ObjectManager extends StructureManager {
  constructor(game) {
    super(game)
  }

  set (data) {
    this.game.modding.api.name("set_"+this.manager_name).data(rawEntity).send()
  }
}

Object.defineProperties(ObjectManager.prototype, {
  manager_name: {value: "object"},
  EntityConstructor: {value: Object3D}
});

module.exports = ObjectManager

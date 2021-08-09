'use strict';

const EntityManager = require("./EntityManager.js");
const Ship = require("../structures/Ship.js");

class ShipManager extends EntityManager {
  constructor(game) {
    super(game)
  }

  add () {

  }
}

Object.defineProperties(ShipManager.prototype, {
  manager_name: {value: "ship"},
  EntityConstructor: {value: Ship}
});

module.exports = ShipManager

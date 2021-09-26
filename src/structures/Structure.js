'use strict';

const UUIDv4 = require("uuid").v4;
const defineProperties = require("../utils/defineProperties.js");
const createUUID = function () {
  return UUIDv4().toUpperCase()
}

class Structure {
  constructor (game) {
    let modding = defineProperties({}, {data: {}});
    defineProperties(this, {game, modding, uuid: createUUID()})
  }

  markAsInactive () {
    defineProperties(this, {
      [this.inactive_field]: true,
      [this.inactive_field + "Step"]: this.game.step
    })
  }

  markAsSpawned () {
    defineProperties(this, {spawned: true})
  }

  isActive () {
    try { this[this.inactive_field] = false } catch(e) {}
    return this.isSpawned() && !this[this.inactive_field]
  }

  isSpawned () {
    try { this.spawned = false } catch(e) {}
    return !!this.spawned
  }
}

module.exports = Structure

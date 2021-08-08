const EventEmitter = require("events");
const EntityManager = require("../managers/EntityManager.js");

class ModdingClient extends EventEmitter {
  constructor (options) {
    super();
    options = options || {}
    for (let i of ["alien","asteroid","collectible"]) this[i+"s"] = new EntityManager(this, i);
    this.ships = new EntityManager(this, "ship", "disconnected", true);
  }
}

module.exports = ModdingClient

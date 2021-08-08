const EventEmitter = require("events");

class ModdingClient extends EventEmitter {
  constructor (options) {
    super();
    options = options || {}
  }
}

module.exports = ModdingClient

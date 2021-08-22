'use strict';

const runMod = require("../utils/runMod.js");
const defineProperties = require("../utils/defineProperties.js");

class ModdingAPI {
  constructor(game, options) {
    defineProperties(this, {
      game,
      preflight_requests: []
    });
    this.cacheECPKey = !!options.cacheECPKey;
    this.clear();
  }

  clear () {
    return this.set({});
  }
  async start () {
    try { this.options = JSON.parse(JSON.stringify(this.options)) ?? {} }
    catch (e) {
      this.options = {}
      this.encodeOptionsError = true;
    }
    return await runMod(this)
  }

  stop () {
    this.name("stop").send()
  }

  name (name) {
    return this.prop("name", name);
  }

  set (data) {
    this.pending_request = Object.assign({}, data);
    return this
  }

  prop (name, data) {
    this.pending_request[name] = data;
    return this
  }

  data (...data) {
    let pData = Object.assign(data[0]||{}, ...data.slice(1));
    return this.prop("data", pData)
  }

  clientMessage (id, name, data) {
    this.name("client_message");
    data = Object.assign(data||{}, {name: name});
    return this.data({id: id, data: data})
  }

  globalMessage (name, data) {
    return this.clientMessage(null, name, data)
  }

  send () {
    if (this.started) try { this.socket.send(JSON.stringify(this.pending_request)) }
    catch(e) { this.game.emit('error', new Error("Failed to encoding request"), this.game) }
    else this.preflight_requests.push(this.pending_request);
    return this.clear()
  }

  resetManagers () {
    this.aliens = new (require("../managers/AlienManager.js"))(this.game);
    this.asteroids = new (require("../managers/AsteroidManager.js"))(this.game);
    this.collectibles = new (require("../managers/CollectibleManager.js"))(this.game);
    this.ships = new (require("../managers/ShipManager.js"))(this.game);
    this.objects = new (require("../managers/ObjectManager.js"))(this.game);
  }
}

module.exports = ModdingAPI

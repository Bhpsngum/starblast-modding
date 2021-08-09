'use strict';

const GameSocket = require("../GameSocket.js");

module.exports.create = function (api, address, token) {
  let socket = GameSocket.create(address.ip, address.port);
  socket.onopen = function() {
    this.send(JSON.stringify({
      name: "run_mod",
      data: {
        token: token,
        options: api.options
      }
    }))
  }
  return new Promise(function (resolve, reject) {
    let ECPKey = this.ECPKey;
    socket.onmessage = function(event) {
      event = event.data;
      if ("string" == typeof event) {
        try { event = JSON.parse(event) } catch (e) {}
        let data = event.data;
        switch (event.name) {
          case "mod_started":
            Object.assign(this.modding.api, {
              socket: socket,
              ip: address.ip,
              id: data.id,
              port: address.port
            });
            delete this.modding.api.ECPKey;
            Object.assign(this, {
              started: true,
              stopped: false,
              link: "https://starblast.io/#" + data.id + "@" + address.ip + ":" + address.port,
              options: data.options
            });
            this.emit('start', this.link, this);
            resolve(this.link);
            break;
          case "tick":
            this.step = data.step;
            this.aliens.update(true);
            this.asteroids.update(true);
            this.collectibles.update(true);
            this.ships.update(true);
            this.emit('tick', data.step, this);
            break;
          case "alien_created":
          case "asteroid_created":
          case "collectible_created": {
            let entity_name = event.name.split("_")[0], entityList = this[entity_name + "s"];
            let index = entityList.pending.findIndex(entity => entity.request_id === event.request_id);
            let entity;
            if (index == -1) entity = entityList.create(event);
            else entity = entityList.pending.splice(index, 1)[0];
            entity.id = event.id;
            entity.last_updated = this.step;
            entityList.push(entity);
            entityList.update();
            this.emit(entity_name + "Create", entity, this)
            break;
          }
          case "alien_update":
          case "ship_update":
          case "asteroid_update": {
            let entityList = this[event.name.split("_")[0] + "s"], entity = entityList.find(event.id);
            if (entity == null) {
              entity = entityList.create(event);
              entity.id = event.id;
              entityList.push(entity)
            }
            entity.update(event);
            break;
          }
          case "ship_disconnected": {
            let ship = this.ships.find(event.id);
            if (ship) {
              ship.markAsInactive();
              this.ships.update();
              this.emit('shipDisconnect', ship, this)
            }
            break;
          }
          case "error":
            this.emit('error', new Error(event.text), this);
            break;
          case "event":
            switch (data.name) {
              case "ship_destroyed": {
                let ship = this.ships.find(data.ship);
                if (ship != null) {
                  let killer = this.ships.find(data.killer);
                  ship.alive = false;
                  this.emit('shipDestroy', ship, killer, this)
                }
                break;
              }
              case "alien_destroyed":
              case "asteroid_destroyed": {
                let entity_name = data.name.split("_")[0], entityList = this[entity_name + "s"];
                let entity = entityList.find(data[entity_name]);
                if (entity != null) {
                  let killer = this.ships.find(data.killer);
                  entity.markAsInactive();
                  entityList.update();
                  this.emit(entity_name + 'Destroy', entity, killer, this)
                }
                break;
              }
              case "ship_spawned": {
                let ship = this.ships.find(data.ship);
                if (ship != null) {
                  let event_name = "ship" + (ship.spawned?"Spawn":"Respawn");
                  if (!ship.spawned) {
                    /* TODO: set 3D Objects */
                    ship.spawned = true
                  }
                  this.emit(event_name, ship, this)
                }
                break;
              }
              case "collectible_picked": {
                let collectible = this.collectibles.find(data.collectible);
                if (collectible != null) {
                  let ship = this.ships.find(data.ship);
                  collectible.markAsInactive();
                  this.emit("collectiblePick", collectible, ship, this)
                }
                break;
              }
            }
            break;
          default:
            console.log(event);
        }
      }
    }.bind(this.game);
    socket.onerror = function () {
      var error = new Error("Failed to connect to the server");
      this.emit('error', error, this);
      reject(error)
    }.bind(this.game);
    socket.onclose = function () {
      this.started = false;
      this.stopped = true;
      this.link = null;
      this.emit('stop', this);
      if (this.modding.api.cacheECPKey) this.modding.api.ECPKey = ECPKey
    }.bind(this.game)
  }.bind(api))
}

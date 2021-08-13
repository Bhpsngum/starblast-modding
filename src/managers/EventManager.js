'use strict';

const GameSocket = require("../GameSocket.js");
const GameClient = require("../clients/GameClient.js");
const getEntity = require("../utils/getEntity.js");
const events = require("../resources/Events.js");

module.exports.create = function (api, address, token) {
  if (api.encodeOptionsError) {
    api.game.emit(events.ERROR, new Error("Failed to encode game options"), api);
    api.game.emit(events.ERROR, new Error("Mod will be run with empty options instead"), api);
    delete api.encodeOptionsError
  }
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
              port: address.port,
              started: true,
              stopped: false
            });
            delete this.modding.api.ECPKey;
            Object.assign(this, {
              link: "https://starblast.io/#" + data.id + "@" + address.ip + ":" + address.port,
              options: data.options
            });
            this.teams = JSON.parse(JSON.stringify(this.options.teams ?? null));
            this.modding.gameClient = new GameClient(this, address.ip, data.id, address.port);
            this.modding.gameClient.initTeamStats();
            while (this.modding.api.preflight_requests.length > 0) this.modding.api.set(this.modding.api.preflight_requests.shift()).send();
            resolve(this.link);
            this.emit(events.MOD_STARTED, this.link, this);
            break;
          case "tick":
            this.step = data.step;
            this.aliens.update(true);
            this.asteroids.update(true);
            this.collectibles.update(true);
            this.ships.update(true);
            this.emit(events.TICK, data.step, this);
            break;
          case "alien_created":
          case "asteroid_created":
          case "collectible_created": {
            let entity_name = event.name.split("_")[0], entityList = this[entity_name + "s"];
            let index = entityList.pending.findIndex(entity => entityList.isInstance(entity) && entity.request_id === event.request_id);
            let entity;
            if (index == -1) entity = entityList.create(event);
            else entity = entityList.pending.splice(index, 1)[0];
            Object.defineProperties(entity, {
              id: {value: event.id},
              createdStep: {value: this.step}
            });
            entityList.insert(entity);
            this.emit(events[event.name.toUpperCase()], entity, this);
            break;
          }
          case "ship_update": {
            let ship = getEntity(event, this.ships);
            if (!ship.spawned) this.objects.forEach(object => this.modding.api.clientMessage(ship.id, "set_object", {object: object}).send());
            ship.update(event);
            break;
          }
          case "alien_update":
          case "asteroid_update":
            getEntity(event, this[event.name.split("_")[0] + "s"]).update(event);
            break;
          case "ship_disconnected": {
            let ship = getEntity(event, this.ships);
            ship.markAsInactive();
            this.ships.update();
            this.emit(events.SHIP_DISCONNECTED, ship, this);
            break;
          }
          case "error":
            this.emit(events.ERROR, new Error(event.text), this);
            break;
          case "event":
            switch (data.name) {
              case "ship_destroyed": {
                data.id = data.ship;
                let ship = getEntity(data, this.ships);
                let killer = this.ships.findById(data.killer, true);
                ship.alive = false;
                this.emit(events.SHIP_DESTROYED, ship, killer, this);
                break;
              }
              case "alien_destroyed":
              case "asteroid_destroyed": {
                let entity_name = data.name.split("_")[0], entityList = this[entity_name + "s"];
                data.id = data[entity_name];
                let entity = getEntity(data, entityList);
                let killer = this.ships.findById(data.killer, true);
                entity.markAsInactive();
                entityList.update();
                this.emit(events[entity_name.toUpperCase()], entity, killer, this);
                break;
              }
              case "ship_spawned": {
                data.id = data.ship;
                let ship = getEntity(data, this.ships);
                let event_name = ship.spawned ? events.SHIP_SPAWNED : events.SHIP_RESPAWNED;
                if (!ship.spawned) Object.defineProperty(ship, 'spawned', {value: true});
                this.emit(event_name, ship, this);
                break;
              }
              case "collectible_picked": {
                data.id = data.collectible;
                let collectible = getEntity(data, this.collectibles);
                data.id = data.ship;
                let ship = getEntity(data, this.ships);
                collectible.markAsInactive();
                this.emit(events.COLLECTIBLE_PICKED, collectible, ship, this);
                break;
              }
              case "ui_component_clicked":
                let id = data.id;
                data.id = data.ship;
                this.emit(events.UI_COMPONENT_CLICKED, id, getEntity(data, this.ships), this);
                break;
            }
            break;
        }
      }
    }.bind(this.game);
    socket.onerror = function (error) {
      this.emit(events.ERROR, error, this)
    }.bind(this.game);
    socket.onclose = function () {
      if (!this.started) reject(new Error("Failed to run the mod"));
      this.modding.api.started = false;
      this.modding.api.stopped = true;
      this.emit(events.MOD_STOPPED, this);
      this.reset();
      if (this.modding.api.cacheECPKey) this.modding.api.ECPKey = ECPKey
    }.bind(this.game)
  }.bind(api))
}

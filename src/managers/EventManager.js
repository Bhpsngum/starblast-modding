'use strict';

const GameSocket = require("../GameSocket.js");
const GameClient = require("../clients/GameClient.js");
const getEntity = require("../utils/getEntity.js");
const events = require("../resources/Events.js")();
const defineProperties = require("../utils/defineProperties.js");

module.exports.create = function (api, address, token) {
  if (api.encodeOptionsError) {
    api.game.error("Failed to encode game options");
    api.game.error("Mod will be run with empty options instead")
  }
  delete api.encodeOptionsError
  let socket = GameSocket.create(address.ip, address.port, "https://starblast.data.neuronality.com");
  socket.on("open", function() {
    this.send(JSON.stringify({
      name: "run_mod",
      data: {
        token: token,
        options: api.configuration.options
      }
    }))
  });
  socket.on('connection', function (ws, req) {
    console.log(req.headers);
  });
  return new Promise(function (resolve, reject) {
    socket.on("message", function(event, isBinary) {
      if (!isBinary) {
        try { event = JSON.parse(event.toString()) ?? {} } catch (e) { event = {} }
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
            for (let key of ["map_name", "map_id"]) delete data.options[key]; // in GameClient.js
            this.modding.data.options = defineProperties({}, data.options);
            this.modding.gameClient.connect(address.ip, data.id, address.port);
            this.modding.gameClient.initTeamStats();
            while (this.modding.api.preflight_requests.length > 0) this.modding.api.set(this.modding.api.preflight_requests.shift()).send();
            resolve(this.link);
            this.emit(events.MOD_STARTED, this.link, this);
            break;
          case "tick":
            this.modding.data.step = data.step;
            this.modding.api.request_id = 0;
            for (let key of ["aliens", "asteroids", "collectibles", "ships", "objects", "teams"]) this.modding.data[key]?.update?.(true);
            this.emit(events.TICK, data.step, this);
            break;
          case "alien_created":
          case "asteroid_created":
          case "collectible_created": {
            let entity_name = event.name.split("_")[0], entityList = this[entity_name + "s"], uid = event.request_id;
            let entity = entityList.all.find(entity => {
              if (entityList.isInstance(entity)) {
                try { entity.id = null } catch(e) {}
                return entity.id == null && entity.request_id === uid
              }
              return false
            });
            if (entity == null) {
              entity = entityList.create(event);
              entityList.insert(entity)
            }
            defineProperties(entity, {
              id: event.id,
              createdStep: Math.max(this.step, 0),
            });
            entity.markAsSpawned();
            entity.modding.data.lastUpdatedStep = this.step;
            entityList.update();
            // let resolve = this.modding.handlers.create.get(uid)?.resolve;
            // if ("function" == typeof resolve) {
            //   this.modding.handlers.create.delete(uid);
            //   resolve(entity)
            // }
            this.emit(events[event.name.toUpperCase()], entity, this);
            break;
          }
          case "ship_update": {
            let ship = getEntity(event, this.ships);
            if (!ship.isSpawned()) this.objects.forEach(object => this.modding.api.clientMessage(ship.id, "set_object", {object: object}).send())
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
            this.error(event.text);
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
                let event_name = ship.isSpawned() ? events.SHIP_SPAWNED : events.SHIP_RESPAWNED;
                if (!ship.isSpawned()) ship.markAsSpawned();
                this.ships.update();
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
    }.bind(this.game));
    socket.on("close", function () {
      if (!this.started) reject(new Error("Failed to run the mod"));
      if (GameSocket.OPEN === this.modding.gameClient.socket?.readyState) this.modding.gameClient.socket.close();
      this.emit(events.MOD_STOPPED, this);
      this.reset();
    }.bind(this.game))
  }.bind(api))
}

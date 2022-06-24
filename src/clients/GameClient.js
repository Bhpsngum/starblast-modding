'use strict';

const GameSocket = require("../GameSocket.js");
const TeamManager = require("../managers/TeamManager.js");
const getEntity = require("../utils/getEntity.js");
const defineProperties = require("../utils/defineProperties.js");
const readBinaries = function (data, game) {
  let dataView = new DataView(data), eventID = dataView.getUint8(0);
  dataView = new DataView(data.slice(1));
  switch (eventID) {
    case eventIDs.STATION_UPDATE:
      game.teams.socketUpdate(dataView);
      break;
  }
}
const eventIDs = {
  STATION_UPDATE: 205
}

class GameClient {
  constructor(game, api) {
    this.#game = game;
    this.#api = api;
  }

  #game;
  #api

  connect (ip, id, port) {
    let socket = GameSocket.create(ip, port), interval, game = this.#game, api = this.#api;
    socket.on("open", function () {
      this.send(JSON.stringify({
        name: "join",
        data: {
          player_name: "starblast-modding",
          preferred: id
        }
      }))
    });
    socket.on("message", function (event, isBinary) {
      if (!isBinary && game.started && !game.stopped) {
        let parsed;
        try { parsed = JSON.parse(event.toString()) ?? {} } catch (e) { parsed = {} }
        let data = parsed.data
        switch (parsed.name) {
          case "welcome":
            Object.assign(api.mod_data.options, {
              map_name: data.name,
              map_id: data.seed
            });
            this.socket = socket;
            for (let ship of game.ships) socket.send(JSON.stringify({
              name: "get_name",
              data: {
                id: ship.id
              }
            }));
            interval = setInterval(function(){socket.send(0)}, 1000);
            break;
          case "player_name":
            let custom = data.custom ?? {finish: "zinc", laser: "0"}, lasers = ["single", "double", "lightning", "digital"];
            custom.badge = "string" == typeof custom.badge ? custom.badge.replace(/^https{0,1}\:\/\/starblast\.io\/ecp\/([^.]+).+$/,"$1") : null;
            custom.laser = lasers[custom.laser] ?? lasers[0];
            data.customization = defineProperties({}, custom);
            getEntity(game, data, game.ships).update(data, true)
            break;
        }
      }
      else try {
        if ("function" == typeof event.arrayBuffer) event.arrayBuffer().then(e => readBinaries.call(this, e, game));
        else readBinaries.call(this, event.buffer.slice(event.byteOffset, event.byteOffset + event.byteLength), game)
      } catch (e) {}
    }.bind(this));
    socket.on("close", function () {
      if (interval != null) clearInterval(interval)
    })
  }

  initTeamStats () {
    let teams = JSON.parse(JSON.stringify(this.#game.options.teams ?? null));
    if (Array.isArray(teams)) {
      let teamManager = new TeamManager(this.#game, this.#api);
      teamManager.insert(...teams.map((team, i) => Object.assign({}, team, {id: i})));
      this.#api.mod_data.teams = teamManager
    }
  }
}

module.exports = GameClient

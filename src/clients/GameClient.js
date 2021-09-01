'use strict';

const GameSocket = require("../GameSocket.js");
const TeamManager = require("../managers/TeamManager.js");
const getEntity = require("../utils/getEntity.js");
const defineProperties = require("../utils/defineProperties.js");
const readBinaries = function (data) {
  let dataView = new DataView(data), eventID = dataView.getUint8(0);
  dataView = new DataView(data.slice(1));
  switch (eventID) {
    case eventIDs.STATION_UPDATE:
      this.game.teams.socketUpdate(dataView);
      break;
  }
}
const eventIDs = {
  STATION_UPDATE: 205
}

class GameClient {
  constructor(game) {
    defineProperties(this, {game})
  }

  connect (ip, id, port) {
    let socket = GameSocket.create(ip, port), interval;
    socket.on("open", function () {
      this.send('{"name":"join","data":{"player_name":" ","preferred":' +id +'}}')
    });
    socket.on("message", function (event, isBinary) {
      if (!isBinary) {
        let parsed;
        try { parsed = JSON.parse(event.toString()) ?? {} } catch (e) { parsed = {} }
        let data = parsed.data
        switch (parsed.name) {
          case "welcome":
            defineProperties(this.game.options, {
              map_name: data.name,
              map_id: data.seed
            });
            this.socket = socket;
            interval = setInterval(function(){socket.send(0)}, 1000);
            break;
          case "player_name":
            let custom = data.custom ?? {finish: "zinc", laser: "0"}, lasers = ["single", "double", "lightning", "digital"];
            custom.badge = "string" == typeof custom.badge ? custom.badge.replace(/^https{0,1}\:\/\/starblast\.io\/ecp\/([^.]+).+$/,"$1") : null;
            custom.laser = lasers[custom.laser] ?? lasers[0];
            custom.skin = custom.finish;
            data.customization = defineProperties({}, custom);
            getEntity(data, this.game.ships).update(data, true)
            break;
        }
      }
      else try {
        if ("function" == typeof event.arrayBuffer) event.arrayBuffer().then(readBinaries.bind(this));
        else readBinaries.call(this, event.buffer.slice(event.byteOffset, event.byteOffset + event.byteLength))
      } catch (e) {}
    }.bind(this));
    socket.on("close", function () {
      if (interval != null) clearInterval(interval)
    })
  }

  initTeamStats () {
    let teams = JSON.parse(JSON.stringify(this.game.options.teams ?? null));
    if (Array.isArray(teams)) {
      let teamManager = new TeamManager(this.game);
      teamManager.insert(...teams.map((team, i) => Object.assign({}, team, {id: i})));
      this.game.modding.data.teams = teamManager
    }
  }
}

module.exports = GameClient

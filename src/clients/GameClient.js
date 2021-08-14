'use strict';

const GameSocket = require("../GameSocket.js");
const Station = require("../structures/Station.js");
const getEntity = require("../utils/getEntity.js");
const readBinaries = function (data) {
  let dataView = new DataView(data), eventID = dataView.getUint8(0);
  dataView = new DataView(data.slice(1));
  switch (eventID) {
    case eventIDs.STATION_UPDATE:
      let teams = this.game.teams, size = Math.round(dataView.byteLength/teams.length);
      for (let i = 0; i < teams.length; i++) {
        let team = teams[i], index = i * size, base_level = dataView.getUint8(index + 1);
        team.station.updateInfo({
          open: dataView.getUint8(index) > 0,
          level: base_level + 1,
          crystals: dataView.getUint32(index + 2, true)
        });
        let modules = team.station.modules;
        for (let j = 0; j < modules.length; j++) modules[j].updateShield(dataView.getUint8(index + j + 7))
      }
      break;
  }
}
const eventIDs = {
  STATION_UPDATE: 205
}

class GameClient {
  constructor(game, ip, id, port) {
    this.game = game;
    let socket = GameSocket.create(ip, port), interval;
    socket.onopen = function () {
      this.send('{"name":"join","data":{"player_name":"_","preferred":' +id +'}}')
    }
    socket.onmessage = function (event) {
      event = event.data;
      if (typeof event == "string") {
        let parsed;
        try { parsed = JSON.parse(event) } catch(e) { parsed = event }
        let data = parsed.data
        switch (parsed.name) {
          case "welcome":
            Object.assign(this.game.options, {
              map_name: data.name,
              map_id: data.seed
            });
            this.game.teams = data.mode.teams ?? null;
            this.initTeamStats();
            interval = setInterval(function(){socket.send(0)}, 1000);
            break;
          case "player_name":
            let custom = data.custom ?? {finish: "zinc", laser: "0"}, lasers = ["single", "double", "lightning", "digital"];
            custom.badge = "string" == typeof custom.badge ? custom.badge.replace(/^https{0,1}\:\/\/starblast\.io\/ecp\/([^.]+).+$/,"$1") : null;
            custom.laser = lasers[custom.laser] ?? lasers[0];
            data.customization = custom;
            getEntity(data, this.game.ships).update(data, true)
            break;
        }
      }
      else {
        if ("function" == typeof event.arrayBuffer) event.arrayBuffer().then(readBinaries.bind(this));
        else readBinaries.call(this, event.buffer.slice(event.byteOffset, event.byteOffset + event.byteLength))
      }
    }.bind(this)
    socket.onclose = function () {
      if (interval != null) clearInterval(interval);
    }
  }

  initTeamStats () {
    if (this.game.teams) this.game.teams.forEach(v=>Object.assign(v, {
      level: 1,
      crystals: 0,
      crystals_max: this.game.options.crystal_capacity[0],
      open: true,
      station: new Station(this.game, v.station)
    }));
  }
}

module.exports = GameClient

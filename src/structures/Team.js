'use strict';

const Structure = require("./Structure.js");
const Station = require("./Station.js");

class Team extends Structure {
  constructor(game, options) {
    super(game);
    Object.defineProperties(this, {
      id: {value: options.id},
      spawned: {value: true},
      createdStep: {value: 0}
    });
    this.faction = options.faction;
    this.open = this.open ?? true;
    this.station = new Station(this.game, Object.assign({}, options.station, {
      name: options.base_name,
      team_id: this.id
    }));
  }

  updateInfo (data) {
    data = Object.assign({}, data);
    this.open = data.open;
    this.station.updateInfo(data.station);
    if (!this.station.isActive()) this.markAsInactive()
  }
}

Object.defineProperties(Team.prototype, {
  structure_type: {value: "team"},
  inactive_field: {value: "eliminated"}
});

module.exports = Team

'use strict';

const Structure = require("./Structure.js");
const Station = require("./Station.js");

class Team extends Structure {
  constructor(game, options) {
    super(game);
    Object.defineProperties(this, {
      id: {value: options.id},
      spawned: {value: true},
      createdStep: {value: 0},
      faction: {value: options.faction}
    });
    this.open = this.open ?? true
  }

  updateInfo (data) {
    data = Object.assign({}, data);
    this.open = data.open
  }

  update () {
    this.stations.update()
  }
}

Object.defineProperties(Team.prototype, {
  structure_type: {value: "team"},
  inactive_field: {value: "eliminated"}
});

module.exports = Team

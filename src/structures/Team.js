'use strict';

const Structure = require("./Structure.js");
const Station = require("./Station.js");
const defineProperties = require("../utils/defineProperties.js");

class Team extends Structure {
  constructor(game, options) {
    super(game);
    defineProperties(this, {
      id: options.id,
      spawned: true,
      createdStep: 0,
      faction: "string" == typeof options.faction ? options.faction : "Unknown"
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

defineProperties(Team.prototype, {
  structure_type: "team",
  inactive_field: "eliminated"
});

module.exports = Team

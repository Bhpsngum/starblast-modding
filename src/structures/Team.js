'use strict';

const Structure = require("./Structure.js");
const Station = require("./Station.js");
const defineProperties = require("../utils/defineProperties.js");

class Team extends Structure {
  constructor(game, options) {
    super(game);
    this.markAsSpawned(true);
    defineProperties(this, {
      id: options.id,
      createdStep: 0,
      faction: "string" == typeof options.faction ? options.faction : "Unknown"
    });
    let _this = this.modding.data;
    _this.open = true
  }

  updateInfo (data) {
    let _this = this.modding.data;
    _this.open = !!data?.open
  }

  update () {
    this.stations.update()
  }

  get open () {
    return this.modding.data.open
  }
}

defineProperties(Team.prototype, {
  structure_type: "team",
  inactive_field: "eliminated"
});

module.exports = Team

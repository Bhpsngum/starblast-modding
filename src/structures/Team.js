'use strict';

const Structure = require("./Structure.js");
const Station = require("./Station.js");
const defineProperties = require("../utils/defineProperties.js");

/**
 * The Team Instance
 * @extends {Structure}
 * @abstract
 */

class Team extends Structure {
  constructor(game, api, options) {
    super(game, api);
    this.#game = game;
    this.markAsSpawned(true);

    /**
    * Team faction name
    * @name Team#faction
    * @type {string}
    * @readonly
    */

    defineProperties(this, {
      id: options.id,
      createdStep: 0,
      faction: "string" == typeof options.faction ? options.faction : "Unknown"
    });
    let _this = this.modding.data;
    _this.open = true
  }

  #game;

  updateInfo (data) {
    let _this = this.modding.data;
    _this.open = !!data?.open
  }

  update () {
    this.stations.update()
  }

  /**
   * Indicates whether the team is open (accepts more players) or not
   * @type {boolean}
   * @readonly
   */

  get open () {
    return this.modding.data.open
  }
}

defineProperties(Team.prototype, {
  structure_type: "team",
  inactive_field: "eliminated"
});

module.exports = Team

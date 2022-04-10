'use strict';

const EntityManager = require("./EntityManager.js");
const Ship = require("../structures/Ship.js");
const defineProperties = require("../utils/defineProperties.js");
const parseUI = require("../utils/parseUI.js");
const parseIntermission = require("../utils/parseIntermission.js");

class ShipManager extends EntityManager {
  constructor(game) {
    super(game);
    this.#game = game;
  }

  #game;

  async add () {
    throw new Error("Entity class 'ship' could not be added through the Modding API")
  }

  showInstructor () {
    this.#game.modding.api.globalMessage("show_instructor").send();
    return this
  }

  instructorSays (text, character) {
    this.#game.modding.api.globalMessage("instructor_says", {
      text: text,
      character: character
    }).send();
    return this
  }

  hideInstructor () {
    this.#game.modding.api.globalMessage("hide_instructor").send();
    return this
  }

  setUIComponent (component) {
    this.#game.modding.api.globalMessage("set_ui_component", {component: parseUI(component)}).send();
    return this
  }

  intermission (data, gameOver) {
    this.#game.modding.api.globalMessage("intermission", {data: parseIntermission(data, gameOver)}).send();
    return this
  }

  gameOver (data) {
    return this.intermission(data, true)
  }

  update () {
    this.filterList();
    this.clear();
    this.all.forEach(ship => ship.isActive() && this._UUIDset(ship));
    return this
  }

  get limit () {
    return this.#game.options.max_players
  }

  [Symbol.toStringTag] = 'ShipManager'
}

defineProperties(ShipManager.prototype, {
  manager_name: "ship",
  StructureConstructor: Ship
});

module.exports = ShipManager

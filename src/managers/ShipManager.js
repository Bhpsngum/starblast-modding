'use strict';

const EntityManager = require("./EntityManager.js");
const Ship = require("../structures/Ship.js");

class ShipManager extends EntityManager {
  constructor(game) {
    super(game)
  }

  add () {

  }

  showInstructor () {
    this.game.modding.api.clientMessage(null, "show_instructor").send();
    return this
  }

  instructorSays (text, character) {
    this.game.modding.api.clientMessage(null, "instructor_says", {
      text: text,
      character: character
    }).send();
    return this
  }

  hideInstructor () {
    this.game.modding.api.clientMessage(null, "hide_instructor").send();
    return this
  }

  setUIComponent (component) {
    this.game.modding.api.clientMessage(null, "set_ui_component", {component: component}).send();
    return this
  }

  intermission (data, gameover = false) {
    data = data || {}
    data.gameover = !!gameover;
    this.game.modding.api.clientMessage(null, "intermission", {data: data}).send();
    return this
  }

  gameOver (data) {
    this.intermission(data, true)
  }
}

Object.defineProperties(ShipManager.prototype, {
  manager_name: {value: "ship"},
  EntityConstructor: {value: Ship}
});

module.exports = ShipManager

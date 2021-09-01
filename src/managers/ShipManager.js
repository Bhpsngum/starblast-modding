'use strict';

const EntityManager = require("./EntityManager.js");
const Ship = require("../structures/Ship.js");
const defineProperties = require("../utils/defineProperties.js");

class ShipManager extends EntityManager {
  constructor(game) {
    super(game)
  }

  async add () {
    throw new Error("Entity class 'ship' could not be added through the Modding API")
  }

  showInstructor () {
    this.game.modding.api.globalMessage("show_instructor").send();
    return this
  }

  instructorSays (text, character) {
    this.game.modding.api.globalMessage("instructor_says", {
      text: text,
      character: character
    }).send();
    return this
  }

  hideInstructor () {
    this.game.modding.api.globalMessage("hide_instructor").send();
    return this
  }

  setUIComponent (component) {
    this.game.modding.api.globalMessage("set_ui_component", {component: component}).send();
    return this
  }

  intermission (data, gameOver) {
    data = Object.assign({}, data);
    data.gameover = !!gameOver;
    this.game.modding.api.globalMessage("intermission", {data: data}).send();
    return this
  }

  gameOver (data) {
    return this.intermission(data, true)
  }

  update (onTick = false) {
    this.filterList();
    if (onTick) this.all.forEach(ship => ship.isActive() && ship.isAlive() && ship.step());
    this.splice(0);
    this.push(...this.all.filter(ship => ship.isActive()));
    return this
  }
}

defineProperties(ShipManager.prototype, {
  manager_name: "ship",
  StructureConstructor: Ship
});

module.exports = ShipManager

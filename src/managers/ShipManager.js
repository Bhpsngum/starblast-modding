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

  intermission (data) {
    this.game.modding.api.globalMessage("intermission", {data: data}).send();
    return this
  }

  gameOver (data) {
    data = data || {}
    data.gameover = true;
    this.game.modding.api.globalMessage("intermission", {data: data}).send();
    return this
  }

  setObject (data) {
    this.game.modding.api.globalMessage("set_object", {data: data}).send();
  }

  update (onTick = false) {
    let x = this.all.splice(0).filter(entity => this.isInstance(entity));
    this.all.push(...x);
    if (onTick) this.all.forEach(entity => entity.isActive() && entity.step());
    this.splice(0);
    this.push(...this.all.filter(entity => entity.isActive()))
  }
}

Object.defineProperties(ShipManager.prototype, {
  manager_name: {value: "ship"},
  EntityConstructor: {value: Ship}
});

module.exports = ShipManager

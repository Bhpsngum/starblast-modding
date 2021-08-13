'use strict';

const Entity = require("./Entity.js");
const MassRename = require("../utils/MassivePrototypeDefinition.js");
const convertStats = require("../utils/convertStats.js");
const limitedJSON = require("../utils/limitedJSON.js");

class Ship extends Entity {
  constructor(game) {
    super(game)
  }

  update (data, fromGameClient) {
    if (fromGameClient) {
      this.customization = data.customization;
      this.hue = data.hue
    }
    else {
      this.entityUpdate(data);
      this.name = data.player_name;
      this.angle = data.r * 180 / Math.PI; // convert from radian back to degree
      this.idle = data.idle;
      this.alive = data.alive;
      this.type = data.type;
      this.stats = convertStats(data.stats);
      this.team = data.team ?? null;
      this.score = data.score;
      this.shield = data.shield;
      this.generator = data.generator;
      this.crystals = data.crystals;
      this.healing = data.healing
    }
  }

  showInstructor () {
    this.game.modding.api.clientMessage(this.id, "show_instructor").send();
    return this
  }

  instructorSays (text, character) {
    this.game.modding.api.clientMessage(this.id, "instructor_says", {
      text: text,
      character: character
    }).send();
    return this
  }

  hideInstructor () {
    this.game.modding.api.clientMessage(this.id, "hide_instructor").send();
    return this
  }

  setUIComponent (component) {
    this.game.modding.api.clientMessage(this.id, "set_ui_component", {component: component}).send();
    return this
  }

  intermission (data) {
    this.game.modding.api.clientMessage(this.id, "intermission", {data: data}).send();
    return this
  }

  gameOver (data) {
    data = data || {}
    data.gameover = true;
    this.game.modding.api.clientMessage(this.id, "intermission", {data: data}).send();
    return this
  }

  setObject (data) {
    this.game.modding.api.clientMessage(this.id, "set_object", {data: data}).send();
  }

  emptyWeapons () {
    this.game.modding.api.name("empty_weapons").prop("ship", this.id).send();
    return this
  }

  toJSON () {
    return limitedJSON(this, ["name", "x", "y", "vx", "vy", "type", "angle", "score", "idle", "shield", "generator", "healing", "crystals", "stats", "team", "hue"])
  }
}

Object.defineProperties(Ship.prototype, {
  entity_type: {value: "ship"},
  inactive_field: {value: "disconnected"},
  spawned: {value: false}
});

MassRename(Ship, ["x", "y", "vx", "vy", "type", "angle", "score", "idle", "shield", "generator", "healing", "crystals", "stats", "team", "collider", "hue"]);

module.exports = Ship

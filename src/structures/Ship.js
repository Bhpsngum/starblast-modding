const Entity = require("./Entity.js");
const MassRename = require("../utils/MassivePrototypeDefinition.js");
const convertStats = require("../utils/convertStats.js");

class Ship extends Entity {
  constructor(game) {
    super(game);
  }
}

Object.defineProperty(Ship.prototype, 'entityType', {
  value: "ship"
});

Ship.prototype.update = function(data, fromGameClient) {
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
    this.team = null != data.team ? data.team : null;
    this.score = data.score;
    this.shield = data.shield;
    this.generator = data.generator;
    this.crystals = data.crystals;
    this.healing = data.healing
  }
}

Ship.prototype.kill = function () {
  this.set({kill: true});
  return this
}

Ship.prototype.showInstructor = function () {
  this.game.modding.api.clientMessage(this.id, "show_instructor").send();
  return this
}

Ship.prototype.hideInstructor = function () {
  this.game.modding.api.clientMessage(this.id, "hide_instructor").send();
  return this
}

Ship.prototype.instructorSays = function (text, character) {
  this.game.modding.api.clientMessage(this.id, "instructor_says", {
    text: text,
    character: character
  }).send();
  return this
}

Ship.prototype.setUIComponent = function (component) {
  this.game.modding.api.clientMessage(this.id, "set_ui_component", {component: component}).send();
  return this
}

Ship.prototype.intermission = function (data) {
  this.game.modding.api.clientMessage(this.id, "intermission", {data: data}).send();
  return this
}

Ship.prototype.gameOver = function (data) {
  data = data || {}
  data.gameover = true;
  this.game.modding.api.clientMessage(this.id, "intermission", {data: data}).send();
  return this
}

Ship.prototype.emptyWeapons = function () {
  this.game.modding.api.name("empty_weapons").prop("ship", this.id).send();
  return this
}

MassRename(Ship, ["type", "angle", "score", "idle", "shield", "generator", "healing", "crystals", "stats", "team", "collider", "hue"]);

module.exports = Ship

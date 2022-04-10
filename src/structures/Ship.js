'use strict';

const Entity = require("./Entity.js");
const MassRename = require("../utils/MassivePrototypeDefinition.js");
const limitedJSON = require("../utils/limitedJSON.js");
const defineProperties = require("../utils/defineProperties.js");
const toString = require("../utils/toString.js");
const parseUI = require("../utils/parseUI.js");
const parseIntermission = require("../utils/parseIntermission.js");
const convertStats = function(data) {
  if (isNaN(data)) return 0;
  let stats = [];
  for (let i = 0; i < 8; i++) {
    stats.push(15 & data); // equivalent to data % 16
    data = data >> 4 // equivalent to data = data / 16
  }
  return stats
}

/**
 * The ObjectType Instance
 * @extends {Entity}
 * @param {ModdingClient} game - The <code>ModdingClient</code> object
 */

class Ship extends Entity {
  constructor(game) {
    super(game);
    this.#game = game;
  }

  #game;

  get alive () {
    return !!this.modding.data.alive
  }

  update (data, fromGameClient) {
    let _this = this.modding.data;
    if (fromGameClient) {
      _this.customization = data.customization;
      _this.hue = data.hue
    }
    else {
      this.entityUpdate(data);
      _this.name = data.player_name;
      _this.angle = data.r * 180 / Math.PI; // convert from radian back to degree
      _this.idle = data.idle;
      _this.alive = data.alive;
      _this.type = data.type;
      _this.stats = convertStats(data.stats);
      _this.team = data.team;
      _this.score = data.score;
      _this.shield = data.shield;
      _this.generator = data.generator;
      _this.crystals = data.crystals;
      _this.healing = data.healing
    }
  }

  /**
   * Show instructor screen to the ship
   * @returns {Ship}
   */

  showInstructor () {
    this.#game.modding.api.clientMessage(this.id, "show_instructor").send();
    return this
  }

  /**
   * Display message to the ship with instructor screen
   * @param {string} text - the message to be delivered
   * @param {string} character - the instructor character name
   * @returns {Ship}
   */

  instructorSays (text, character) {
    this.#game.modding.api.clientMessage(this.id, "instructor_says", {text, character}).send();
    return this
  }

  /**
   * Hide the instructor screen from the ship
   * @returns {Ship}
   */

  hideInstructor () {
    this.#game.modding.api.clientMessage(this.id, "hide_instructor").send();
    return this
  }

  /**
   * Set the UI Component to the ship
   * @param {object} UIComponent - UI component options
   * @returns {Ship}
   */

  setUIComponent (component) {
    this.#game.modding.api.clientMessage(this.id, "set_ui_component", {component: parseUI(component)}).send();
    return this
  }

  /**
   * Show intermission screen to the ship
   * @param {object} data - Data to show on the screen
   * @param {boolean} gameOver - To indicate whether it's a gameover screen or not
   * @returns {Ship}
   */

  intermission (data, gameOver) {
    this.#game.modding.api.clientMessage(this.id, "intermission", {data: parseIntermission(data, gameOver)}).send();
    return this
  }

  /**
   * Show the gameover screen to the ship
   * @param {object} data - Data to show on the screen
   * @returns {Ship}
   */

  gameover (data) {
    return this.intermission(data, true)
  }

  /**
   * Show the gameover screen to the ship
   * @param {object} data - Data to show on the screen
   * @returns {Ship}
   */

  gameOver (data) {
    return this.intermission(data, true)
  }

  setObject (data) {
    this.#game.modding.api.clientMessage(this.id, "set_object", {data}).send();
  }

  /**
   * Empty the ship's weapons slot
   * @returns {Ship}
   */

  emptyWeapons () {
    this.#game.modding.api.name("empty_weapons").prop("ship", this.id).send();
    return this
  }

  /**
   * Ship name
   * @type {string}
   * @readonly
   */

  get name () {
    return this.modding.data.name
  }

  /**
   * The ship's code whose player are on
   * @type {number}
   * @readonly
   */

  get type () {
    return this.modding.data.type
  }

  /**
   * Ship angle (in degrees)
   * @type {number}
   * @readonly
   */

  get angle () {
    return this.modding.data.angle
  }

  /**
   * Ship score
   * @type {number}
   * @readonly
   */

  get score () {
    return this.modding.data.score
  }

  /**
   * Indicates whether the ship is in idle mode or not
   * @type {boolean}
   * @readonly
   */

  get idle () {
    return this.modding.data.idle
  }

  /**
   * Ship shield
   * @type {number}
   * @readonly
   */

  get shield () {
    return this.modding.data.shield
  }

  /**
   * Ship generator's value
   * @type {number}
   * @readonly
   */

  get generator () {
    return this.modding.data.generator
  }

  /**
   * Indicates whether the ship is in healing mode or not
   * @type {number}
   * @readonly
   */

  get healing () {
    return this.modding.data.healing
  }

  /**
   * Ship crystals amount
   * @type {number}
   * @readonly
   */

  get crystals () {
    return this.modding.data.crystals
  }

  /**
   * Ship stats (specs upgrades)
   * @type {array<number>}
   * @readonly
   */

  get stats () {
    return this.modding.data.stats
  }

  /**
   * Ship team id
   * @type {number}
   * @readonly
   */

  get team () {
    return this.modding.data.team ?? null
  }

  /**
   * Ship hue
   * @type {number}
   * @readonly
   */

  get hue () {
    return this.modding.data.hue ?? null
  }

  /**
   * Ship customization, containing (string) badge, (string) finish and (number) skin
   * @type {object}
   * @readonly
   */

  get customization () {
    return this.modding.data.customization ?? null
  }

  toJSON () {
    return limitedJSON(this, ["name", "x", "y", "vx", "vy", "type", "angle", "score", "idle", "shield", "generator", "healing", "crystals", "stats", "team", "hue", "customization"])
  }
}

defineProperties(Ship.prototype, {
  structure_type: "ship",
  inactive_field: "disconnected"
});

MassRename(Ship, ["x", "y", "vx", "vy", "type", "angle", "score", "idle", "shield", "generator", "healing", "crystals", "stats", "team", "collider", "hue"]);

module.exports = Ship

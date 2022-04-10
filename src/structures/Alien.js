'use strict';

const Entity = require("./Entity.js");
const CollectibleCodes = require("../utils/collectibleCodes.js");
const MassRename = require("../utils/MassivePrototypeDefinition.js");
const limitedJSON = require("../utils/limitedJSON.js");
const defineProperties = require("../utils/defineProperties.js");
const alien_types = new Map([
  [10, {points: [10, 20, 50, 1000]}],
  [11, {points: [30, 60, 120]}],
  [12, {points: [1200, 2500]}],
  [13, {points: [50]}], // recheck
  [14, {points: [80, 80, 80]}],
  [15, {points: [1500, 2500]}],
  [16, {points: [40, 75, 120, 1750]}],
  [17, {points: [80, 100, 150]}],
  [18, {points: [100, 200, 300]}],
  [19, {points: [1000, 2500, 4000]}],
  [20, {points: [5000, 10000]}]
]);

class Alien extends Entity {
  constructor(game, options) {
    super(game);
    this.#game = game;
    let _this = this.modding.data;
    _this.x = options?.x ?? 0;
    _this.y = options?.y ?? 0;
    _this.vx = options?.vx ?? 0;
    _this.vy = options?.vy ?? 0;
    _this.code = options?.code ?? [...alien_types.keys()][0];
    _this.level = options?.level ?? 0;
    _this.points = options?.points;
    let weapon_drop = CollectibleCodes.indexOf(options?.weapon_drop);
    defineProperties(this, {
      weapon_drop: CollectibleCodes[weapon_drop] ?? null,
      crystal_drop: "number" == options?.crystal_drop ? options.crystal_drop : 0
    })
  }

  #game;

  update (data) {
    this.entityUpdate(data);
    let _this = this.modding.data
    _this.code = data.code;
    let alien_type = alien_types.get(_this.code);
    _this.level = Math.min(data.level, alien_type.points.length - 1);
    _this.points = "number" == typeof _this.points ? _this.points : alien_type.points[_this.level];
  }

  get code () {
    return this.modding.data.code
  }

  get level () {
    return this.modding.data.level
  }

  get points () {
    return this.modding.data.points
  }

  toJSON () {
    return limitedJSON(this, ["x", "y", "request_id", "vx", "vy", "shield", "regen", "points", "damage", "laser_speed", "rate", "code", "level", "weapon_drop", "crystal_drop"])
  }
}

defineProperties(Alien.prototype, {
  structure_type: "alien",
  inactive_field: "killed"
});

MassRename(Alien, ["x", "y", "vx", "vy", "shield", "regen", "damage", ["laserSpeed", "laser_speed"], "rate"]);

module.exports = Alien

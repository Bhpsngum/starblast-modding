'use strict';

const Entity = require("./Entity.js");
const CollectibleCodes = require("../utils/collectibleCodes.js");
const MassRename = require("../utils/MassivePrototypeDefinition.js");
const limitedJSON = require("../utils/limitedJSON.js");
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
    options = Object.assign({}, options);
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.vx = options.vx ?? 0;
    this.vy = options.vy ?? 0;
    this.code = options.code ?? [...alien_types.keys()][0];
    this.level = options.level ?? 0;
    let weapon_drop = CollectibleCodes.indexOf(options.weapon_drop);
    this.weapon_drop = CollectibleCodes[weapon_drop] ?? null;
    this.crystal_drop = "number" == options.crystal_drop ? options.crystal_drop : 0
  }

  update (data) {
    this.entityUpdate(data);
    this.code = data.code;
    let alien_type = alien_types.get(this.code);
    this.level = Math.min(data.level, alien_type.points.length - 1);
    this.points = "number" == typeof this.points ? this.points : alien_type.points[this.level];
  }

  toJSON () {
    return limitedJSON(this, ["x", "y", "request_id", "vx", "vy", "shield", "regen", "points", "damage", "laser_speed", "rate", "code", "level", "weapon_drop", "crystal_drop"])
  }
}

Object.defineProperties(Alien.prototype, {
  entity_type: {value: "alien"},
  inactive_field: {value: "killed"}
});

MassRename(Alien, ["x", "y", "vx", "vy", "shield", "regen", "damage", ["laserSpeed", "laser_speed"], "rate"]);

module.exports = Alien

'use strict';

const Entity = require("./Entity.js");
const CollectibleCodes = require("./Collectible.js").prototype.codes;
const MassRename = require("../utils/MassivePrototypeDefinition.js");
const limitedJSON = require("../utils/limitedJSON.js");

class Alien extends Entity {
  constructor(game, options) {
    super(game, "alien");
    if (null == options) options = {};
    this.x = null != options.x ? options.x : 0;
    this.y = null != options.y ? options.y : 0;
    this.vx = null != options.vx ? options.vx : 0;
    this.vy = null != options.vy ? options.vy : 0;
    this.code = null != options.code ? options.code : [...this.types.keys()][0];
    this.level = null != options.level ? options.level : 0;
    let weapon_drop = CollectibleCodes.indexOf(options.weapon_drop);
    this.weapon_drop = -1 != weapon_drop ? CollectibleCodes[weapon_drop] : null;
    this.crystal_drop = "number" == options.crystal_drop ? options.crystal_drop : 0
  }

  update (data) {
    this.entityUpdate(data);
    this.code = data.code;
    let alien_type = this.types.get(this.code);
    this.level = Math.max(data.level, alien_type.points.length - 1);
    this.points = "number" == this.points ? this.points : alien_type.points[this.level]
  }

  kill () {
    this.set({kill: true})
  }

  toJSON () {
    return limitedJSON(this, ["vx", "vy", "shield", "regen", "damage", "laser_speed", "rate", "code", "level", "weapon_drop", "crystal_drop"])
  }
}

Object.defineProperties(Alien.prototype, {
  entity_type: {value: "alien"},
  inactive_field: {value: "killed"}
});

Alien.prototype.types = new Map([
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

MassRename(Alien, ["shield", "regen", "damage", ["laserSpeed", "laser_speed"], "rate"]);

module.exports = Alien

'use strict';

const MassRename = require("../utils/MassivePrototypeDefinition.js");

class Entity {
  constructor (game, name, entityNotSettable) {
    this.game = game;
    this.custom = {}
    this.id = -1;
  }

  markAsInactive () {
    this[this.inactive_field] = true
  }

  isActive () {
    return !this[this.inactive_field]
  }

  set (data) {
    data = JSON.parse(JSON.stringify(data||{}));
    data.id = this.id;
    data.sx = data.vx;
    data.sy = data.vy;
    this.game.modding.api.name("set_"+this.entity_type).data(data).send();
    return this
  }

  entityUpdate (data) {
    this.x = data.x;
    this.y = data.y;
    this.vx = data.sx;
    this.vy = data.sy;
    this.last_updated = this.game.step
  }

  step () {
    this.x += this.vx;
    this.y += this.vy
  }
}

MassRename(Entity, ["x", "y"]);

module.exports = Entity

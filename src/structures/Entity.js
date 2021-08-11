'use strict';

const Structure = require("./Structure.js");
const MassRename = require("../utils/MassivePrototypeDefinition.js");

class Entity extends Structure{
  constructor (game) {
    this.game = game;
    this.custom = {}
    this.id = -1;
  }

  set (data) {
    data = Object.assign({}, data);
    data.id = this.id;
    data.sx = data.vx;
    data.sy = data.vy;
    this.game.modding.api.name("set_"+this.entity_type).data(data).send();
    return this
  }

  kill () {
    return this.set({kill: true})
  }

  entityUpdate (data) {
    this.x = data.x;
    this.y = data.y;
    this.vx = data.sx;
    this.vy = data.sy;
    this.lastUpdatedStep = this.game.step
  }

  step () {
    this.x += this.vx;
    this.y += this.vy
  }
}

MassRename(Entity, ["x", "y"]);

module.exports = Entity

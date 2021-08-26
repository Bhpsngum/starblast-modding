'use strict';

const Structure = require("./Structure.js");
const MassRename = require("../utils/MassivePrototypeDefinition.js");
const defineProperties = require("../utils/defineProperties.js");

class Entity extends Structure{
  constructor (game) {
    super(game);
    this.custom = {}
  }

  set (data) {
    data = Object.assign({}, data);
    data.id = this.id;
    data.sx = data.vx;
    data.sy = data.vy;
    this.game.modding.api.name("set_"+this.structure_type).data(data).send();
    return this
  }

  kill () {
    return this.set({kill: true})
  }

  entityUpdate (data) {
    if (this.isSpawned()) delete this.firstUpdate;
    else if (this.firstUpdate) {
      this.markAsSpawned();
      delete this.firstUpdate
    }
    else this.firstUpdate = true;
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

module.exports = Entity

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
    let _this = this.modding.data;
    _this.x = data.x;
    _this.y = data.y;
    _this.vx = data.sx;
    _this.vy = data.sy;
    _this.lastUpdatedStep = this.game.step
  }

  get x () {
    return this.modding.data.x
  }

  get y () {
    return this.modding.data.y
  }

  get vx () {
    return this.modding.data.vx
  }

  get vy () {
    return this.modding.data.vy
  }

  get lastUpdatedStep () {
    return this.modding.data.lastUpdatedStep
  }

  step () {
    let _this = this.modding.data;
    _this.x += _this.vx;
    _this.y += _this.vy
  }
}

module.exports = Entity

'use strict';

const StructureManager = require("./StructureManager.js");

class EntityManager extends StructureManager {
  constructor(game) {
    super(game);
    this.pending = [];
    this.all = [];
    this.request_id = 0;
  }

  add (data) {
    let entity = this.create(data);
    Object.defineProperty(entity, 'request_id', {value: this.request_id++});
    this.pending.push(entity);
    let rawEntity = JSON.parse(JSON.stringify(entity));
    Object.assign(rawEntity, {
      sx: rawEntity.vx,
      sy: rawEntity.vy
    });
    this.game.modding.api.name("add_"+this.manager_name).data(rawEntity).send()
  }

  push (...data) {
    return this.all.push(...data)
  }

  update (onTick = false) {
    let x = this.all.splice(0).filter(entity => this.isInstance(entity));
    this.push(...x);
    if (onTick) this.all.forEach(entity => entity.isActive() && entity.step());
    this.splice(0);
    Array.prototype.push.call(this, ...this.all.filter(entity => entity.isActive()))
  }
}

module.exports = EntityManager

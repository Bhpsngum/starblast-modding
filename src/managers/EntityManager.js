'use strict';

const StructureManager = require("./StructureManager.js");

class EntityManager extends StructureManager {
  constructor(game) {
    super(game);
    this.pending = [];
    this.request_id = 0;
  }

  add (data) {
    let entity = this.create(data);
    entity.request_id = this.request_id++;
    this.pending.push(entity);
    let rawEntity = JSON.parse(JSON.stringify(entity));
    Object.assign(rawEntity, {
      sx: rawEntity.vx,
      sy: rawEntity.vy
    });
    this.game.modding.api.name("add_"+this.manager_name).data(rawEntity).send()
  }

  update (onTick = false) {
    let x = this.all.splice(0).filter(entity => this.isInstance(entity));
    this.all.push(...x);
    if (onTick) this.all.forEach(entity => entity.isActive() && entity.step());
    this.splice(0);
    Array.prototype.push.call(this, ...this.all.filter(entity => entity.isActive()))
  }
}

module.exports = EntityManager

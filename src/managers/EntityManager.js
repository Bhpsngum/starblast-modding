'use strict';

class EntityManager extends Array {
  constructor(game) {
    super();
    this.all = [];
    this.pending = [];
    this.game = game;
    this.request_id = 0;
  }

  create (data) {
    return new this.EntityConstructor(this.game, data)
  }

  push (...data) {
    return this.all.push(...data)
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

  isInstance (entity) {
    return entity instanceof this.EntityConstructor
  }

  update (onTick = false) {
    let x = this.all.splice(0).filter(entity => this.isInstance(entity));
    this.all.push(...x);
    if (onTick) this.all.forEach(entity => entity.isActive() && entity.step());
    this.splice(0);
    Array.prototype.push.call(this, ...this.all.filter(entity => entity.isActive()))
  }

  find (id, includeInactive = false) {
    let value = includeInactive ? this.all : this;
    return Array.prototype.find.call(value, entity => entity instanceof this.EntityConstructor && entity.id === id)
  }
}

module.exports = EntityManager

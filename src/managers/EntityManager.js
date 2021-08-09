'use strict';

class EntityManager extends Array {
  constructor(game) {
    super();
    this.active = [];
    this.pending = [];
    this.game = game;
    this.request_id = 0;
  }

  create (data) {
    return new this.EntityConstructor(this.game, data)
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

  update (onTick) {
    if (onTick) this.active.forEach(entity => entity.step());
    this.active.splice(0);
    this.active.push(...this.filter(entity => entity.isActive()))
  }

  find (id, includeInactive) {
    let value = includeInactive ? this : this.active;
    return value.find(entity => entity.id === id)
  }
}

module.exports = EntityManager

'use strict';

class EntityManager extends Array {
  constructor(game) {
    super();
    this.active = [];
    this.pending = [];
    this.game = game;
    this.request_id = 0;
  }

  add (data) {
    data = data || {};
    data.request_id = request_id++;
    let entity = new this.EntityConstructor(this.game, data);
    this.pending.push(entity);
    this.game.modding.api.name("add_"+this.manager_name).data(data).send()
  }

  update (onTick) {
    this.active = this.filter(entity => !entity[this[inactiveField]])
  }

  find (id, includeInactive) {
    let value = includeInactive ? this : this.active;
    return value.find(entity => entity.id === id)
  }
}

module.exports = EntityManager

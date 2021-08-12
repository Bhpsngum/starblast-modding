'use strict';

class StructureManager extends Array {
  constructor(game) {
    super();
    this.game = game;
    this.all = [];
  }

  create (data) {
    return new this.EntityConstructor(this.game, data)
  }

  isInstance (entity) {
    return entity instanceof this.EntityConstructor
  }

  insert (...data) {
    this.all.push(...data);
    this.update()
  }

  findById (id, includeInactive = false) {
    let value = includeInactive ? this.all : this;
    return value.find(entity => this.isInstance(entity) && Object.is(entity.id, id)) ?? null
  }

  reset () {
    this.splice(0);
    (this.all||[]).splice(0)
  }
}

module.exports = StructureManager

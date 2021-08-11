'use strict';

class StructureManager extends Array {
  constructor(game) {
    super();
    this.all = [];
    this.game = game;
  }

  create (data) {
    return new this.EntityConstructor(this.game, data)
  }

  push (...data) {
    return this.all.push(...data)
  }

  isInstance (entity) {
    return entity instanceof this.EntityConstructor
  }

  findById (id, includeInactive = false) {
    let value = includeInactive ? this.all : this;
    return value.find(entity => this.isInstance(entity) && Object.is(entity.id, id))
  }

  reset () {
    this.splice(0);
    this.all.splice(0)
  }
}

module.exports = StructureManager

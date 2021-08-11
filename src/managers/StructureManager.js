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

  find (id, includeInactive = false) {
    let value = includeInactive ? this.all : this;
    return Array.prototype.find.call(value, entity => entity instanceof this.EntityConstructor && entity.id === id)
  }

  reset () {
    this.splice(0);
    this.all.splice(0)
  }
}

module.exports = StructureManager

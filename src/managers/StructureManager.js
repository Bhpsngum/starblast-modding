'use strict';

const defineProperties = require("../utils/defineProperties.js");

class StructureManager extends Array {
  constructor(game) {
    super();
    defineProperties(this, {
      game,
      all: []
    })
  }

  create (data, ...additionalValues) {
    return new this.StructureConstructor(this.game, data, ...additionalValues)
  }

  isInstance (entity) {
    return entity instanceof this.StructureConstructor
  }

  insert (...data) {
    for (let option of data) {
      let p = this.isInstance(option) ? option : this.create(option);
      this.all.push(p)
    }
    this.update()
  }

  findById (id, includeInactive = false) {
    let value = includeInactive ? this.all : this;
    return value.find(entity => this.isInstance(entity) && Object.is(entity.id, id)) ?? null
  }

  filterList () {
    let x = this.all.splice(0).filter(structure => this.isInstance(structure));
    this.all.push(...x);
    return this
  }
}

module.exports = StructureManager

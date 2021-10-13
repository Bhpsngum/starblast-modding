'use strict';

const defineProperties = require("../utils/defineProperties.js");
const Structure = require("../structures/Structure.js");

class StructureManager extends Map {
  constructor(game) {
    super();
    defineProperties(this, {
      game,
      all: new Map()
    })
  }

  array (includeInactive = false) {
    let value = includeInactive ? this.all : this;
    return [...value.entries()].map(structure => structure[1])
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
      this.all.set(p.uuid, p)
    }
    this.update()
  }

  findById (id, includeInactive = false) {
    this.update();
    return this.array(includeInactive).find(entity => Object.is(entity.id, id)) ?? null
  }

  filterList () {
    let x = this.array(true).filter(structure => this.isInstance(structure));
    this.all.clear();
    x.forEach(structure => this.all.set(structure.uuid, structure));
    return this
  }

  _MapSet (key, value) {
    return Map.prototype.set.call(this, key, value)
  }

  [Symbol.toStringTag] = 'StructureManager'
}

StructureManager.prototype.StructureConstructor = Structure;

module.exports = StructureManager

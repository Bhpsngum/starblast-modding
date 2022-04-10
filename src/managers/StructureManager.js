'use strict';

const defineProperties = require("../utils/defineProperties.js");
const Structure = require("../structures/Structure.js");
const ArrayMap = require("../utils/ArrayMap.js");

/**
 * The Station Module Manager Instance.
 * @extends {ArrayMap}
 * @param {ModdingClient} game - The <code>ModdingClient</code> object
 */

class StructureManager extends ArrayMap {
  constructor(game) {
    super();
    this.#game = game;
    /**
     * A collection containing all structures of the ship
     * @type {ArrayMap}
     * @name StructureManager.prototype.all
     * @readonly
     */
    defineProperties(this, {
      all: new ArrayMap()
    })
  }

  #game;

  /**
   * converts the list to array
   * @param {boolean} includeInactive - the converted array will contain inactive structures (destroyed, disconnected) or not
   * @returns {Array}
   */

  array (includeInactive = false) {
    let value = includeInactive ? this.all : this;
    return value.toArray()
  }

  create (data, ...additionalValues) {
    return new this.StructureConstructor(this.#game, data, ...additionalValues)
  }

  /**
   * To check whether the given object has the same instance as the structure's constructor or not
   * @param {object} - The object needs to be checked
   * @returns {boolean}
   */

  isInstance (entity) {
    return entity instanceof this.StructureConstructor
  }

  insert (...data) {
    for (let option of data) {
      let p = this.isInstance(option) ? option : this.create(option);
      this.all._UUIDset(p)
    }
    this.update()
  }

  /**
   * Find a structure inside the manager with the given ID
   * @param {number} - The Structure ID to be search for
   * @param {includeInactive} - To show whether it needs to search through inactive structures or not, default <code>false</code>
   * @returns {Structure} The structure, <code>null</code> if not found any
   */

  findById (id, includeInactive = false) {
    this.update();
    return this.array(includeInactive).find(entity => Object.is(entity.id, id)) ?? null
  }

  filterList () {
    let x = this.array(true).filter(structure => this.isInstance(structure));
    this.all.clear();
    x.forEach(structure => this.all._UUIDset(structure));
    return this
  }

  /**
   * Check whether the number of structures inside this manager exceeds the server limit or not
   * @returns {boolean}
   */

  limitReached () {
    return this.array(true).filter(structure => {
      structure.isActive();
      return !structure[structure.inactive_field]
    }).length >= this.limit
  }

  /**
   * The server limit (maximum number of structures) of this manager
   * @returns {boolean}
   */

  get limit () {
    return Infinity
  }

  [Symbol.toStringTag] = 'StructureManager'
}

StructureManager.prototype.StructureConstructor = Structure;

module.exports = StructureManager

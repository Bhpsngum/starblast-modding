'use strict';

const StructureManager = require("./StructureManager.js");
const defineProperties = require("../utils/defineProperties.js");

/**
 * The Entity Manager Instance.
 * @extends {StructureManager}
 * @param {ModdingClient} game - The <code>ModdingClient</code> object
 * @abstract
 */

class EntityManager extends StructureManager {
  constructor(game) {
    super(game);
    this.#game = game;
  }

  #game;

  /**
   * Add a new entity to the game
   * @param {object} data - entity creation options
   * @returns {Promise<Entity>}
   */

  add (data) {
    let entity = this.create(data);
    defineProperties(entity, {request_id: entity.uuid});
    this.insert(entity);
    let rawEntity = JSON.parse(JSON.stringify(entity));
    Object.assign(rawEntity, {
      sx: rawEntity.vx,
      sy: rawEntity.vy
    });
    return new Promise(function(resolve, reject){
      this.#game.modding.handlers.create.set(entity.uuid, {resolve, reject});
      this.#game.modding.api.name("add_"+this.manager_name).data(rawEntity).send(entity.uuid, "create")
    }.bind(this))
  }

  /**
   * Set options to an entity based on ID
   * @param {number} id - The entity's ID
   * @param {object} data - Options to be set on the entity
   * @returns {Entity}
   */

  setById (id, data) {
    let entity = this.findById(id);
    if (entity == null) {
      entity = this.create(data);
      entity.id = id
    }
    return entity.set(data)
  }

  /**
   * Set options to an entity
   * @param {object} data - Options to be set on the entity including the entity ID itself
   * @returns {Entity}
   */

  set (data) {
    return this.setById(data?.id, data)
  }

  /**
   * Kill an entity based on ID
   * @param {number} id - The entity's ID needs to be killed
   * @returns {Entity}
   */

  kill (id) {
    return this.setById(id, {kill: true})
  }

  update () {
    this.filterList().all.forEach(entity => entity.isActive() && entity.lastUpdatedStep + 90 < this.#game.step && entity.markAsInactive());
    this.clear();
    this.all.forEach(entity => entity.isActive() && this._UUIDset(entity));
    return this
  }

  [Symbol.toStringTag] = 'EntityManager'
}

module.exports = EntityManager

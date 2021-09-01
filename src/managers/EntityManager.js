'use strict';

const StructureManager = require("./StructureManager.js");
const defineProperties = require("../utils/defineProperties.js");

class EntityManager extends StructureManager {
  constructor(game) {
    super(game)
  }

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
      this.game.modding.handlers.create.set(entity.uuid, {resolve, reject});
      this.game.modding.api.name("add_"+this.manager_name).data(rawEntity).send(entity.uuid, "create")
    }.bind(this))
  }

  setById (id, data) {
    let entity = this.findById(id);
    if (entity == null) {
      entity = this.create(data);
      entity.id = id
    }
    entity.set(data)
  }

  set (data) {
    this.set(data?.id, data)
  }

  update (onTick = false) {
    this.filterList().forEach(entity => {
      if (entity.isActive()) {
        if (onTick) entity.step();
        if (entity.lastUpdatedStep + 90 < this.game.step) entity.markAsInactive()
      }
    });
    this.splice(0);
    this.push(...this.all.filter(entity => entity.isActive()));
    return this
  }
}

module.exports = EntityManager

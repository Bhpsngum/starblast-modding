'use strict';

const StructureManager = require("./StructureManager.js");
const defineProperties = require("../utils/defineProperties.js");

class EntityManager extends StructureManager {
  constructor(game) {
    super(game)
  }

  add (data) {
    let entity = this.create(data);
    defineProperties(entity, {request_id: [this.manager_name, Math.max(this.game.step, 0), this.game.modding.api.request_id++].join("-")});
    this.insert(entity);
    let rawEntity = JSON.parse(JSON.stringify(entity));
    Object.assign(rawEntity, {
      sx: rawEntity.vx,
      sy: rawEntity.vy
    });
    this.game.modding.api.name("add_"+this.manager_name).data(rawEntity).send()
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

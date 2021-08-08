class EntityManager extends Array {
  constructor(game, name, inactiveField, entityNotCreateable) {
    super();
    Object.defineProperties(this, {
      managerName: {value: name},
      inactiveField: {value: inactiveField || "killed"},
      entity: {value: require("../structures/"+name[0].toUpperCase()+name.slice(1)+".js")},
      entityNotCreateable: {value: !!entityNotCreateable}
    });
    this.game = game;
    this.request_id = 0;
    this.pending = [];
    this.update()
  }
}

Entity.prototype.add = function (data) {
  if (!this.entityNotCreateable) {
    data = data || {};
    data.request_id = this.request_id++;
    let entity = new this.entity(this.game, data);
    this.pending.push(entity);
    this.game.modding.api.name("add_"+this.managerName).data(data).send()
  }
}

EntityManager.prototype.update = function(onTick) {
  this.active = this.filter(entity => !entity[this.inactiveField])
}

EntityManager.prototype.find = function (id, includeInactive) {
  let value = includeInactive ? this : this.active;
  return value.find(entity => entity.id === id)
}

module.exports = EntityManager

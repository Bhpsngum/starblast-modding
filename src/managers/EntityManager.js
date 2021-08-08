class EntityManager extends Array {
  constructor(name, inactiveField) {
    super();
    Object.defineProperties(this, {
      managerName: {value: name},
      inactiveField: {value: inactiveField || "killed"}
    })
    this.update()
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

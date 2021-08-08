class EntityManager extends Array {
  constructor(game, name, inactiveField, entityNotCreateable) {
    super();
    let request_id = 0;
    Object.defineProperties(this, {
      inactiveField: {value: inactiveField || "killed"},
      EntityConstructor: {value: require("../structures/"+name[0].toUpperCase()+name.slice(1)+".js")}
    });
    if (!entityNotCreateable) {
      this.add = function (data) {
        data = data || {};
        data.request_id = request_id++;
        let entity = new this.EntityConstructor(this.game, data);
        this.pending.push(entity);
        this.game.modding.api.name("add_"+name).data(data).send()
      }
      this.pending = []
    }
    this.active = [];
    this.game = game;
  }

  update (onTick) {
    this.active = this.filter(entity => !entity[this[inactiveField]])
  }

  find (id, includeInactive) {
    let value = includeInactive ? this : this.active;
    return value.find(entity => entity.id === id)
  }
}

module.exports = EntityManager

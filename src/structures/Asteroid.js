const Entity = require("./Entity.js");
const MassRename = require("../utils/MassivePrototypeDefinition.js");

class Asteroid extends Entity {
  constructor(game, options) {
    super(game);
    if (null == options) options = {}
    this.size = null != options.size ? options.size : 30;
    this.x = null != options.x ? options.x : 0;
    this.y = null != options.y ? options.y : 0;
    this.vx = null != options.vx ? options.vx : 0;
    this.vy = null != options.vy ? options.vy : 0
  }
}

Object.defineProperty(Asteroid.prototype, 'entityType', {
  value: "asteroid"
});

Asteroid.prototype.update = function (data) {
  this.entityUpdate(data);
  this.size = data.size
}

MassRename(Asteroid, ["size"]);

module.exports = Asteroid

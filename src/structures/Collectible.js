const Entity = require("./Entity.js");

class Collectible extends Entity {
  constructor(game, options) {
    super(game);
    if (null == options) options = {};
    this.code = null != options.code ? options.code : this.codes[0];
    this.x = null != options.x ? options.x : 0;
    this.y = null != options.y ? options.y : 0
  }
}

Collectible.prototype.codes = [10, 11, 12, 20, 21, 40, 41, 42, 90, 91];

module.exports = Collectible

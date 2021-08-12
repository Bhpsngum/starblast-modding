'use strict';

const Structure = require("./Structure.js");
const Coordinate = require("./Coordinate.js");
const getObjectShapeFromURL = require("../utils/getObjectShapeFromURL.js");
const limitedJSON = require("../utils/limitedJSON.js");
const MassRename = require("../utils/MassivePrototypeDefinition.js");
const toString = require("../utils/toString.js");

class Object3D extends Structure {
  constructor (game, options) {
    super(game);
    options = Object.assign({}, options);
    Object.defineProperty(this, 'id', {value: toString(options.id)});
    this.assign(options, true)
  }

  assign(options, forceAssign = false) {
    options = Object.assign({}, options);
    if (forceAssign || options.type != null) {
      let objTypeManager = this.game.objects.types;
      let type = objTypeManager.findById(toString(options.type.id), true);
      if (type == null) {
        type = objTypeManager.create(options.type);
        objTypeManager.insert(type)
      }
      this.type = type
    }
    if (forceAssign || options.position != null) this.position = new Coordinate(options.position);
    if (forceAssign || options.rotation != null) this.rotation = new Coordinate(options.rotation);
    if (forceAssign || options.scale != null) this.scale = new Coordinate(options.scale);
  }

  set (data) {
    this.assign(data);
    let send = function () {
      this.game.modding.api.name("set_server_object").data(this).send().globalMessage("set_object", {object: this}).send()
    }.bind(this)
    if (this.type.physics.autoShape === true && this.type.physics.shape == null) this.type.getShape().then(shape => (this.physics.shape == shape, send())).catch(send);
    else send();
    return this
  }

  remove () {
    this.game.modding.api.name("remove_server_object").prop("id", this.id).send().globalMessage("remove_object").send();
    this.markAsInactive();
    this.game.objects.update();
    return this
  }

  toJSON () {
    return limitedJSON(this, ["id", "type", "position", "rotation", "scale"])
  }
}

Object.defineProperties(Object3D.prototype, {
  entity_type: {value: "object"},
  inactive_field: {value: "removed"}
});

MassRename(Object3D, ["type", "position", "rotation", "scale"]);

module.exports = Object3D

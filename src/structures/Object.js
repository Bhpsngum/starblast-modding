'use strict';

const Structure = require("./Structure.js");
const Coordinate = require("./Coordinate.js");
const getObjectShapeFromURL = require("../utils/getObjectShapeFromURL.js");
const limitedJSON = require("../utils/limitedJSON.js");
const MassRename = require("../utils/MassivePrototypeDefinition.js");
const toString = require("../utils/toString.js");
const defineProperties = require("../utils/defineProperties.js");

/**
 * The Object3D Instance
 * @extends {Structure}
 * @param {ModdingClient} game - The <code>ModdingClient</code> object
 * @param {object} options - Instance options
 */

class Object3D extends Structure {
  constructor (game, options) {
    super(game);
    this.#game = game;

    /**
    * Object ID
    * @name Object3D.prototype.id
    * @type {string}
    * @readonly
    */

    defineProperties(this, {id: toString(options?.id)});
    Object.defineProperties(this, {
      [this.inactive_field]: {
        get () { return this.modding.data[this.inactive_field]}
      },
      [this.inactive_field + "Step"]: {
        get () { return this.modding.data[this.inactive_field + "Step"]}
      }
    })
    this.assign(options, true)
  }

  #game;

  markAsActive () {
    let _this = this.modding.data;
    _this[this.inactive_field] = false;
    delete _this[this.inactive_field + "Step"]
  }

  markAsInactive () {
    let _this = this.modding.data;
    _this[this.inactive_field] = true
    _this[this.inactive_field + "Step"] = this.#game.step
  }

  assign(options, forceAssign = false) {
    let _this = this.modding.data;
    if (forceAssign || options?.type != null) {
      let objTypeManager = this.#game.objects.types;
      let objType = objTypeManager.create(options?.type);
      let type = objTypeManager.findById(objType.id, true);
      if (type == null) {
        type = objType;
        objTypeManager.insert(type)
      }
      _this.type = type
    }
    if (forceAssign || options?.position != null) _this.position = new Coordinate(options?.position);
    if (forceAssign || options?.rotation != null) _this.rotation = new Coordinate(options?.rotation);
    if (forceAssign || options?.scale != null) _this.scale = new Coordinate(options?.scale);
  }

  set (data) {
    this.assign(data);
    let send = function () {
      this.#game.modding.api.name("set_server_object").data(this).send().globalMessage("set_object", {object: this}).send()
    }.bind(this);
    if (this.type.physics.autoShape && this.type.physics.shape == null) this.type.getShape()
    .then(shape => (defineProperties(this.type.physics, {shape}), send()))
    .catch(e => (defineProperties(this.type.physics, {shape: []}), send()));
    else send()
    this.markAsActive();
    this.#game.objects.update();
    return this
  }

  /**
   * Remove the object from the game
   * @returns {Object3D}
   */

  remove () {
    this.#game.modding.api.name("remove_server_object").prop("id", this.id).send().globalMessage("remove_object", {id: this.id}).send();
    this.markAsInactive();
    this.#game.objects.update();
    return this
  }

  /**
  * Object type
  * @name Structure.prototype.type
  * @type {ObjectType}
  * @readonly
  */

  get type () {
    return this.modding.data.type
  }

  /**
  * Object position
  * @type {Coordinate}
  * @readonly
  */

  get position () {
    return this.modding.data.position
  }

  /**
  * Object rotation
  * @name Structure.prototype.rotation
  * @type {Coordinate}
  * @readonly
  */

  get rotation () {
    return this.modding.data.rotation
  }

  /**
  * Object scale
  * @name Structure.prototype.scale
  * @type {Coordinate}
  * @readonly
  */

  get scale () {
    return this.modding.data.scale
  }

  toJSON () {
    return limitedJSON(this, ["id", "type", "position", "rotation", "scale"])
  }
}

defineProperties(Object3D.prototype, {
  structure_type: "object",
  inactive_field: "removed"
});

MassRename(Object3D, ["type", "position", "rotation", "scale"]);

module.exports = Object3D

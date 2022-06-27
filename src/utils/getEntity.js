'use strict';

const defineProperties = require("./defineProperties.js");

module.exports = function (game, data, manager, ...additionalValues) {
  let entity = manager.findById(data?.id, true);
  if (entity == null) {
    entity = manager.create(Object.assign({}, data, entity), ...additionalValues);
    defineProperties(entity, {
      id: data?.id,
      createdStep: Math.max(game.timer.step, 0)
    });
    entity.modding.data.lastUpdatedStep = Math.max(game.timer.step, 0);
    manager.insert(entity)
  }
  return entity
}

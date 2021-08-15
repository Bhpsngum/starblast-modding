'use strict';

module.exports = function (data, manager, ignoreSpawned, ...additionalValues) {
  let entity = manager.findById((data||{}).id, true);
  if (entity == null) {
    entity = manager.create.call(manager, Object.assign({}, data, entity), ...additionalValues);
    Object.defineProperties(entity, {
      id: {value: (data||{}).id},
      createdStep: {value: Math.max(manager.game.step, 0)}
    });
    entity.lastUpdatedStep = Math.max(manager.game.step, 0);
    manager.insert(entity)
  }
  return entity
}

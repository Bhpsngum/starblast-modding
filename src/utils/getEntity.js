'use strict';

module.exports = function (data, manager, ignoreSpawned) {
  let entity = manager.findById((data||{}).id, true);
  if (entity) return entity;
  entity = manager.create(Object.assign({}, data, entity));
  Object.defineProperties(entity, {
    id: {value: (data||{}).id},
    createdStep: {value: Math.max(manager.game.step, 0)}
  });
  if (!ignoreSpawned && !entity.spawned) Object.defineProperty(entity, 'spawned', {value: true});
  entity.lastUpdatedStep = Math.max(manager.game.step, 0);
  manager.insert(entity);
  return entity
}

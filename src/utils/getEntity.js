'use strict';

module.exports = function (data, manager) {
  let entity = manager.findById((data||{}).id, true);
  if (entity) return entity;
  entity = manager.create(Object.assign({}, data, entity));
  Object.defineProperties(entity, {
    id: {value: (data||{}).id},
    createdStep: {value: manager.game.step}
  });
  manager.insert(entity);
  return entity
}

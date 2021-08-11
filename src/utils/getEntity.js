'use strict';

module.exports = function (data, manager) {
  let entity = manager.find((data||{}).id, true);
  if (entity) return entity;
  entity = manager.create(Object.assign({}, data, entity));
  Object.defineProperties(entity, {
    id: {value: (data||{}).id},
    createdStep: {value: manager.game.step}
  });
  manager.push(entity);
  return entity
}

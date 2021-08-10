module.exports = function (data, manager) {
  let entity = manager.find((data||{}).id, true);
  if (entity) return entity;
  entity = manager.create(Object.assign({}, data, entity));
  Object.defineProperty(entity, 'id', {value: (data||{}).id});
  manager.push(entity);
  return entity
}

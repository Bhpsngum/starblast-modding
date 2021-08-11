'use strict';

module.exports = function (obj, properties) {
  return properties.concat("x","y","request_id").reduce((a,b)=>(a[b]=obj[b],a),{})
}

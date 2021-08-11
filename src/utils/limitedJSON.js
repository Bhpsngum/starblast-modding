'use strict';

module.exports = function (obj, properties) {
  return ["id", ...properties].reduce((a,b)=>(a[b]=obj[b],a),{})
}

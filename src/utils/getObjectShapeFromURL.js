// https://github.com/Bhpsngum/starblast/blob/master/getObjectShapeFromURL.js
'use strict';

const THREE = require("three");
const OBJLoader = require("three-obj-loader");
OBJLoader(THREE);
THREE.OBJLoader.prototype.load = function load(url, onLoad, onProgress, onError) {

  var scope = this;
  this.onError = onError || defaultOnError;

  var loader = new THREE.FileLoader(scope.manager);
  loader.setPath(this.path);
  loader.load(url, function (text) {

    onLoad(scope.parse(text, false));
  }, onProgress, onError);
}
global.XMLHttpRequest = require("xhr2");

var gF = function(f) {
  return typeof f == "function"?f:function(){}
}

var shapePoint = function(e, t, i) {
  var s, o, l;
  return l = i.length, s = Math.atan2(t, -e), s = Math.round((s + 2 * Math.PI) / (2 * Math.PI) * l) % l, o = Math.sqrt(e * e + t * t), i[s] = Math.max(i[s], o)
}

var getShape = function(obj,e) {
  obj = new THREE.Geometry().fromBufferGeometry(obj.geometry);
  var t, i, s, o, l, n, r, a, h, p, c, d, u, f, g, m, y, x;
  for (null == e && (e = 50), u = [], s = l = 0, p = e - 1; 0 <= p ? l <= p : l >= p; s = 0 <= p ? ++l : --l) u[s] = 0;
  for (c = obj.faces, n = 0, r = c.length; n < r; n++)
  for (i = c[n], f = obj.vertices[i.a], g = obj.vertices[i.b], m = obj.vertices[i.c], s = a = 0; a <= 99; s = a += 1) t = s / 100, y = f.x * t + g.x * (1 - t), x = f.y * t + g.y * (1 - t), shapePoint(y, x, u), y = m.x * t + g.x * (1 - t), x = m.y * t + g.y * (1 - t), shapePoint(y, x, u), y = m.x * t + f.x * (1 - t), x = m.y * t + f.y * (1 - t), shapePoint(y, x, u);
  return u.map(i=>parseFloat(i.toFixed(3)))
}

module.exports = function(url) {
  return new Promise(function (resolve, reject) {
    try {
      new THREE.OBJLoader().load(url, function (object) {
        let result, st;
        try { result = getShape(object.children[0]) } catch(e) { reject(new Error("Invalid 3D Object")); st = 1 }
        if (!st) resolve(result)
      },gF(),reject)
    }
    catch (e) {reject(e)}
  })
}

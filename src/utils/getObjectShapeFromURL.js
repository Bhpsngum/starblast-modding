'use strict';

const URLFetcher = require("./URLFetcher.js");
let THREE;

var shapePoint = function(e, t, i) {
	var s, o, l;
	return l = i.length, s = Math.atan2(t, -e), s = Math.round((s + 2 * Math.PI) / (2 * Math.PI) * l) % l, o = Math.sqrt(e * e + t * t), i[s] = Math.max(i[s], o)
}

var getShape = function(obj,e) {
	obj = obj.geometry;
	let vertices = Array.from(obj.attributes.position.array);
	obj.vertices = [];
	while (vertices.length > 0) {
		obj.vertices.push({
			x: vertices[0],
			y: vertices[1],
			z: vertices[2]
		});
		vertices.splice(0, 3)
	}
	let faces = obj.index == null ? [...Array(obj.vertices.length)].map((j, i) => i) : Array.from(obj.index.array);
	obj.faces = [];
	while (faces.length > 0) {
		obj.faces.push({
			a: faces[0],
			b: faces[1],
			c: faces[2]
		});
		faces.splice(0, 3)
	}
	var t, i, s, o, l, n, r, a, h, p, c, d, u, f, g, m, y, x;
	for (null == e && (e = 50), u = [], s = l = 0, p = e - 1; 0 <= p ? l <= p : l >= p; s = 0 <= p ? ++l : --l) u[s] = 0;
	for (c = obj.faces, n = 0, r = c.length; n < r; n++)
		for (i = c[n], f = obj.vertices[i.a], g = obj.vertices[i.b], m = obj.vertices[i.c], s = a = 0; a <= 99; s = a += 1) t = s / 100, y = f.x * t + g.x * (1 - t), x = f.y * t + g.y * (1 - t), shapePoint(y, x, u), y = m.x * t + g.x * (1 - t), x = m.y * t + g.y * (1 - t), shapePoint(y, x, u), y = m.x * t + f.x * (1 - t), x = m.y * t + f.y * (1 - t), shapePoint(y, x, u);
	return u.map(i=>parseFloat(i.toFixed(3)))
}

const getObjectShapeFromURL = async function getObjectShapeFromURL (url) {
	if (!THREE) THREE = await import('three/addons/loaders/OBJLoader.js');
	try {
		return getShape((new THREE.OBJLoader()).parse(await URLFetcher(url)).children[0]);
	}
	catch (e) {
		throw new Error("Invalid 3D Object");
	}
}

module.exports = getObjectShapeFromURL
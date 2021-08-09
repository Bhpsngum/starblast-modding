const PrivateServerFinder = require("./PrivateServerFinder.js");
const EventManager = require("../managers/EventManager.js");
const getToken = require("./getToken.js");

module.exports = async function(obj) {
  let address = await PrivateServerFinder(obj.region);
  return await EventManager.create(obj, address, await getToken(address, obj.ECPKey))
}

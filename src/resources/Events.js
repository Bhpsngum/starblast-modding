'use strict';

module.exports = function() {
  let obj = {}, EVENTS = {
    // General Modding events
    MOD_STARTED: "start",
    ERROR: "error",
    TICK: "tick",
    MOD_STOPPED: "stop",
    // Ship events
    SHIP_RESPAWNED: "shipRespawn",
    SHIP_SPAWNED: "shipSpawn",
    SHIP_DESTROYED: "shipDestroy",
    SHIP_DISCONNECTED: "shipDisconnect",
    UI_COMPONENT_CLICKED: "UIComponentClick",
    // Alien events
    ALIEN_CREATED: "alienCreate",
    ALIEN_DESTROYED: "alienDestroy",
    // Asteroid events
    ASTEROID_CREATED: "asteroidCreate",
    ASTEROID_DESTROYED: "asteroidDestroy",
    // Collectible events
    COLLECTIBLE_CREATED: "collectibleCreate",
    COLLECTIBLE_PICKED: "collectiblePick"
  }
  for (let key in EVENTS) Object.defineProperty(obj, key, {value: EVENTS[key]});
  return obj
}

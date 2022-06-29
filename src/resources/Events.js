'use strict';

let EVENTS = {
  // General Modding events
  /**
    * Fires when the game is about to start
    * @event ModdingClient#start
    * @param {string} link - The link to the created game
    * @param {object} options - The current game options from server
    */
  MOD_STARTED: "start",
  /**
    * Fires when there is error message from server (and sometimes client, use <code>ModdingClient.prototype.error</code> to do so)
    * @event ModdingClient#error
    * @param {Error} error - The <code>Error</code> object
    */
  ERROR: "error",
  /**
    * Fires after each evocation of <code>ModdingClient.prototype.log</code>
    * @event ModdingClient#log
    * @param {...string} messages - The messages
    */
  LOG: "log",
  /**
    * Fires each tick, similar to <code>this.tick</code> in browser modding
    * @event ModdingClient#tick
    * @param {number} step - Game step
    */
  TICK: "tick",
  /**
    * Fires when the mod stops
    * @event ModdingClient#stop
    */
  MOD_STOPPED: "stop",
  // Ship events
  /**
    * Fires when a ship respawns
    * @event ModdingClient#shipRespawn
    * @param {Ship} ship - The ship object
    */
  SHIP_RESPAWNED: "shipRespawn",
  /**
    * Fires when a ship spawns (available in unspecified root mode only)
    * @event ModdingClient#shipSpawn
    * @param {Ship} ship - The ship object
    */
  SHIP_SPAWNED: "shipSpawn",
  /**
    * Fires when a ship is destroyed (available in unspecified root mode only)
    * @event ModdingClient#shipDestroy
    * @param {Ship} ship - The ship object
    * @param {Ship} killer - The killer ship object or <code>null</code>
    */
  SHIP_DESTROYED: "shipDestroy",
  /**
    * Fires when a ship is disconnected
    * @event ModdingClient#shipDisconnect
    * @param {Ship} ship - The ship object
    */
  SHIP_DISCONNECTED: "shipDisconnect",
  /**
    * Fires when a ship clicks an UIComponent
    * @event ModdingClient#UIComponentClick
    * @param {string} id - The UIComponent's ID
    * @param {Ship} ship - The ship object
    */
  UI_COMPONENT_CLICKED: "UIComponentClick",
  // Alien events
  /**
    * Fires when an alien is created
    * @event ModdingClient#alienCreate
    * @param {Alien} alien - The alien object
    */
  ALIEN_CREATED: "alienCreate",
  /**
    * Fires when an alien is destroyed
    * @event ModdingClient#alienDestroy
    * @param {Alien} alien - The alien object
    * @param {Ship} killer - The killer ship object or <code>null</code>
    */
  ALIEN_DESTROYED: "alienDestroy",
  // Asteroid events
  /**
    * Fires when an asteroid is created
    * @event ModdingClient#asteroidCreate
    * @param {Asteroid} asteroid - The asteroid object
    */
  ASTEROID_CREATED: "asteroidCreate",
  /**
    * Fires when an asteroid is destroyed
    * @event ModdingClient#asteroidDestroy
    * @param {Asteroid} asteroid - The asteroid object
    * @param {Ship} killer - The killer ship object or <code>null</code>
    */
  ASTEROID_DESTROYED: "asteroidDestroy",
  // Collectible events
  /**
    * Fires when a collectible is created
    * @event ModdingClient#collectibleCreate
    * @param {Collectible} collectible - The collectible object
    */
  COLLECTIBLE_CREATED: "collectibleCreate",
  /**
    * Fires when a collectible is picked
    * @event ModdingClient#collectiblePick
    * @param {Collectible} collectible - The collectible object
    * @param {Ship} ship - The ship that picked the collectible
    */
  COLLECTIBLE_PICKED: "collectiblePick",
  // Station events
  /**
    * Fires when a station is destroyed
    * @event ModdingClient#stationDestroy
    * @param {Station} station - The station object
    */
  STATION_DESTROYED: "stationDestroy",
  // Station module events
  /**
    * Fires when a station module is destroyed
    * @event ModdingClient#stationModuleDestroy
    * @param {StationModule} station_module - The station module object
    */
  STATION_MODULE_DESTROYED: "stationModuleDestroy",
  /**
    * Fires when a station module is repaired
    * @event ModdingClient#stationModuleRepair
    * @param {StationModule} station_module - The station module object
    */
  STATION_MODULE_REPAIRED: "stationModuleRepair"
}

module.exports = Object.freeze(EVENTS)

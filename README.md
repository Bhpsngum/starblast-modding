<div align="center">
  <br />
  <p>
    <a href="https://bhpsngum.github.io/starblast/starblast-modding/"><img src="https://bhpsngum.github.io/starblast/starblast-modding/banner.png" width="640" alt="starblast-modding" /></a>
  </p>
</div>

## A Brief Profile
**starblast-modding** is the JavaScript library for hosting modded Starblast games on NodeJS.
* Introducing OOP (Object-Oriented Programming) into Starblast Modding
* Provides a new way to approach Starblast Modding rather than the old format used in [the browser](https://starblast.io/modding.html)
* Includes new features and events that doesn't exist in the original Modding
* Regularly updates to catch up with latest Starblast server updates and bugs fixes

## Credits
* Thanks Caramel#8789 for making the banner for this npm.

## Installation
**Node.js >= 16.6.0 and NPM >= 6.0.0 are required.**

```
npm install starblast-modding
yarn add starblast-modding
pnpm add starblast-modding
```

## Documentation
Please see [this link](https://bhpsngum.github.io/starblast/starblast-modding/)

## Example
This is an example on how to run a team-mode modded game:
```js
const StarblastModding = require("starblast-modding");

global.game = new StarblastModding.Client({
  cacheECPKey: true,
  cacheEvents: false,
  cacheOptions: true
});

game.setRegion("Asia");

game.setECPKey("12345-67890");

game.setOptions({
  map_name: "Test"
});

game.aliens.add();
game.start({
  region: "Asia",
  ECPKey: "09876-54321",
  options: {
    //map_size: 20,
    custom_map: "",
    root_mode: "team",
    friendly_colors: 5,
    radar_zoom: 1,
    station_size: 3
  }
}).then(function (link, options) {
  console.log("Promise fulfilled: " + link);
  game.log(link);
}).catch(function (error) {
  console.log("Promise rejected: " + error.message)
});

game.on('error', function(error) {
  console.log("In-game error: " + error.message);
  // Invalid laser rate....
});

game.on('log', function(...args) {
  console.log("In-game log:", ...args);
  // Custom game log goes here
})

game.on('start', function(link, options) {
  console.log("Mod started with link: "+ link);
});

game.on('tick', function (step) {
  if (game.step % 30 == 0) for (let ship of game.ships) {
    ship.set({invulnerable: 120});
    ship.setCrystals(120).setGenerator(300).setHealing(true)
  }
});

game.on('shipRespawn', function(ship) {
  ship.setX(0).setY(0);
  console.log("Ship respawn: "+ship.name);
  console.log("Event: "+game.step);
});
game.on('shipSpawn', function(ship) {
  ship.setX(0).setY(0);
  console.log("Ship spawn: "+ship.name);
});
game.on('shipDestroy', function(ship, killer) {

});
game.on('shipDisconnect', function(ship) {

});

game.on('alienCreate', function(alien) {
  console.log("Alien created")
});
game.on('alienDestroy', function(alien, killer) {

});

game.on('asteroidCreate', function(asteroid) {

});
game.on('asteroidDestroy', function(asteroid, killer) {

});

game.on('collectibleCreate', function(asteroid) {

});

game.on('collectiblePick', function(asteroid, ship) {

});

game.on('stationDestroy', function(station) {
  console.log("Destroyed:", station)
});

game.on('stationModuleDestroy', function(station_module) {
  console.log("Destroyed:", station_module)
});

game.on('stationModuleRepair', function(station_module) {
  console.log("Repaired:", station_module)
});

game.on('UIComponentClick', function (component_id, ship) {

});

game.on('stop', function() {
  console.log("Mod stopped");
})
```

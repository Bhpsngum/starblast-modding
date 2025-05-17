<div align="center">
  <br />
  <p>
    <a href="https://bhpsngum.github.io/starblast/starblast-modding/"><img src="https://bhpsngum.github.io/starblast/starblast-modding/banner.png" width="640" alt="starblast-modding" /></a>
  </p>
</div>

## (MUST READ) Terms Of Use
By installing, importing, or otherwise using this library, you agree to comply with the following terms:

### 1. No Malicious Activity
You must not use this library to perform attacks, spamming, or any other disruptive actions against Starblast servers.

### 2. Respect User Eligibility
You must not use this library to host or direct activities toward users deemed inappropriate for the intended use of the platform, including players without an [ECP](https://starblast.fandom.com/wiki/Elite_Commander_Pass).

## A Brief Profile
**starblast-modding** is the JavaScript library for hosting modded Starblast games on NodeJS.
* Introducing OOP (Object-Oriented Programming) into Starblast Modding
* Provides a new way to approach Starblast Modding rather than the old format used in [the browser](https://starblast.io/modding.html)
* Includes new features and events that doesn't exist in the original Modding
* Regularly updates to catch up with latest Starblast server updates and bugs fixes

## Credits
* Thanks Caramel (Discord: Caramel#8789 or catramel) for making the banner for this library.

## Installation
**Node.js >= 16.6.0 and NPM >= 6.0.0 are required.**

```
npm install starblast-modding
yarn add starblast-modding
pnpm add starblast-modding
```

## Documentation
Please see [this link](https://bhpsngum.github.io/starblast/starblast-modding/)

## Changelog
Please see [here](./CHANGELOG.md)

## Example
### ModdingClient usage
This is an example on how to run a team-mode modded game:

(along with available events to listen on)
```js
const { Client } = require("starblast-modding");

const game = new Client({
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
  if (step % 30 == 0) for (let ship of game.ships) {
    ship.set({invulnerable: 120});
    ship.setCrystals(120).setGenerator(300).setHealing(true)
  }
});

game.on('shipRespawn', function(ship) {
  ship.setX(0).setY(0);
  console.log("Ship respawn: " + ship.name);
  console.log("Event: " + game.timer.step);
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

game.on('collectibleCreate', function(collectible) {

});

game.on('collectiblePick', function(collectible, ship) {

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

game.on('UIComponentClick', function (component, ship) {

});

game.on('stop', function() {
  console.log("Mod stopped");
})
```
### BrowserClient usage
#### From command line
```bash
npx starblast-modding [options] [mod_code]
```
To view list of options use `npx starblast-modding --help`

For example:
```bash
npx starblast-modding -r Asia -k 12345-67890 'echo("Hello World!")'
```
You can also load from configuration file:
```bash
npx starblast-modding -c ./config.json
```
Example configuration JSON file:
```json
{
	"key": "12345-67890",
	"region": "Asia",

	"sourcemode": "local",
	"sourcepath": "./modcode.js",

	"watch": true,
	"interval": 5000,
	"timeout": 5000,

	"compression": false,
	"strict": false,
	"silent": false,
	"extended": false
}
```
#### Using NodeJS
Here is an example for running SDC code pulled from Neuronality's site:
```js
const { BrowserClient } = require("starblast-modding");

let container = new BrowserClient({
  cacheECPKey: true,
  cacheOptions: true
});

container.setRegion("Asia");

container.setECPKey("12345-67890");

container.loadCodeFromExternal("https://starblast.data.neuronality.com/mods/sdc.js");

container.start();

let game = container.getGame();

let node = container.getNode();
```

## Support
* [Support Discord Server](https://bhpsngum.github.io/redirect?id=starblast-modding_Discord_Support)
* Discord: Bhpsngum#2623 or bhpsngum
* Email: bhpsngumproductions@gmail.com
* [Buy me a coffee](https://www.buymeacoffee.com/bhpsngum)

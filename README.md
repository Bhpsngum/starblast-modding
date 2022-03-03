The document about this package will be released soon.

This is an example on how to run a team-mode modded game:
```js
const StarblastModding = require("starblast-modding");

global.game = new StarblastModding.Client({ cacheConfiguration: true });
// set cacheConfiguration to `true` if you want to reuse tokens (ECP, etc.) for multiple runs

// You can set some specs separately

game.setRegion("Asia");

game.setECPKey("12345-67890");

game.setOptions({
  map_name: "Test"
});

// Or include them when starting the game like this

game.start({
  region: "Asia",
  ECPKey: "12345-6789",
  options: {
    map_size: 80,
    custom_map: "",
    root_mode: "team",
    friendly_colors: 5,
    radar_zoom: 1,
    station_size: 1
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
});

game.aliens.add();

game.on('start', function(link, options) {
  console.log("Mod started with link: "+ link);
  console.log(options);
  var cube2 = {
    id: "cube2",
    obj: "https://raw.githubusercontent.com/Bhpsngum/img-src/master/Aries.obj",
    diffuse: "https://starblast.data.neuronality.com/mods/objects/cube/diffuse.jpg",
    emissive: "https://starblast.data.neuronality.com/mods/objects/cube/emissive.jpg",
    bump: "https://starblast.data.neuronality.com/mods/objects/cube/bump.jpg",
    emissiveColor: 0x80FFFF,
    specularColor: 0x805010,
    diffuseColor:0xFF8080,
    transparent: false,
    physics: {
      mass: 500,
      autoShape: true
    }
  };
  game.objects.add({
    id: "test",
    type: cube2,
    position:{x:0,y:0,z:0},
    scale:{x:5,y:5,z:5},
    rotation: {x:0,y:0,z:Math.PI}
  });
});

game.on('tick', function (step) {
  if (game.ships.size > 0) {
    let {x, y} = game.teams.stations.array()[0].modules.array()[0];
    game.ships.array()[0].set({x, y})
  }
  game.collectibles.add()
  for (let ship of game.ships) {
    let station = game.teams.stations.findById(ship.team);
    station != null && ship.setX(station.x).setY(station.y).setCollider(false);
  }
  if (game.step % 60 === 0) {
    for (let ship of game.ships) {
      if (!ship.custom.init) {
        ship.setX(0).setY(0);
        ship.custom.init = true
      }
    }
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

game.on('UIComponentClick', function (component_id, ship) {

});

game.on('stop', function() {
  console.log("Mod stopped");
})
```

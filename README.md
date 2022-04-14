# starblast-modding
The JavaScript library for hosting modded Starblast games on NodeJS

## Installation

```
> npm i starblast-modding
```

## Documentation
Please see [this link](https://bhpsngum.github.io/starblast/starblast-modding/)

## Example
This is an example on how to run a team-mode modded game:
```js
const StarblastModding = require("starblast-modding");
const secrets = require("./secrets.js");

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
  ECPKey: secrets.ECPKey,
  options: {
    //map_size: 20,
    custom_map: "",
    root_mode: "team",
    friendly_colors: 5,
    radar_zoom: 1,
    station_size: 1,
    ships: [
      '{"name":"deposit-1","size":2.5,"level":1,"model":1,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"tori":{"main":{"radius":60,"segments":16,"section_segments":8,"offset":{"x":0,"y":-40,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],"height":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],"texture":[2,2,2,2,2,2,2,2,2,2,2,63,63,2]},"main2":{"radius":60,"segments":16,"section_segments":8,"offset":{"x":0,"y":-70,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],"height":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],"texture":[2,2,2,2,2,2,2,2,2,2,63,2,2,63,2]}},"bodies":{"hook":{"section_segments":16,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0],"y":[-130,-120,-55],"z":[0,0,0]},"width":[0,10,12],"height":[0,10,12],"texture":[6,12]},"deposit":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-90,-100,-90,70,85,85,0,-10],"z":[0,0,0,0,0,0,0,0]},"width":[0,95,100,100,100,90,90,0],"height":[0,45,50,50,50,40,30,0],"texture":[1,4,2,4,63,10,12]},"sidewalls":{"section_segments":12,"offset":{"x":80,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-55,-50,-20,0,20,45,50],"z":[0,0,0,0,0,0,0]},"width":[0,15,15,10,10,5,0],"height":[0,15,15,10,10,5,0],"angle":[0],"propeller":false,"texture":[4,4,10,4,63,4]},"antenna":{"vertical":true,"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":90,"z":-20},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-50,-45,-20,-19,20,21,30,60],"z":[0,0,0,0,0,0,0,0]},"width":[50,30,30,12,12,3,3,0],"height":[50,30,30,12,12,3,3,0],"texture":[3,[15],4,16,63,6,10]}},"typespec":{"name":"deposit-1","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"shape":[6.5,6.127,5.246,5.512,5.921,6.184,5.954,5.9,5.865,5.415,5.069,4.686,4.535,4.5,4.423,4.43,4.349,4.733,5.25,5.721,5.515,5.016,4.694,4.459,4.326,4.258,4.326,4.464,4.694,5.014,5.515,5.721,5.25,4.733,4.349,4.43,4.423,4.498,4.535,4.686,5.069,5.415,5.865,5.9,5.954,6.184,5.921,5.512,5.246,6.127],"lasers":[],"radius":6.5}}',
      '{"name":"deposit-2","size":2.5,"level":1,"model":2,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"bodies":{"hook":{"section_segments":16,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0],"y":[-130,-120,-55],"z":[0,0,0]},"width":[0,10,12],"height":[0,10,12],"texture":[6,12]},"deposit":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-90,-100,-90,70,85,85,0,-10],"z":[0,0,0,0,0,0,0,0]},"width":[0,95,100,100,100,90,90,0],"height":[0,45,50,50,50,40,30,0],"texture":[1,4,1,4,63,1,12]},"antenna":{"vertical":true,"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":90,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-45,-20,-19,20,21,30,60],"z":[0,0,0,0,0,0,0,0]},"width":[20,10,10,8,8,3,3,0],"height":[20,10,10,8,8,3,3,0],"texture":[3,10,1,12,63,6,10]},"sidewalls":{"section_segments":12,"offset":{"x":80,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-55,-50,-20,0,20,45,50],"z":[0,0,0,0,0,0,0]},"width":[0,15,15,10,10,5,0],"height":[0,15,15,10,10,5,0],"angle":[0],"propeller":false,"texture":[4,4,10,4,63,4]},"body0-40":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-76,"z":38},"position":{"x":[0,0,0,0,0],"y":[-7,-5,10,12],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,8,8,0],"texture":[12,63,12]},"body0-20":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-44,"z":38},"position":{"x":[0,0,0,0,0],"y":[-7,-5,10,12],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,8,8,0],"texture":[12,4,12]},"body00":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-12,"z":38},"position":{"x":[0,0,0,0,0],"y":[-7,-5,10,12],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,8,8,0],"texture":[12,63,12]},"body020":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":20,"z":38},"position":{"x":[0,0,0,0,0],"y":[-7,-5,10,12],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,8,8,0],"texture":[12,63,12]},"body040":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":52,"z":38},"position":{"x":[0,0,0,0,0],"y":[-7,-5,10,12],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,8,8,0],"texture":[12,63,12]},"body20-40":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":24,"y":-76,"z":38},"position":{"x":[0,0,0,0,0],"y":[-7,-5,10,12],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,8,8,0],"texture":[12,63,12]},"body20-20":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":24,"y":-44,"z":38},"position":{"x":[0,0,0,0,0],"y":[-7,-5,10,12],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,8,8,0],"texture":[12,4,12]},"body200":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":24,"y":-12,"z":38},"position":{"x":[0,0,0,0,0],"y":[-7,-5,10,12],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,8,8,0],"texture":[12,1,12]},"body2020":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":24,"y":20,"z":38},"position":{"x":[0,0,0,0,0],"y":[-7,-5,10,12],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,8,8,0],"texture":[12,63,12]},"body2040":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":24,"y":52,"z":38},"position":{"x":[0,0,0,0,0],"y":[-7,-5,10,12],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,8,8,0],"texture":[12,2,12]},"body40-40":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":48,"y":-76,"z":38},"position":{"x":[0,0,0,0,0],"y":[-7,-5,10,12],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,8,8,0],"texture":[12,1,12]},"body40-20":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":48,"y":-44,"z":38},"position":{"x":[0,0,0,0,0],"y":[-7,-5,10,12],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,8,8,0],"texture":[12,63,12]},"body400":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":48,"y":-12,"z":38},"position":{"x":[0,0,0,0,0],"y":[-7,-5,10,12],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,8,8,0],"texture":[12,4,12]},"body4020":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":48,"y":20,"z":38},"position":{"x":[0,0,0,0,0],"y":[-7,-5,10,12],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,8,8,0],"texture":[12,1,12]},"body4040":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":48,"y":52,"z":38},"position":{"x":[0,0,0,0,0],"y":[-7,-5,10,12],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,8,8,0],"texture":[12,63,12]}},"typespec":{"name":"deposit-2","level":1,"model":2,"code":102,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"shape":[6.5,6.127,5.246,5.512,5.921,6.184,5.954,5.216,4.709,5.154,5.109,4.9,4.787,4.625,4.645,4.782,4.934,5.062,5.25,5.721,5.515,5.016,4.694,4.459,4.326,4.258,4.326,4.464,4.694,5.014,5.515,5.721,5.25,5.062,4.934,4.782,4.645,4.623,4.787,4.9,5.109,5.154,4.709,5.216,5.954,6.184,5.921,5.512,5.246,6.127],"lasers":[],"radius":6.5}}',
      '{"name":"spawning-1","size":2.5,"level":1,"model":3,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"tori":{"main":{"radius":100,"segments":12,"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[30,30,30,30,30,30,30,30,30,30,30,30,30],"height":[15,15,15,15,15,15,15,15,15,15,15,15,15],"texture":[[10],[3],[10],[3],[10],[3],[10],[3],[10],[3],[10],[3],[10],[3],[10],[3],[10],[3],[10],[3],[10]]}},"bodies":{"sphere":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-160,-150,-100,-85,-70,-50,-20,20,50,70,-50,-50],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,30,30,40,70,90,100,100,90,60,30,0],"height":[0,30,30,40,70,90,100,100,90,60,30,0],"texture":[6,12,3,3,3,3,3,3,1,11,12]}},"typespec":{"name":"spawning-1","level":1,"model":3,"code":103,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"shape":[8,7.851,7.657,5.124,4.72,4.818,4.952,5.01,5.148,5.142,5.366,5.648,5.748,5.75,5.648,5.366,5.142,5.148,4.879,4.697,4.542,4.144,3.862,3.676,3.561,3.506,3.561,3.676,3.862,4.144,4.542,4.697,4.879,5.148,5.142,5.366,5.648,5.748,5.75,5.648,5.366,5.142,5.148,5.01,4.952,4.818,4.72,5.124,7.657,7.851],"lasers":[],"radius":8}}',
      '{"name":"spawning-2","size":2.5,"level":1,"model":4,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"tori":{"main":{"radius":200,"segments":42,"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30],"height":[15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],"texture":[[10],[1],[1],[1],[1],[1],[1],[10],[1],[1],[1],[1],[1],[1],[10],[1],[1],[1],[1],[1],[1],[10],[1],[1],[1],[1],[1],[1],[10],[1],[1],[1],[1],[1],[1],[10],[1],[1],[1],[1],[1],[1],[10]]}},"bodies":{"sphere":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-160,-150,-100,-85,-70,-50,-20,20,50,70,-50,-50],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,20,20,40,70,90,100,100,90,60,30,0],"height":[0,20,20,40,70,90,100,100,90,60,30,0],"texture":[6,1,1,1,1,1,1,1,1,11,12]}},"wings":{"topjoin":{"offset":{"x":45,"y":0,"z":80},"doubleside":true,"length":[100],"width":[50,20],"angle":[60],"position":[0,0],"texture":[63],"bump":{"position":0,"size":30}},"sidejoin":{"offset":{"x":90,"y":0,"z":0},"doubleside":true,"length":[100],"width":[50,20],"angle":[0],"position":[0,0],"texture":[63],"bump":{"position":10,"size":30}},"bottomjoin":{"offset":{"x":45,"y":0,"z":-80},"doubleside":true,"length":[100],"width":[50,20],"angle":[-60],"position":[0,0],"texture":[63],"bump":{"position":0,"size":30}}},"typespec":{"name":"spawning-2","level":1,"model":4,"code":104,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"shape":[8,7.77,5.32,4.858,4.72,4.818,4.952,5.01,5.148,5.142,6.029,10.326,10.748,10.75,10.326,6.029,5.142,5.148,4.879,4.697,4.542,4.144,3.862,3.676,3.561,3.506,3.561,3.676,3.862,4.144,4.542,4.697,4.879,5.148,5.142,6.029,10.326,10.748,10.75,10.326,6.029,5.142,5.148,5.01,4.952,4.818,4.72,4.858,5.32,7.77],"lasers":[],"radius":10.75}}',
      '{"name":"spawning-3","size":2.5,"level":1,"model":5,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"tori":{"circle-4":{"radius":120,"segments":16,"section_segments":8,"offset":{"x":0,"y":-100,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],"height":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],"texture":[[8],[3],[3],[3],[8],[8],[3],[3],[8],[3],[3],[8],[3],[8],[8],[3],[3]]},"circle-3":{"radius":140,"segments":16,"section_segments":8,"offset":{"x":0,"y":-75,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],"height":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],"texture":[[8],[3],[8],[3],[8],[8],[3],[3],[3],[3],[8],[3],[8],[3],[3],[3],[3]]},"circle-2":{"radius":160,"segments":16,"section_segments":8,"offset":{"x":0,"y":-50,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],"height":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],"texture":[[8],[3],[3],[8],[3],[3],[8],[3],[3],[8],[3],[8],[3],[3],[3],[3],[8]]},"circle-1":{"radius":180,"segments":16,"section_segments":8,"offset":{"x":0,"y":-25,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],"height":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],"texture":[[3],[3],[8],[3],[3],[3],[3],[3],[8],[3],[8],[8],[3],[3],[8],[3],[8]]},"circle0":{"radius":200,"segments":16,"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],"height":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],"texture":[[8],[3],[3],[8],[8],[3],[8],[3],[8],[3],[3],[8],[3],[8],[3],[3],[8]]}},"bodies":{"sphere":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-160,-150,-100,-85,-70,-50,-20,20,50,70,-50,-50],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,20,20,40,70,90,100,100,90,60,30,0],"height":[0,20,20,40,70,90,100,100,90,60,30,0],"texture":[6,1,3,3,3,3,3,3,1,11,12]}},"wings":{"sidejoin":{"offset":{"x":65,"y":0,"z":65},"doubleside":true,"length":[100],"width":[50,20],"angle":[45],"position":[0,0],"texture":[63],"bump":{"position":0,"size":30}},"sidejoin2":{"offset":{"x":65,"y":0,"z":-65},"doubleside":true,"length":[100],"width":[50,20],"angle":[-45],"position":[0,0],"texture":[63],"bump":{"position":0,"size":30}},"sidejoin3":{"offset":{"x":90,"y":0,"z":0},"doubleside":true,"length":[100],"width":[50,20],"angle":[0],"position":[0,0],"texture":[63],"bump":{"position":10,"size":30}},"topjoin":{"offset":{"x":0,"y":0,"z":95},"doubleside":true,"length":[100],"width":[50,20],"angle":[90],"position":[0,0],"texture":[63],"bump":{"position":10,"size":30}},"bottomjoin":{"offset":{"x":0,"y":0,"z":-95},"doubleside":true,"length":[100],"width":[50,20],"angle":[-90],"position":[0,0],"texture":[63],"bump":{"position":10,"size":30}}},"typespec":{"name":"spawning-3","level":1,"model":5,"code":105,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"shape":[8,7.77,6.043,6.354,6.805,7.458,8.331,8.423,8.509,8.689,8.886,9.582,10.499,10.5,7.006,5.072,5.142,5.148,4.879,4.697,4.542,4.144,3.862,3.676,3.561,3.506,3.561,3.676,3.862,4.144,4.542,4.697,4.879,5.148,5.142,5.072,7.006,10.499,10.5,9.582,8.886,8.689,8.509,8.423,8.331,7.458,6.805,6.354,6.043,7.77],"lasers":[],"radius":10.5}}'
    ].map(ship => {
      p = JSON.parse(ship);
      p.size = 2.5;
      return JSON.stringify(p)
    })
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
  // if (game.ships.size > 0) {
  //   let modul = game.teams.stations.array()[0].modules.array()[0];
  //   let {x, y, angle} = modul;
  //   let type = (modul.type == "spawning" ? 102 : 100) + modul.class;
  //   game.ships.array()[0].set({x, y, angle: (angle + 180) % 360, collider: false, type: type})
  // }
  if (game.step % 30 == 0 && game.ships.size > 0 && !game.collectibles.limitReached()) {
    let {x, y} = game.ships.array()[0];
    game.collectibles.add({x, y, code: 12}).catch(e => {})
  }
  // game.collectibles.add()
  // for (let ship of game.ships) {
  //   let station = game.teams.stations.findById(ship.team);
  //   station != null && ship.setX(station.x).setY(station.y).setCollider(false);
  // }
  // if (game.step % 60 === 0) {
  //   for (let ship of game.ships) {
  //     if (!ship.custom.init) {
  //       ship.setX(0).setY(0);
  //       ship.custom.init = true
  //     }
  //   }
  // }
  // if (global.activate) {
  //   let st = game.teams.stations[global.team||0];
  //   game.ships[0].setX(st.x + st.modules[0].offsetX).setY(st.y + st.modules[0].offsetY).setCollider(false).setAngle(st.modules[0].angle)
  // }
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
  console.log(station)
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

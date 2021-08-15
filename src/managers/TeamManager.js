'use strict';

const StructureManager = require("./StructureManager.js");
const Team = require("../structures/Team.js");

class TeamManager extends StructureManager {
  constructor(game) {
    super(game)
  }

  socketUpdate (dataView) {
    let size = Math.round(dataView.byteLength/this.all.length);
    for (let i = 0; i < this.all.length; i++) {
      let team = this.all[i], index = i * size;
      team.updateInfo({
        open: dataView.getUint8(index) > 0,
        station: {
          level: dataView.getUint8(index + 1) + 1,
          crystals: dataView.getUint32(index + 2, true),
          modules_shield: new DataView(dataView.buffer.slice(index + 7, index + size))
        }
      })
    }
  }

  update () {
    let x = this.all.splice(0).filter(team => this.isInstance(team));
    this.all.push(...x);
    this.all.forEach(team => team.isActive() && team.station.update());
    this.splice(0);
    this.push(...this.all.filter(team => team.isActive()))
  }
}

Object.defineProperties(TeamManager.prototype, {
  manager_name: {value: "team"},
  EntityConstructor: {value: Team}
});

module.exports = TeamManager

'use strict';

const StructureManager = require("./StructureManager.js");
const StationManager = require("./StationManager.js");
const Team = require("../structures/Team.js");
const getEntity = require("../utils/getEntity.js");

class TeamManager extends StructureManager {
  constructor(game) {
    super(game);
    Object.defineProperty(this, 'stations', {value: new StationManager(this.game)});
  }

  insert (...data) {
    for (let option of data) {
      let p = this.isInstance(option) ? option : this.create(option);
      this.all.push(p);
      this.stations.insert(Object.assign({}, option.station, {id: option.id, name: option.base_name}))
    }
    this.update()
  }

  socketUpdate (dataView) {
    let size = Math.round(dataView.byteLength/this.all.length);
    for (let i = 0; i < this.all.length; i++) {
      let team = getEntity({id: i}, this), station = getEntity({id: i}, this.stations), index = i * size;
      team.updateInfo({
        open: dataView.getUint8(index) > 0
      });
      station.updateInfo({
        level: dataView.getUint8(index + 1) + 1,
        crystals: dataView.getUint32(index + 2, true),
        modules_shield: new DataView(dataView.buffer.slice(index + 7, index + size))
      });
      if (team.isActive() && !station.isActive()) team.markAsInactive();
    }
    this.update()
  }

  update () {
    this.stations.update();
    let x = this.all.splice(0).filter(team => this.isInstance(team));
    this.all.push(...x);
    this.splice(0);
    this.push(...this.all.filter(team => team.isActive()))
  }
}

Object.defineProperties(TeamManager.prototype, {
  manager_name: {value: "team"},
  StructureConstructor: {value: Team}
});

module.exports = TeamManager

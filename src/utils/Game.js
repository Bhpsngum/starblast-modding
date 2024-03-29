class Game {
  constructor (node) {
    this.#node = node;
    this.modding.terminal = {
      echo: node.log.bind(node),
      error: node.error.bind(node)
    }
  }

  #node;

  modding = {
    game: this,
    context: {},
    commands: {},
    tick: function () {
      this.game?.tick?.()
    }
  }

  get custom () {
    return this.#node.custom
  }

  set custom (value) {
    this.#node.custom = value
  }

  setCustomMap (...args) {
    this.#node.setCustomMap(...args)
  }

  setOpen (...args) {
    this.#node.setOpen(...args)
  }

  get options () {
    return this.#node.options ?? null
  }

  get step () {
    return this.#node.timer.step
  }

  get link () {
    return this.#node.link ?? null
  }

  get ships () {
    return this.#node.ships.array(true).filter(ship => !ship.isSpawned() || ship.isActive())
  }

  get aliens () {
    return this.#node.aliens.array(true).filter(alien => !alien.isSpawned() || alien.isActive())
  }

  get asteroids () {
    return this.#node.asteroids.array(true).filter(asteroid => !asteroid.isSpawned() || asteroid.isActive())
  }

  get collectibles () {
    return this.#node.collectibles.array(true).filter(collectible => !collectible.isSpawned() || collectible.isActive())
  }

  findShip (id) {
    return this.ships.find(ship => ship.id === id) ?? null
  }

  findAlien (id) {
    return this.aliens.find(alien => alien.id === id) ?? null
  }

  findAsteroid (id) {
    return this.asteroids.find(asteroid => asteroid.id === id) ?? null
  }

  findCollectible (id) {
    return this.collectibles.find(collectible => collectible.id === id) ?? null
  }

  addAlien (...data) {
    this.#node.aliens.add(...data).then(a => {}).catch(e => this.#node.error(e));
    return this.aliens.slice(-1)[0]
  }

  addAsteroid (...data) {
    this.#node.asteroids.add(...data).then(a => {}).catch(e => this.#node.error(e));
    return this.asteroids.slice(-1)[0]
  }

  addCollectible (...data) {
    this.#node.collectibles.add(...data).then(a => {}).catch(e => this.#node.error(e));
    return this.collectibles.slice(-1)[0]
  }

  setUIComponent (...data) {
    this.#node.ships.setUIComponent(...data)
  }

  setObject (...data) {
    let obj = data[0];
    if (obj?.type?.physics && obj.type.physics.shape == null) obj.type.physics.autoShape = true;
    this.#node.objects.set(...data)
  }

  removeObject (...data) {
    this.#node.objects.remove(...data)
  }

  tick () {

  }

  collectibleCreated () {

  }
}

module.exports = Game

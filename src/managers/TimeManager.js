'use strict';

/**
 * The Time Manager (Timer) Instance.<br>Please note that all functions running in the timer will be bound to its parent <code>ModdingClient</code> object by default.
 * @abstract
 */

class TimeManager {
  constructor(game, api) {
    this.#api = api;
    this.#game = game;
    api.updateTimer = function () {
      this.#runJobs()
    }.bind(this)
  }

  #api;
  #game;
  #jobs = new Map();
  #id_pool = 0;

  /**
   * The game step
   * @type {number}
   * @readonly
   */

  get step () {
    return this.#api.mod_data.step
  }

  #addJob (f, time, repeat, args, immediate) {
    time = Math.round(Math.max(0, time)) || 0;
    let id = ++this.#id_pool;
    this.#jobs.set(id, {f, time, finish: Math.max(this.step, 0) + time, repeat, args, id, immediate});
    return id
  }

  #clearJob (id = null, forceRemove, matchRepeat, matchImmediate) {
    if (id == null && forceRemove) {
      if (matchRepeat == null) this.#jobs.clear();
      else this.#jobs.forEach((timer, id) => (timer.repeat === matchRepeat && timer.immediate === matchImmediate) && this.#jobs.delete(id))
    }

    let job = this.#jobs.get(id);
    if (job && (matchRepeat == null || job.repeat === matchRepeat && job.immediate === matchImmediate)) {
      if (job.repeat && !forceRemove) job.finish += job.time;
      else this.#jobs.delete(id);
      return this
    }
    return this
  }

  #runJobs () {
    for (let entries of this.#jobs) {
      let job = entries[1];
      if (job.finish <= this.step) {
        try {
          ("string" == typeof job.f ? new Function(job.f) : job.f)?.call?.(this.#game, ...job.args)
        }
        catch (e) {
          this.#clearJob(job.id, false, null, false);
          throw e
        }
        this.#clearJob(job.id, false, null, false)
      }
    }
  }

  /**
   * Set timeout in sync with game
   * @param {(function|string)} StringOrFunction - The function to be executed or a string to be evaluated
   * @param {number} delay - The delay (in game ticks). Defaults to 0 if omitted or null/undefined
   * @param {...any} args - The arguments to passed into the function in case the first argument is a function
   * @returns {number} - The Timer ID
   */

  setTimeout (f, time = 0, ...args) {
    return this.#addJob(f, time, false, args, false)
  }

  /**
   * Set interval in sync with game
   * @param {(function|string)} StringOrFunction - The function to be executed or a string to be evaluated
   * @param {number} interval - The delay (in game ticks). Defaults to 0 if omitted or null/undefined
   * @param {...any} args - The arguments to passed into the function in case the first argument is a function
   * @returns {number} - The Timer ID
   */

  setInterval (f, time = 0, ...args) {
    return this.#addJob(f, time, true, args, false)
  }

  /**
   * Set immediate in sync with game (set function to call or code to execute next tick)
   * @param {(function|string)} StringOrFunction - The function to be executed or a string to be evaluated
   * @param {...any} args - The arguments to passed into the function in case the first argument is a function
   * @returns {number} - The Timer ID
   */

  setImmediate (f, ...args) {
    return this.#addJob(f, 0, false, args, true)
  }

  /**
   * Clear a timeout with specified ID
   * @param {number} id - The timeout ID, omitting or null/undefined will clear all current timeouts
   * @returns {TimeManager}
   */

  clearTimeout (id) {
    this.#clearJob(id, true, false, false)
  }

  /**
   * Clear an interval with specified ID
   * @param {number} id - The interval ID to clear, omitting or null/undefined will clear all current intervals
   * @returns {TimeManager}
   */

  clearInterval (id) {
    this.#clearJob(id, true, true, false)
  }

  /**
   * Clear an immediate with specified ID
   * @param {number} id - The immediate ID to clear, omitting or null/undefined will clear all current immediates
   * @returns {TimeManager}
   */

  clearImmediate (id) {
    this.#clearJob(id, true, false, true)
  }

  /**
   * Clear a timer (in general) with specified ID
   * @param {number} id - The timer ID to clear, omitting or null/undefined will clear all current timers
   * @returns {TimeManager}
   */

  clear (id) {
    this.#clearJob(id, true, null, false)
  }

  [Symbol.toStringTag] = 'TimeManager'
}

module.exports = TimeManager

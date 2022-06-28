'use strict';

/**
 * The Time Manager (Timer) Instance.
 * @abstract
 */

class TimeManager {
  constructor(api) {
    this.#api = api;
    api.updateTimer = function () {
      this.#runJobs()
    }.bind(this)
  }

  #api;
  #jobs = [];
  #id_pool = 0;
  #beforeTick = true;

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
    this.#jobs.push({f, time, finish: Math.max(this.step, 0) + time, repeat, args, id: ++this.#id_pool, immediate});
    return this.#id_pool
  }

  #removeJob (i) {
    let job = this.#jobs[i];
    if (job.repeat) job.finish += job.time;
    else this.#jobs.splice(i, 1)
  }

  #clearJob (id = null, matchRepeat, matchImmediate) {
    if (id == null) {
      this.#jobs = matchRepeat == null ? [] : this.#jobs.filter(timer => timer.repeat !== matchRepeat || timer.immediate !== matchImmediate)
    }
    for (let i = 0; i < this.#jobs.length; ++i) {
      let job = this.#jobs[i];
      if (job.id === id && (matchRepeat == null || job.repeat === matchRepeat && job.immediate === matchImmediate)) {
        this.#jobs.splice(i, 1);
        return this
      }
    }
    return this
  }

  #runJobs () {
    for (let i = 0; i < this.#jobs.length; ++i) {
      let job = this.#jobs[i];
      if (job.finish <= this.step) {
        try {
          "string" == typeof job.f ? eval(job.f) : job.f?.(...job.args)
        }
        catch (e) {
          this.#removeJob(i);
          throw e
        }
        this.#removeJob(i)
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
    this.#clearJob(id, false, false)
  }

  /**
   * Clear an interval with specified ID
   * @param {number} id - The interval ID to clear, omitting or null/undefined will clear all current intervals
   * @returns {TimeManager}
   */

  clearInterval (id) {
    this.#clearJob(id, true, false)
  }

  /**
   * Clear an immediate with specified ID
   * @param {number} id - The immediate ID to clear, omitting or null/undefined will clear all current immediates
   * @returns {TimeManager}
   */

  clearImmediate (id) {
    this.#clearJob(id, false, true)
  }

  /**
   * Clear a timer (in general) with specified ID
   * @param {number} id - The timer ID to clear, omitting or null/undefined will clear all current timers
   * @returns {TimeManager}
   */

  clear (id) {
    this.#clearJob(id, null, false)
  }

  [Symbol.toStringTag] = 'TimeManager'
}

module.exports = TimeManager

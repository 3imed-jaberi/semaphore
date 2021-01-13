/*!
 * Semaphore
 *
 * A mirco, elegant, simple, fast, amiable
 * and lightweight implementation for semaphore.
 *
 *
 * Copyright(c) 2021 Imed Jaberi <https://www.3imed-jaberi.com/>
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 */
import queue from 'fastq'

/**
 * Semaphore Implementation.
 *
 * @api public
 */
class Semaphore {
  /**
   * creates an instance of Semaphore.
   *
   * @param {number} [capacity=1] - initial Semaphore value.
   */
  constructor (capacity = 1) {
    // validate capacity

    // should be an integer number.
    if (!Number.isInteger(capacity)) {
      throw new TypeError(
        `Invalid capacity ${capacity}: should be an integer number.`
      )
    }

    // should be an potive number.
    if (capacity < 0) {
      throw new TypeError(
        `Invalid capacity ${capacity}: should be an integer number.`
      )
    }

    // semaphore value.
    this._semaphore = capacity
    // waiting queue.
    this._queue = queue(null, () => {}, 1)
  }

  /**
   * attempt to acquire/consume semaphore value.
   *
   * @async
   * @param {number} [n=1] - wait cycles.
   * @returns {Promise<void>} - the promise resolves when semaphore condition passes.
   */
  P (n = 1) { // wait
    const task = () => {
      if (!n) return Promise.resolve()
      --n

      return (
        this._semaphore > 0 && --this._semaphore >= 0
          ? task()
          : new Promise(
            (resolve, reject) => this._queue.push([resolve, reject])
          ).then(task)
      )
    }

    return task()
  }

  /**
   * resolve waiting promises or increment semaphore value.
   *
   * @param {number} [n=1] - signal times.
   */
  V (n = 1) { // signal
    while (n--) {
      this._queue.length()
        // if we have
        ? this._queue
            // get access to native array methods.
            .getQueue()
            // index: [0, 1]
            // value: [resolve, reject]
            .shift()[0]()
        : ++this._semaphore
    }
  }

  // reject all promises on the waiting queue.
  rejectAll () {
    while (this._queue.length) {
      this._queue
        // get access to native array methods.
        .getQueue()
        // index: [0, 1]
        // value: [resolve, reject]
        .shift()[1](
          new Error(
            '[Semaphore] Task cancled as rejectAll() gets called.'
          )
        )
    }
  }
}

/**
 * Expose `Semaphore`.
 */

export default Semaphore

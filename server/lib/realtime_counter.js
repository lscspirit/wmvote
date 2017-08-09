"use strict";

import config from "config";

import RedisHelper from "~/server/helpers/redis_helper";
import Candidate from "~/models/candidate";
import BallotRecord from "~/server/records/ballot_record";

const CACHE_DIRTY_KEY = "wm-cache-dirty";
const CACHE_INIT_KEY = "wm-cache-init";
const VOTE_COUNT_KEY = "wm-vote-counts";
const RECENT_VOTE_KEY_PREFIX = "wm-vote-recent-";

const recent_ttl = config.get("vote").recent_ttl;

export default class RealtimeCounter {
  static get DIRTY_KEY() { return CACHE_DIRTY_KEY; }

  /**
   * Initialize the cache with the latest vote counts from
   * data source.
   *
   * Only one instance of the init process will be run every
   * when there are multiple application processes.
   */
  static init() {
    const rc = RedisHelper.client;
    rc.on("ready", () => {
      rc.timeAsync().then(current => {
        // first get the current server time
        const current_time = parseInt(current[0], 10);

        // begin watching the CACHE_INIT_KEY
        rc.watch(CACHE_INIT_KEY);
        // check if CACHE_INIT_KEY exists
        rc.existsAsync(CACHE_INIT_KEY).then(res => {
          if (res === 0) {
            // if not exist; that means the cache has not been initialized

            console.log("attempting to initialize RealtimeCounter");

            // get the count from data source
            BallotRecord.voteCounts().then(counts => {
              const inputs = [VOTE_COUNT_KEY];    // redis hmset inputs
              Object.keys(counts).forEach(code => {
                inputs.push(code);          // field
                inputs.push(counts[code]);  // value
              });

              let multi = rc.multi()
              // store the counts into the VOTE_COUNT_KEY hash
              multi.hmset.apply(multi, inputs)
                // update the "start" entry with current time
                .set(CACHE_INIT_KEY, current_time)
                // mark the cache as dirty
                .set(CACHE_DIRTY_KEY, true)
                .execAsync().then(replies => {
                  if (replies[1] !== null) console.log("RealtimeCounter initialized");
                  else console.log("RealtimeCounter has been initialized by another process");
                });
            });
          } else {
            // the "start" entry is already there; no need to initialize
            rc.unwatchAsync();
          }
        });
      });
    });
  }

  /**
   * Count a ballot
   * @param  {Ballot} ballot ballot to be counted
   * @return {Promise}
   */
  static count(ballot) {
    const rc = RedisHelper.client;
    rc.timeAsync().then(res => {
      const current = parseInt(res[0], 10);

      return rc.multi()
        // increment the total vote count
        .hincrby(VOTE_COUNT_KEY, ballot.candidate.code, 1)
        // insert the current time to the recent vote list for the candidate
        .rpush(recentVoteKey(ballot.candidate.code), current)
        // mark the cache as dirty
        .setnx(CACHE_DIRTY_KEY, true)
        .execAsync();
    });
  }

  /**
   * Get the current counts
   * @return {Promise<Object<String, Integer>>} vote counts for each candidate
   */
  static liveCounts() {
    const rc = RedisHelper.client;
    return rc.hgetallAsync(VOTE_COUNT_KEY).then(res => {
      return Candidate.all.reduce((result, c) => {
        result[c.code] = parseInt(res[c.code] || 0, 10);
        return result;
      }, {})
    });
  }

  /**
   * Get the recent vote counts within a certain period of time
   * The time period is defined in the config file
   * @return {Promise<Object<String, Integer>>} recent vote counts for each candidate
   */
  static recentVoteCounts() {
    return this._trimRecentLists().then(() => {
      // get the counts of all recent list
      const rc = RedisHelper.client;
      const candidates = Candidate.all;

      let query = rc.multi();
      // query the lenght of each list
      candidates.forEach(c => {
        query = query.llen(recentVoteKey(c.code));
      });

      // execute the query
      return query.execAsync().then(replies => {
        return Candidate.all.reduce((result, c, index) => {
          result[c.code] = replies[index];
          return result;
        }, {})
      });
    });
  }

  //
  // Private Methods
  //

  /**
   * Remove all expired timestamps from each of the recent vote list
   * @return {Promise}
   */
  static _trimRecentLists() {
    const rc = RedisHelper.client;
    const candidates = Candidate.all;

    // get the recent vote list for each candidate
    let query = rc.multi().time();
    candidates.forEach(c => {
      query = query.lrange(recentVoteKey(c.code), 0, -1);
    });

    // execute the query
    return query.execAsync().then(replies => {
      // now find and remove all expired elements from each
      // list by comparing the timestamps

      // the first reply is server time
      const current = parseInt(replies[0][0], 10);

      let modified = false;
      let update = rc.multi();
      // find the index of the first valid entry for each list
      candidates.forEach((c, index) => {
        const timestamps = replies[index + 1];
        // if the list exists
        if (timestamps) {
          // compare the timestamps with the current time
          const valid_index = timestamps.findIndex(t => parseInt(t, 10) + recent_ttl >= current);
          if (timestamps.length > 0 && valid_index < 0) {
            // there is no valid entry; delete the whole list
            update = update.del(recentVoteKey(c.code));
            modified = true;
          } else if (valid_index > 0) {
            // there is some invalid entry; trim the list
            update = update.ltrim(recentVoteKey(c.code), valid_index, -1);
            modified = true;
          }
        }
      });

      if (modified) {
        // mark cache as dirty and execute the update
        return update.setnx(CACHE_DIRTY_KEY, true).execAsync();
      } else {
        // no updates needed
        return Promise.resolve();
      }
    });
  }
}

/**
 * Build the recent vote key
 * @param  {String} c_code candidate code
 * @return {String} recent vote key
 */
function recentVoteKey(c_code) {
  return `${RECENT_VOTE_KEY_PREFIX}${c_code}`;
}
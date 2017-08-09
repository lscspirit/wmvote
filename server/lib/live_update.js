"use strict";

import config from "config";

import RedisHelper from "~/server/helpers/redis_helper";
import RealtimeCounter from "~/server/lib/realtime_counter";
import WebSocketHelper from "~/server/helpers/websocket_helper";

const NEXT_LIVE_UPDATE_KEY = "wm-next-live-update";

const update_freq = config.get("vote").update_freq;
let interval;
export default class LiveUpdate {
  static start() {
    interval = setInterval(performLiveUpdate, update_freq * 1000);
  }

  static stop() {
    if (interval) clearInterval(interval);
  }
}

function performLiveUpdate() {
  const rc = RedisHelper.client;

  // get the latest live and recent counts
  const live_prom   = RealtimeCounter.liveCounts();
  const recent_prom = RealtimeCounter.recentVoteCounts();

  //
  // Logic to prevent multiple instances of the application from
  // perform live update at the same time
  //

  // first get the latest counts from cache
  // then determine if anything changes;
  // publish only if there is change
  Promise.all([live_prom, recent_prom]).then(replies => {
    const live_counts   = replies[0];
    const recent_counts = replies[1];

    // first get from redis server time
    rc.timeAsync().then(time => {
      const current_time = parseInt(time[0], 10);

      rc.watch(NEXT_LIVE_UPDATE_KEY);
      rc.watch(RealtimeCounter.DIRTY_KEY);

      // first check if the cache is dirty
      rc.existsAsync(RealtimeCounter.DIRTY_KEY).then(dirty => {
        if (dirty === 1) {
          // if cache is dirty, then check if it is time to update
          return rc.getAsync(NEXT_LIVE_UPDATE_KEY).then(next_update => {
            const next_update_time = parseInt(next_update || 0);
            if (current_time >= next_update_time) {
              // if current time is after next update time, then perform
              // the live update
              return publishUpdate(live_counts, recent_counts).then(() => {
                // if successful, clear the dirty flag and update
                // the next update time
                return rc.multi()
                  .del(RealtimeCounter.DIRTY_KEY)
                  .set(NEXT_LIVE_UPDATE_KEY, current_time + update_freq)
                  .execAsync();
              }, err => {
                // unwatch if publish failed
                return rc.unwatchAsync();
              });
            } else {
              // if it is not yet time to do the next update, then unwatch
              return rc.unwatchAsync();
            }
          });
        } else {
          // if cache is not dirty; unwatch and not publish update
          return rc.unwatchAsync();
        }
      });
    });
  });
}

function publishUpdate(live_counts, recent_counts) {
  // publish the results
  return WebSocketHelper.client.publish("/updates", {
    live_counts:   live_counts,
    recent_counts: recent_counts
  });
}
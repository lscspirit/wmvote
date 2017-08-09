"use strict";

import config from "config";

import RealtimeCounter from "~/server/lib/realtime_counter";
import WebSocketHelper from "~/server/helpers/websocket_helper";

let interval;
export default class LiveUpdate {
  static start() {
    interval = setInterval(() => {
      const live_prom   = RealtimeCounter.liveCounts();
      const recent_prom = RealtimeCounter.recentVoteCounts();

      Promise.all([live_prom, recent_prom]).then(results => {
        WebSocketHelper.client.publish("/updates", {
          live_counts:   results[0],
          recent_counts: results[1]
        });
      });
    }, config.get("vote").update_freq * 1000);
  }

  static stop() {
    if (interval) clearInterval(interval);
  }
}
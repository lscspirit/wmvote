"use strict";

import config from "config";
import http from "http";
import faye from "faye";
import faye_redis from "faye-redis";

let bayeux;
export default class WebSocketHelper {
  static attach(server) {
    const redis_config = config.get("redis");

    bayeux = new faye.NodeAdapter({
      mount: "/faye",
      timeout: 45,
      engine: {
        type: faye_redis,
        host: redis_config.host,
        port: redis_config.port,
        database:  redis_config.db,
        namespace: "faye"
      }
    });

    bayeux.attach(server);
  }

  static get client() {
    return bayeux.getClient();
  }
}
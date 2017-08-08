"use strict";

import config from "config";
import redis from "redis";
import bluebird from "bluebird";

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const redis_config = config.get("redis");

let client;

export default class RedisHelper {
  static init() {
    client = redis.createClient({
      host: redis_config.host,
      port: redis_config.port,
      db:   redis_config.db
    });
    console.log("redis connection established");
  }

  static get client() {
    return client;
  }
}
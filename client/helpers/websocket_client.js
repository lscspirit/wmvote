"use strict";

let client;
export default class WebSocketClient {
  static get client() {
    if (!client) {
      client = new Faye.Client("/faye", {
        timeout: 120
      });
    }

    return client;
  }

  /**
   * Subscribe to a channel
   * @param  {String}   channel channel name
   * @param  {Function} cb      callback function
   */
  static subscribe(channel, cb) {
    this.client.subscribe(channel, cb);
  }
}
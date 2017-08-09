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
   * @return {Subscription} subscription object
   */
  static subscribe(channel, cb) {
    return this.client.subscribe(channel, cb);
  }

  /**
   * Unsubscribe from a channel
   * @param  {Subscription} subscription the subscription object
   */
  static unsubscribe(subscription) {
    if (subscription) subscription.cancel();
  }
}
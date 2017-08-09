"use strict";

import $ from "jquery";

import Ballot from "~/models/ballot";

let _client = null;
export default class ServerClient {
  /**
   * Initialize this client
   * (e.g. crediential, csrf tokens)\
   *
   * @param  {Object} opts options
   */
  static init(opts) {

  }

  /**
   * Get the singleton client instance
   * @type {ServerClient}
   */
  static get client() {
    if (_client) return _client;

    _client = new ServerClient();
    return _client;
  }

  //
  // API Methods
  //

  /**
   * Cast a new Vote
   * @param  {Ballot} ballot ballot
   * @return {Promise<Ballot>}
   */
  static castVote(ballot) {
    const req = $.ajax({
      type: "POST",
      url: "/votes",
      data: JSON.stringify(ballot),
      dataType: "json",
      contentType: "application/json; charset=utf-8"
    });

    return new Promise((resolve, reject) => {
      req
        .done(data => resolve(new Ballot(data)))
        .fail((xhr, status, err) => {
          if (xhr.status >= 400 && xhr.status < 500) {
            reject(xhr.responseJSON);
          } else {
            reject(new Error(status));
          }
        });
    });
  }

  /**
   * Get the live vote counts
   * @return {Promise<Object<String, Integer>>} a promise that will be resolved
   *   with counts for all candidates
   */
  static getLiveCounts() {
    const req = $.ajax({
      type: "GET",
      url: "/votes/counts",
      dataType: "json"
    });

    return new Promise((resolve, reject) => {
      req
        .done(data => resolve(data))
        .fail((xhr, status, err) => {
          if (xhr.status >= 400 && xhr.status < 500) {
            reject(xhr.responseJSON);
          } else {
            reject(new Error(status));
          }
        });
    });
  }

  /**
   * Get recent vote counts
   * @return {Promise<Object<String, Integer>>} a promise that will be resolved
   *   with recent vote counts for all candidates
   */
  static getRecentCounts() {
    const req = $.ajax({
      type: "GET",
      url: "/votes/recent",
      dataType: "json"
    });

    return new Promise((resolve, reject) => {
      req
        .done(data => resolve(data))
        .fail((xhr, status, err) => {
          if (xhr.status >= 400 && xhr.status < 500) {
            reject(xhr.responseJSON);
          } else {
            reject(new Error(status));
          }
        });
    });
  }
}
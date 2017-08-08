"use strict";

import Ballot from "~/models/ballot";
import Candidate from "~/models/candidate";
import MysqlHelper from "~/server/helpers/mysql_helper";

const TABLE_NAME = "ballots";
export default class BallotRecord extends Ballot {
  /**
   * Get vote counts from database
   * @return {Promise<Object<String, Integer>>} vote counts for each candidate
   */
  static voteCounts() {
    const client = MysqlHelper.client;
    return client(TABLE_NAME)
      .select(client.raw("count(*) as count, choice"))
      .groupBy("choice").then(res => {
        return Candidate.all.reduce((result, c) => {
          const grp = res.find(r => r.choice === c.number);
          result[c.code] = grp ? grp.count : 0;
          return result;
        }, {});
      });
  }

  //
  // Accessors
  //

  get id() { return this._id; }
  set id(id) { this._id = id; }

  save() {
    if (this.validate()) {
      return MysqlHelper.client(TABLE_NAME)
        .insert({ choice: this.candidate.number }, ["id"])
        .then(id => { this.id = id; });
    } else {
      return Promise.reject(new Error("invalid ballot"));
    }
  }
}
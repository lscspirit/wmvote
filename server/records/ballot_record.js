"use strict";

import Ballot from "~/models/ballot";
import MysqlHelper from "~/server/helpers/mysql_helper";

const TABLE_NAME = "ballots";
export default class BallotRecord extends Ballot {
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
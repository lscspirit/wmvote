"use strict";

import RealtimeCounter from "~/server/lib/realtime_counter"

export default class VoteCollector {
  /**
   * Cast a new vote
   * @param  {BallotRecord} ballot vote ballot
   * @return {Promise}
   */
  static castVote(ballot) {
    return ballot.save().then(() => {
      return RealtimeCounter.count(ballot);
    });
  }
}
"use strict";

import express from "express";

import BallotRecord from "~/server/records/ballot_record";
import VoteCollector from "~/server/lib/vote_collector";
import RealtimeCounter from "~/server/lib/realtime_counter";
import { errorResponseJson } from "~/server/helpers/response_helper";

const router = express.Router();

router.get("/", function(req, res, next) {
  res.render("votes/index");
});

router.post("/", function(req, res, next) {
  const ballot = new BallotRecord(req.body);

  VoteCollector.castVote(ballot).then(() => {
    res.status(201).json(ballot);
  }, error => {
    res.status(400).json(errorResponseJson(error));
  });
});

router.get("/result", function(req, res, next) {
  res.render("votes/result");
});

router.get("/counts", function(req, res, next) {
  RealtimeCounter.liveCounts().then(counts => {
    res.status(200).json(counts);
  }, error => {
    res.status(400).json(errorResponseJson(error));
  });
});

router.get("/recent", function(req, res, next) {
  RealtimeCounter.recentVoteCounts().then(counts => {
    res.status(200).json(counts);
  }, error => {
    res.status(400).json(errorResponseJson(error));
  });
});

export default router;
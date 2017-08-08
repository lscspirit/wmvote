"use strict";

import express from "express";
import VotesController from "~/server/controllers/votes_controller";

const router = express.Router();

router.get("/", function(req, res, next) {
  // redirect root to "/votes"
  res.redirect("/votes");
});
router.use("/votes", VotesController);

export default router;
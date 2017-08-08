"use strict";

import path from "path";
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
// webpack
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import clientWebpackConfig from "~/webpack.client.config.js";

import appRouter from "~/server/router";
import { errorResponseJson } from "~/server/helpers/response_helper";

import MysqlHelper from "~/server/helpers/mysql_helper";
import RedisHelper from "~/server/helpers/redis_helper";

//
// DB and Redis Initialization
//

MysqlHelper.init();
RedisHelper.init();

//
// Initialize Express
//

const app = express();

// public directory
app.use(express.static(__dirname + "../public"));

// setup view engine
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// setup request logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan('combined'));
}

// setup request parsing
app.use(bodyParser.json());

// setup router
app.use(appRouter);

//
// Configure Webpack
//

if (app.get("env") !== "production" && process.env.NODE_ENV !== "test") {
  const webpackCompiler = webpack(clientWebpackConfig);
  app.use(webpackDevMiddleware(webpackCompiler, {
    publicPath: clientWebpackConfig.output.publicPath
  }));
}

//
// error handling
//

// error logging
app.use((err, req, res, next) => {
  console.error(err.stack);
  next(err);
});

// client error handling
app.use((err, req, res, next) => {
  if (req.xhr) {
    res.status(500).json(errorResponseJson("Oops! Something went wrong."));
  } else {
    next(err);
  }
});

// catch-all error handling
app.use((err, req, res, next) => {
  res.status(500);
  res.render("error", { error: err });
});

module.exports = app;


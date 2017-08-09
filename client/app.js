"use strict";

require("~/assets/stylesheets/main.scss");

import React from "react";
import ReactDOM from "react-dom";

import BallotAppContainer from "~/client/components/ballot_app";
import ResultAppContainer from "~/client/components/result_app";

(function() {
  let container = document.getElementById("ballot-app");
  if (container) {
    ReactDOM.render(React.createElement(BallotAppContainer), container);
  }

  container = document.getElementById("result-app");
  if (container) {
    ReactDOM.render(React.createElement(ResultAppContainer), container);
  }
})();

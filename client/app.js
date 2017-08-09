"use strict";

require("~/assets/stylesheets/main.scss");

import React from "react";
import ReactDOM from "react-dom";

import BallotAppContainer from "~/client/components/ballot_app";

(function() {
  const container = document.getElementById("ballot-app");
  ReactDOM.render(React.createElement(BallotAppContainer), container);
})();

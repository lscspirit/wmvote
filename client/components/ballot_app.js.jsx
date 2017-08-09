"use strict";

import React from "react";
import { Row, Col } from "react-bootstrap";

import lightbox from "~/client/components/lightbox";
import Ballot from "~/models/ballot";
import ServerClient from "~/client/helpers/server_client";
import BallotContainer from "~/client/components/ballot";

export default class BallotAppContainer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      lightbox: null
    };

    this._submitVote = this._submitVote.bind(this);
    this._onLbClose = this._onLbClose.bind(this);
  }
  render() {
    return (
      <Row>
        <Col sm={10} smOffset={1} md={8} mdOffset={2}>
          { this.state.lightbox }
          <BallotContainer onSubmit={this._submitVote}/>
        </Col>
      </Row>
    );
  };

  /**
   * Cast a vote and display a light box upon completion
   * @param  {Ballot} ballot ballot
   * @return {Promise<Ballot>}
   */
  _submitVote(ballot) {
    const prom = ServerClient.castVote(ballot);

    prom.then(() => {
      let LbComp = lightbox();
      this.setState({
        lightbox: <LbComp
          lbMessage="Thank you for your vote"
          onClose={this._onLbClose}/>
      });
    });

    return prom;
  }

  _onLbClose() {
    this.setState({
      lightbox: null
    });
  }
}
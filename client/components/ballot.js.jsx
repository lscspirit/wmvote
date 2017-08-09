"use strict";

import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Panel, Row, Col, Button } from "react-bootstrap";

import Candidate from "~/models/candidate";
import Ballot from "~/models/ballot";

class BallotForm extends React.PureComponent {
  render() {
    const choices = Candidate.all.map(c => {
      const selection_cls = classNames("selection", {
        selected: this.props.selected === c.code,
        disabled: this.props.loading
      });

      return (
        <Row key={c.code} className="candidate">
          <Col xs={3} xsOffset={1} className="name">{c.name}</Col>
          <Col xs={7}>
            <div className={selection_cls} onClick={this.props.onSelect.bind(null, c.code)}>
              Support
            </div>
          </Col>
        </Row>
      );
    });

    const btn_content = this.props.loading ? (
      <span>
        <span className="fa fa-spinner fa-spin fa-fw" style={{marginRight: 10}}/>
        Sending
      </span>
    ) : "Vote";

    return (
      <Panel className="wm-ballot">
        <h2>Cast Your Vote</h2>

        <div className="candidate-list">
          { choices }
        </div>

        <Row>
          <Col xs={12}>
            <Button bsStyle="primary" bsSize="large"
              disabled={this.props.loading || !this.props.selected}
              onClick={this.props.onConfirm} block>
              { btn_content }
            </Button>
          </Col>
        </Row>
      </Panel>
    );
  }
}
BallotForm.propTypes = {
  loading: PropTypes.bool.isRequired,
  selected: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
}

export default class BallotContainer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      selected: null
    };

    this._onSelect  = this._onSelect.bind(this);
    this._onConfirm = this._onConfirm.bind(this);
  }

  render() {
    return <BallotForm loading={this.state.loading}
      selected={this.state.selected}
      onSelect={this._onSelect}
      onConfirm={this._onConfirm}/>;
  }

  _onSelect(code) {
    if (!this.state.loading) {
      this.setState({
        selected: code
      });
    }
  }

  _onConfirm() {
    if (this.state.selected) {
      const ballot = new Ballot({choice: this.state.selected});

      if (ballot.validate()) {
        this.props.onSubmit(ballot).then(() => {
          this.setState({
            loading: false,
            selected: null
          });
        });

        this.setState({ loading: true });
      } else {
        console.error("invalid candidate selected");
      }
    }
  }
}
BallotContainer.propTypes = {
  onSubmit: PropTypes.func.isRequired
}
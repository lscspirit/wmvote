"use strict";

import React from "react";
import { Row, Col, Panel } from "react-bootstrap";
import randomColor from "randomcolor";

import Candidate from "~/models/candidate";
import ServerClient from "~/client/helpers/server_client";
import WebSocketClient from "~/client/helpers/websocket_client";
import lightbox from "~/client/components/lightbox";
import { CandidateResult, RecentVoteChart } from "~/client/components/result";

export default class ResultAppContainer extends React.PureComponent {
  constructor(props) {
    super(props);

    // generate a color scheme for candidates
    const colors = randomColor({
      count: Candidate.all.length,
      luminosity: "dark"
    });
    const color_scheme = Candidate.all.reduce((scheme, c, index) => {
      scheme[c.code] = colors[index];
      return scheme;
    }, {});

    this.state = {
      lightbox: null,
      live_counts:   null,
      recent_counts: null,
      color_scheme: color_scheme
    };
  }

  componentWillMount() {
    const live_prom   = ServerClient.getLiveCounts();
    const recent_prom = ServerClient.getRecentCounts();

    Promise.all([live_prom, recent_prom]).then(results => {
      // subscribe to live updates
      this.subscription = WebSocketClient.subscribe("/updates", data => {
        this.setState({
          live_counts:   data.live_counts,
          recent_counts: data.recent_counts
        });
      });

      // update state with the results
      this.setState({
        live_counts:   results[0],
        recent_counts: results[1]
      });
    }, error => {
      this.setState({
        live_counts:   {},
        recent_counts: {},
        lightbox: <LbComp
          lbMsgStyle="danger"
          lbMessage="Unable to load results"
          onClose={this._onLbClose}/>
      });
    });
  }

  componentWillUnmount() {
    if (this.subscription) WebSocketClient.unsubscribe(this.subscription);
  }

  render() {
    let total_votes  = 0;
    let total_recent = 0;

    const dataset = Candidate.all.map(c => {
      const live = this.state.live_counts && this.state.live_counts.hasOwnProperty(c.code) ?
        this.state.live_counts[c.code] : null;
      const recent = this.state.recent_counts && this.state.recent_counts.hasOwnProperty(c.code) ?
        this.state.recent_counts[c.code] : null;
      const color = this.state.color_scheme[c.code];

      total_votes  += live || 0;
      total_recent += recent || 0;

      return {
        liveCount:   live,
        recentCount: recent,
        color:       color
      };
    });

    const individuals = Candidate.all.map((c, index) => {
      return <CandidateResult key={c.code} candidate={c}
        liveCount={dataset[index].liveCount} liveTotal={total_votes}
        recentCount={dataset[index].recentCount} recentTotal={total_recent}
        color={dataset[index].color}/>;
    });

    return (
      <Row>
        <Col sm={10} smOffset={1} md={8} mdOffset={2}>
          { this.state.lightbox }
          <Panel className="wm-vote-result">
            <Row>
              <Col sm={4} className="count-panel">
                <h3>Total Votes</h3>
                { individuals }
              </Col>
              <Col sm={8} className="chart-panel">
                <h3>Recent Vote Distribution</h3>
                {
                  this.state.recent_counts ? (
                    <RecentVoteChart candidates={Candidate.all}
                      counts={this.state.recent_counts}
                      colorScheme={this.state.color_scheme}/>
                  ) : null
                }
              </Col>
            </Row>
          </Panel>
        </Col>
      </Row>
    );
  }
}


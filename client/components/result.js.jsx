"use strict";

import React from "react";
import PropTypes from "prop-types";
import { defaults, Polar } from "react-chartjs-2";

import Candidate from "~/models/candidate";

defaults.global.responsive = true;

export class CandidateResult extends React.PureComponent {
  render() {
    const liveCount   = this.props.liveCount   === null ? '--' : this.props.liveCount;
    const recentCount = this.props.recentCount === null ? '--' : this.props.recentCount;

    let livePercent   = this.props.liveTotal > 0 && liveCount ?
      liveCount / this.props.liveTotal : null;
    let recentPercent = this.props.recentTotal > 0 && recentCount ?
      recentCount / this.props.recentTotal : null;

    // round the percents
    if (livePercent)   livePercent   = Math.round(livePercent * 1000) / 10;
    if (recentPercent) recentPercent = Math.round(recentPercent * 1000) / 10;

    const style = {
      backgroundColor: this.props.color
    };

    return (
      <div className="candidate-result" style={style}>
        <div className="name">{this.props.candidate.name}</div>
        <div className="live-count">{liveCount}</div>
        <div className="live-percent">{livePercent ? `${livePercent}%` : null}</div>
        <div className="recent-count">
          Recent: {recentCount} {recentPercent ? `(${recentPercent}%)` : null}
        </div>
      </div>
    );
  }
}
CandidateResult.propTypes = {
  candidate:   PropTypes.instanceOf(Candidate).isRequired,
  liveCount:   PropTypes.number,
  recentCount: PropTypes.number,
  liveTotal:   PropTypes.number,
  recentTotal: PropTypes.number,
  color: PropTypes.string.isRequired
}

export class RecentVoteChart extends React.PureComponent {
  render() {
    const colors = [];
    const counts = this.props.candidates.map(c => {
      const count = this.props.counts[c.code] || 0;
      colors.push(this.props.colorScheme[c.code]);
      return count;
    });

    const data = {
      datasets: [{
        data: counts,
        backgroundColor: colors
      }]
    };

    console.log(data);

    return (
      <div>
        <Polar data={data} height={300}/>
      </div>
    )
  }
}
RecentVoteChart.propTypes = {
  candidates:  PropTypes.arrayOf(PropTypes.instanceOf(Candidate)).isRequired,
  counts:      PropTypes.objectOf(PropTypes.number).isRequired,
  colorScheme: PropTypes.objectOf(PropTypes.string).isRequired
}
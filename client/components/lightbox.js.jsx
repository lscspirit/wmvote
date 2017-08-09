"use strict";

import React from "react";
import PropTypes from "prop-types";
import { Panel, Alert, Button } from "react-bootstrap";

/**
 * Lightbox Higher-order components
 *
 * @param  {[type]} ContentComponent lightbox content
 * @return {React.PureComponent} a wrapped component
 */
export default function lightbox(ContentComponent) {
  const LB = class extends React.PureComponent {
    render() {
      const { lbMessage, onClose, ...other } = this.props;
      const message = lbMessage ? (
        <Alert bsStyle={ this.props.lbMsgStyle || "info" }>
          { lbMessage }
        </Alert>
      ) : null;

      return (
        <div className="wm-lightbox">
          <Panel className="wm-lightbox-panel">
            { message }
            { ContentComponent ? <ContentComponent {...other}/> : null }
            <div className="panel-actions">
              <Button onClick={ onClose } bsStyle="primary" bsSize="large">Close</Button>
            </div>
          </Panel>
        </div>
      );
    }
  };
  LB.propTypes = {
    lbMessage:  PropTypes.string,
    lbMsgStyle: PropTypes.string,
    onClose: PropTypes.func.isRequired
  };
  LB.displayName = "Lightbox";

  return LB;
}

import React, { Component } from 'react';
import {
  SimpleButton
} from '@terrestris/react-geo';

export class Download extends Component {
render() {
  return(
    <div>
    <a href={this.props.gpx} download="yourroute.gpx">
    <SimpleButton
    className="ant-btn-dashed start-btn"
    icon="download"
    /></a><br />
    </div>
    )
  }
}

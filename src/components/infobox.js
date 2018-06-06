import React, { Component } from 'react';
import './../assets/App.css';
import { Download } from './download';
import {
  Panel
} from '@terrestris/react-geo';

export class Infobox extends Component {
  render() {
    return(
    <Panel
      style={{position: 'fixed'}}
      x={100}
      y={20}
      className="infobox"
    >
    {this.props.message}
    <div>
    {!this.props.DLisHidden && <Download gpx={this.props.gpx}/>}
    {this.props.RouteLength}
    </div>
      </Panel>
    )
  }
}

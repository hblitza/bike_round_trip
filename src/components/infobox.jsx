import React, { Component } from 'react';
import './../assets/App.css';
import { Download } from './download';

export class Infobox extends Component {
  render() {
    return(
    <div
      style={{position: 'fixed', top: 20, left: 100}}
      class="infobox"
    >
    {this.props.message}
    <div>
    {!this.props.DLisHidden && <Download gpx={this.props.gpx}/>}
    {this.props.RouteLength}
    </div>
      </div>
    )
  }
}

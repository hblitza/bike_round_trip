import React, { Component } from 'react';
import './../assets/App.css';
import {
  SimpleButton
} from '@terrestris/react-geo';

export class Compass extends Component {
  constructor(props) {
     super(props);
     this.state = {
       DistanceisHidden: true,
       bearing: 0
     }
     const compass = require('./../assets/compass.png');
     const arrow = require('./../assets/arrow.png');
     this.compass = compass;
     this.arrow = arrow;
   }

  onSelectBearing() {
    this.props.selectBearing(this.state.bearing)
  }

  getBearing (evt) {
    let p1 = {
      x: evt.clientX,
      y: window.innerHeight - evt.clientY
    };
    let p2 = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    }
    var angle = Math.atan2( (p2.x-p1.x),(p2.y-p1.y)) * 180 / Math.PI;
    this.setState({bearing: angle + 180});
  };

  render() {
    //wip, translate of needle
    const deg = 'rotate(' + this.state.bearing + 'deg)';
    return(
      <div
        className="compass">
        <img
          src={ this.compass }
          onMouseMove={(evt) => this.getBearing(evt)}
          onClick={this.onSelectBearing.bind(this)}
          alt="compass"
        />
        <img
          className="needle"
          src={ this.arrow }
          style={{'pointer-events': 'none', transform: deg}}
          alt="needle"
        />
        <SimpleButton
        className="ant-btn-circle close-btn-compass"
        onClick={this.props.hideArrows}
        tooltip="Close"
        tooltipPlacement="right"
        >
        <p className="dot"/>
        </SimpleButton>

      </div>
    )
  }
}

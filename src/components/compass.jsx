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
    const deg = 'rotate(' + this.state.bearing + 'deg)';
    return(
      <div>
        <img
          src={ this.compass }
          style={{opacity: 1, position: 'fixed', top: (window.innerHeight / 2 - 200), left: (window.innerWidth / 2 - 200)}}
          onMouseMove={(evt) => this.getBearing(evt)}
          onClick={this.onSelectBearing.bind(this)}
          alt="compass"
        />
        <img
          src={ this.arrow }
          style={{'pointer-events': 'none', transform: deg, position: 'fixed', top: (window.innerHeight / 2 - 105), left: (window.innerWidth / 2 - 8.5)}}
          alt="needle"
        />
        <SimpleButton
        className="ant-btn-circle"
        style={{position: 'fixed', top: (window.innerHeight/ 2 - 165), right: (window.innerWidth / 2 - 165)}}
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

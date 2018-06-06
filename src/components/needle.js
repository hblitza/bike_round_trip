import React, { Component } from 'react';
import './../App.css';

export class Needle extends Component {
  constructor(props) {
     super(props);
     const arrow = require('./../arrow.png');
     this.arrow = arrow;
   }

  componentWillReceiveProps() {
    //console.log(this.props.bearing)
  }

  render() {
    const deg = 'rotate(' + this.props.bearing + 'deg)';
    return(
      <div>
        <img
          src={ this.arrow }
          style={{transform: deg, position: 'absolute', top: (window.innerHeight / 2 - 98), left: (window.innerWidth / 2 - 11)}}
          onClick={() => alert(this.props.bearing)}
        />
      </div>
    )
  }
}

import React, { Component } from 'react';
import './../assets/App.css';
import racer from './../assets/racer.svg';
import biketour from './../assets/biketour.svg';
import hiking from './../assets/hiking.svg';
import {
  SimpleButton
} from '@terrestris/react-geo';

export class Profile extends Component {
  constructor(props) {
     super(props);
     this.state = {
       DistanceisHidden: true,
       Profile: ''
     }

   }

   selectProfile(value) {
     this.props.selectProfile(value);
   }

  render() {
    return(
    <div
      className="chooseProfile"
    >
    <SimpleButton
      className="profileButton"
      tooltip="racer"
      tooltipPlacement="left"
      onClick={() => this.selectProfile('cycling-road')}
    >
    <img
    src={racer}
    alt="racebike"
    className="profileIcon"
    width="70"
    />
    </SimpleButton>
    <SimpleButton
      className="profileButton"
      tooltip="biketour"
      tooltipPlacement="top"
      onClick={() => this.selectProfile('cycling-tour')}
    >
    <img
    src={biketour}
    alt="biketour"
    className="profileIcon"
    width="70"
    />
    </SimpleButton>
    <SimpleButton
      className="profileButton"
      tooltip="hiking"
      tooltipPlacement="right"
      onClick={() => this.selectProfile('foot-hiking')}
    >
    <img
    src={hiking}
    alt="hiking"
    className="profileIcon"
    width="70"
    />
    </SimpleButton>
      </div>
    )
  }
}

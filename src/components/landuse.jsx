import React, { Component } from 'react';
import './../assets/App.css';
import forest from './../assets/forest.svg';
import river from './../assets/river.svg';
import {
  SimpleButton
} from '@terrestris/react-geo';

export class ChooseLanduse extends Component {
  constructor(props) {
     super(props);
     this.state = {
       DistanceisHidden: true,
       Landuse: ''
     }

   }

   selectLanduse(value) {
     this.props.selectLanduse(value);
   }

  render() {
    return(
    <div
      className="chooseLanduse"
    >
    <SimpleButton
      className="forestButton"
      tooltip="thorugh the forest"
      tooltipPlacement="left"
      onClick={() => this.selectLanduse('forest')}
    >
    <img
    src={forest}
    alt="racebike"
    className="profileIcon"
    width="70"
    />
    </SimpleButton>
    <SimpleButton
      className="riverButton"
      tooltip="along the river"
      tooltipPlacement="right"
      onClick={() => this.selectLanduse('river')}
    >
    <img
    src={river}
    alt="biketour"
    className="profileIcon"
    width="70"
    />
    </SimpleButton>
      </div>
    )
  }
}

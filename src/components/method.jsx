import React, { Component } from 'react';
import './../assets/App.css';
import {
  SimpleButton
} from '@terrestris/react-geo';

export class Method extends Component {
  constructor(props) {
     super(props);
     this.state = {
       DistanceisHidden: true,
       Method: ''
     }

   }

   selectMethod(value) {
     this.props.selectMethod(value);
   }

  render() {
    return(
    <div
      className="chooseMethod"
    >
    <SimpleButton
      size="large"
      className="methodButton"
      onClick={() => this.selectMethod('directionandDistance')}
    >
    Route by direction and distance
    </SimpleButton><br/><br/>
    <SimpleButton
      size="large"
      className="methodButton"
      onClick={() => this.selectMethod('landuse')}
    >
    Route by favourite landuse (beta)
    </SimpleButton>
      </div>
    )
  }
}

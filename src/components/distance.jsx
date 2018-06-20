import React, { Component } from 'react';
import './../assets/App.css';
import {
  SimpleButton
} from '@terrestris/react-geo';
import { Slider, Row, Col, InputNumber } from 'antd';
import 'antd/dist/antd.less';
export class Distance extends Component {
  constructor(props) {
    super(props)
    this.state = {
      distance: 50
    }
  }

  onAfterChange (value) {
    this.setState({
      distance: value
    }, this.selectDistance);
  }

  selectDistance () {
    this.props.selectDistance(this.state.distance)
  }

  onChange = (value) => {
  this.setState({
    distance: value
  })
};

  render() {
    return(
      <div class="distancerange">
      <p>How far do you wanna go? [km]</p>
          <Row>
          <Col span={12}>
          <Slider
              max={150}
              min={10}
              step={5}
              onChange={this.onChange}
              value={this.state.distance}
              />
          </Col>
          <Col span={4}>
          <InputNumber
            min={10}
            max={150}
            step={5}
            style={{ width: "65px", marginLeft: 16 }}
            value={this.state.distance}
            onChange={this.onChange}
          />
          </Col>
          <Col span={2} />
          <Col span={4}>
          <SimpleButton
          className="toolbar-btn"
          style={{ marginLeft: 16 }}
          onClick={this.selectDistance.bind(this)}
          >Go
          </SimpleButton>
          </Col>
          </Row>
      </div>
    )
  }
}

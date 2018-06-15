import React, { Component } from 'react';
import './../assets/App.css';
import {
  SimpleButton
} from '@terrestris/react-geo';

export class Imprint extends Component {
  render() {
    return(
      <div>
    <div
      style={{position: 'fixed', top: (window.innerHeight / 2 - 400), left: (window.innerWidth / 2 - 250)}}
      className="imprint"
    ><h2>Imprint and legal notes</h2><p/>
    This application has been build in the context of an internship at terrestris GmbH in Bonn, Germany.
    The main object was to get an insight into open source WebGIS tools and open geodata.<br/><br/>
    <h3>Used Tools, Libraries and Services</h3>
    <ul>
    <li>PostgreSQL</li>
    <li>imposm3</li>
    <li>Geoserver</li>
    <li>Maputnik</li>
    <li>Mapproxy</li>
    <li>Openlayers</li>
    <li>react-geo</li>
    <li>turf.js</li>
    <li>API of openrouteservice</li>
    </ul>
    <h3>Graphics</h3>
    <ul>
    <li>Compass by <a href="https://thenounproject.com/search/?q=compass&i=25128">André Luiz</a></li>
    <li>Bike by <a href="https://thenounproject.com/search/?q=bike&i=1304526">Sewon Park</a></li>
    </ul>
    <h3>Legal Notes</h3>
    Privacy Policy of <a href="https://www.terrestris.de">terrestris:</a><a href="https://www.terrestris.de/en/datenschutzerklaerung/"> English</a>;
    <a href="https://www.terrestris.de/datenschutzerklaerung/"> German </a><br/><br/>
    <h3>Contact Person</h3>
    blitza(ät)terrestris.de
      </div>
        <div>
        <SimpleButton
        className="ant-btn-circle"
        style={{margin: 5, position: 'fixed', top: (window.innerHeight / 2 - 400), right: (window.innerWidth / 2 - 250)}}
        onClick={this.props.hideImprint}
        tooltip="Close"
        tooltipPlacement="right"
        >
        <p className="dot"/>
        </SimpleButton>
        </div>
      </div>
    )
  }
}

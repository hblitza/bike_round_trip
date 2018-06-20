import React, { Component } from 'react';
import './../assets/App.css';
import {
  SimpleButton
} from '@terrestris/react-geo';

export class Imprint extends Component {
  render() {
    return(
    <div
      className="imprint"
    >
    <SimpleButton
    className="ant-btn-circle close-btn"
    onClick={this.props.hideImprint}
    tooltip="Close"
    tooltipPlacement="right"
    >
    <p className="dot"/>
    </SimpleButton>
    <h2>Imprint and legal notes</h2><p/>
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
    )
  }
}

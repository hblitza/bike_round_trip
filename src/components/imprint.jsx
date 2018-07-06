import React, { Component } from 'react';
import './../assets/App.css';
import {
  SimpleButton
} from '@terrestris/react-geo';
import Obfuscate from 'react-obfuscate';

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
    <li><a href="https://www.postgresql.org/">PostgreSQL</a></li>
    <li><a href="https://github.com/omniscale/imposm3">imposm3</a></li>
    <li><a href="http://geoserver.org/">Geoserver</a></li>
    <li><a href="https://github.com/maputnik/editor">Maputnik</a></li>
    <li><a href="https://mapproxy.org/">Mapproxy</a></li>
    <li><a href="https://openlayers.org/">Openlayers</a></li>
    <li><a href="https://github.com/terrestris/react-geo">react-geo</a></li>
    <li><a href="https://www.turfjs.org/">turf.js</a></li>
    <li><a href="https://www.openrouteservice.org/">API of openrouteservice</a></li>
    <li><a href="http://actinia.mundialis.de/">actinia API by mundialis</a></li>
    </ul>
    <h3>Graphics</h3>
    <ul>
    <li>Compass by <a href="https://thenounproject.com/search/?q=compass&i=25128">André Luiz</a></li>
    <li>Racing cycle by <a href="https://thenounproject.com/search/?q=bike&i=1304526">Sewon Park</a></li>
    <li>Forest by <a href="https://thenounproject.com/search/?q=forest&i=867264">Pablo Rozenberg</a></li>
    <li>River by <a href="https://thenounproject.com/search/?q=river&i=1639586">BomSymbols, TH</a></li>
    <li>Hiker by <a href="https://thenounproject.com/search/?q=hiker&i=31779">Lius Prado</a></li>
    <li>Biker by <a href="https://thenounproject.com/search/?q=biker&i=655697">Frederico Panzano</a></li>
    </ul>
    <h3>Legal Notes</h3>
    Privacy Policy of <a href="https://www.terrestris.de">terrestris:</a><a href="https://www.terrestris.de/en/datenschutzerklaerung/"> English</a>;
    <a href="https://www.terrestris.de/datenschutzerklaerung/"> German </a><br/><br/>
    <h3>Contact Person</h3>
    <Obfuscate
      email="info@terrestris.de"
      headers={{
        subject: '[Bike Roundtrip Planner] Question'
      }}
    />
        </div>
    )
  }
}

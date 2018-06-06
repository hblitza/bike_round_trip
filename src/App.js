import React, { Component } from 'react';
import {
  SimpleButton,
  GeoLocationButton,
  MapComponent,
  NominatimSearch,
  Panel,
  ToggleButton
} from '@terrestris/react-geo';
//import styles
import {
  ptorange,
  routeStyle,
  ptred } from './utilities/styles';
import './assets/App.css';
import 'ol/ol.css';
import '../node_modules/antd/dist/antd.css'
import 'ol-ext/control/Profil.css';
//import ol modules
import OlSourceVector from 'ol/source/vector';
import OlLayerVector from 'ol/layer/vector';
import OlFormatGPX from 'ol/format/gpx';
import OlProjection from 'ol/proj';
import OlFormatGeoJSON from 'ol/format/geojson';
import OlInteractionModify from 'ol/interaction/modify';
import OlFeature from 'ol/feature';
import OlGeomPoint from 'ol/geom/point';
//import map_config
import {
  map,
  hillshade
} from './map_config';
//import children components
import { Infobox } from './components/infobox';
import { Arrows } from './components/arrows';
import { Distance } from './components/distance';
import ol_control_Profil from 'ol-ext/control/Profile';
//import utilities
import { NewPoint, NewRoute, dialogue, Turf } from './utilities/util.js';

class App extends Component {
  constructor(props) {
     super(props);
     this.state = {
       isHidden: false,
       DLisHidden: true,
       ArrowisHidden: true,
       DistanceisHidden: true,
       RouteLength: "",
       Profile: 'cycling-tour'
     }
  }

  toggleProfile () {
    if (this.state.Profile === 'cycling-tour') {
      this.setState({Profile: 'foot-hiking'})
    } else {this.setState({Profile: 'cycling-tour'})}
  }
  toggleInfobox () {
    this.setState({
      isHidden: !this.state.isHidden,
      message: dialogue[0]
    })
  }
  setMessage (n) {
    this.setState({
      isHidden: true,
      message: dialogue[n]
    })
  }
toggleLayer (layer) {
  if (layer.getVisible() === false) {
    layer.setVisible(true);
  } else {
    layer.setVisible(false);
  }
}

handleBearing (bearing) {
  this.setState({
    bearing: bearing,
    ArrowisHidden:true,
    DistanceisHidden: false,
    message: dialogue[5]
    });
}

handleDistance (distance) {
  this.setState({
    distance: distance,
    DistanceisHidden: true
  }, this.calcCircleTurf);
}

hideArrows () {
  this.setState({
    ArrowisHidden: true
  })
}

//octa
octa (startpt) {
  this.setState({startcoordinate:startpt, ArrowisHidden:false})
}
calcCircleTurf () {
  const circle = Turf.calcCircle(this.state.startcoordinate, this.state.bearing, this.state.distance);
  const geojsonformat = new OlFormatGeoJSON();
  let circlewaypoints = [];
  circle.forEach(function(item) {
    circlewaypoints.push(geojsonformat.readFeature(item, {dataProjection: 'EPSG:4326',featureProjection: 'EPSG:3857'}));
  });
  this.circleSource.addFeatures(circlewaypoints);
  NewRoute.calcRoute(this.directionsVectorSource, this.directionsVectorLayer, this.circleSource, this.state.Profile);
  this.setState({message:dialogue[4]})
  const modifyFeaturesC = new OlInteractionModify({
    source: this.circleSource,
    style: ptorange
  });
  map.addInteraction(modifyFeaturesC);
  modifyFeaturesC.on('modifyend', () => {
    this.directionsVectorSource.clear();
    NewRoute.calcRoute(this.directionsVectorSource, this.directionsVectorLayer, this.circleSource, this.state.Profile)
  })
}

geolocate() {
  let geoX = map.getOverlays().getArray()[0].getPosition()[0];
  let geoY = map.getOverlays().getArray()[0].getPosition()[1];
  let geolocatecoordinate = [geoX,geoY];
  NewPoint.addPoint(this.WaypointsSource, this.WaypointsLayer, geolocatecoordinate);
  this.setState({coordinate:geolocatecoordinate});
}

clearmap () {
  this.profilePoint.setGeometry(new OlGeomPoint([0,0]));
  map.removeControl(this.Profile);
  this.directionsVectorSource.clear();
  this.circleSource.clear();
  this.setState({message:dialogue[0],DLisHidden:true,isHidden:false,ArrowisHidden:true,DistanceisHidden:true,RouteLength:""});
  let geolocateoverlay = map.getOverlays().getArray()[0];
  map.removeOverlay(geolocateoverlay);
  this.WaypointsSource.clear();
}

componentDidMount() {
  const waypointsSource = new OlSourceVector({});
  const waypointsLayer = new OlLayerVector({
    source: waypointsSource,
    style: ptorange
  });
  const circleSource = new OlSourceVector({});
  const circlewaypointsLayer = new OlLayerVector({
    source: circleSource,
    style: ptorange
  });
  const directionssrc = new OlSourceVector({});
  const directionsLayer = new OlLayerVector({
    source: directionssrc,
    style: routeStyle
  });
  const userPositionSource = new OlSourceVector({});
  const userPositionLayer = new OlLayerVector({
    source: userPositionSource,
    style: ptred
  });

  const profilePointSource = new OlSourceVector({});
  const profilePointLayer = new OlLayerVector({
    source: profilePointSource,
    style: ptred
  });

  const profile = new ol_control_Profil({});
  this.Profile = profile;
  this.directionsVectorSource = directionssrc;
  this.directionsVectorLayer = directionsLayer;
  this.WaypointsSource = waypointsSource;
  this.WaypointsLayer = waypointsLayer;
  this.circleSource = circleSource;
  this.circlewaypointsLayer = circlewaypointsLayer;
  this.profilePointSource = profilePointSource;
  this.profilePointLayer = profilePointLayer;

  const profilePoint = new OlFeature(new OlGeomPoint([0,0]));
  this.profilePoint = profilePoint;
  this.profilePointSource.addFeature(this.profilePoint);

  map.addLayer(waypointsLayer);
  map.addLayer(directionsLayer);
  map.addLayer(userPositionLayer);
  map.addLayer(circlewaypointsLayer);
  map.addLayer(this.profilePointLayer);

  //on.click
  map.on('click', (evt) => {
    this.circleSource.clear();
    this.directionsVectorSource.clear();
    NewPoint.addPoint(waypointsSource, waypointsLayer, evt.coordinate);
    this.setState({coordinate:evt.coordinate});
  })
  const vectorsrc = map.getLayers().getArray()[2].getSource();
  // on.addFeature function
  vectorsrc.on('addfeature', (event) => {
    event.target.refresh();
    const n_features = event.target.getFeatures();
    if (n_features.length === 1) {
      this.directionsVectorSource.clear();
      this.setMessage(2);
      const startpt = OlProjection.toLonLat(event.target.getFeatures()[0].getGeometry().getCoordinates())
      this.octa(startpt);
    } else if (n_features.length === 2) {
      this.setMessage(3);
      this.setState({ArrowisHidden:true})
    } else if (n_features.length === 3) {
      this.setMessage(4);
      NewRoute.calcRoute(directionssrc, directionsLayer, vectorsrc, this.state.Profile);
    } else if (n_features.length > 3 && n_features.length <= 6) {
      NewRoute.calcRoute(directionssrc, directionsLayer, vectorsrc, this.state.Profile);
    } else if (n_features.length > 6) {
      //
    }
  });
  const routesrc = map.getLayers().getArray()[3].getSource();
  waypointsSource.on('addfeature', (evt) => {
    const modifyFeatures = new OlInteractionModify({
      source: waypointsLayer.getSource(),
      style: ptorange
    });
    modifyFeatures.on('modifyend', () => {
      NewRoute.calcRoute(directionssrc, directionsLayer, vectorsrc, this.state.Profile)
    })
    map.addInteraction(modifyFeatures);
  })
  routesrc.on('addfeature', (event) => {
    map.addControl(profile);
    const gpx = new OlFormatGPX().writeFeatures(event.target.getFeatures(), {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    const href = 'data:text/json;charset=utf-8,' + gpx;
    this.setState({gpx:href,DLisHidden:false})
    this.setState({RouteLength:event.target.getFeatures()[0].getId()})
    profile.setGeometry(event.target.getFeatures()[0])
    profile.show();
    profile.on('over', (e) => {
      this.profilePoint.setGeometry(new OlGeomPoint(e.coord));
    })
    profile.on('out', (e) => {
      this.profilePoint.setGeometry(new OlGeomPoint([0,0]));
    })
  })
}

  render() {
    return (
      <div className="App">
      <MapComponent
        map={map}
        style={{height: window.innerHeight}}
      />
{this.state.isHidden && <Infobox  RouteLength={this.state.RouteLength} message={this.state.message} gpx={this.state.gpx} DLisHidden={this.state.DLisHidden} DistanceisHidden={this.state.DistanceisHidden}/>}
<Panel
  style={{position: 'fixed'}}
  x={20}
  y={20}
>
<SimpleButton
  className="toolbar-btn"
  icon="info"
  onClick={this.toggleInfobox.bind(this)}
/><br />
<ToggleButton
  className="toolbar-btn"
  icon="bicycle"
  pressedIcon="male"
  onToggle={() => this.toggleProfile()}
  tooltip="Choose type of locomotion"
  tooltipPlacement="right"
/><br />
<GeoLocationButton
    className="toolbar-btn"
    onGeolocationChange={() => this.geolocate()}
    map={map}
    showMarker={true}
    follow={true}
    tooltip="Geolocate"
    tooltipPlacement="right"
>
  <i class="fa fa-location-arrow"></i>
</GeoLocationButton>
<ToggleButton
  className="toolbar-btn"
  icon="eye"
  pressedIcon="eye-slash"
  onToggle={() => this.toggleLayer(hillshade)}
/><br />
<SimpleButton
  className="toolbar-btn"
  icon="trash"
  onClick={() => this.clearmap()}
/><br />
<NominatimSearch
    map={map}
    size= "large"
    style={{
      width: '80%'
    }}
    countrycodes="de"
    viewbox="5.8663152875603828,50.3225669900622137,9.4617416224757260,52.5314922619894915"
/>
<br />
</Panel>
{!this.state.ArrowisHidden && <Arrows
                                  selectBearing={this.handleBearing.bind(this)}
                                  ArrowisHidden={this.state.ArrowisHidden}
                                  hideArrows={this.hideArrows.bind(this)}
                                  />}
{!this.state.DistanceisHidden && <Distance
                                        selectDistance={this.handleDistance.bind(this)}
                                        DistanceisHidden={this.state.DistanceisHidden}
                                  />}
      </div>
    );
  }
}
export default App;

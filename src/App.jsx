import React, { Component } from 'react';
import {
  SimpleButton,
  GeoLocationButton,
  MapComponent,
  NominatimSearch,
  Panel
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
import OlInteractionSelect from 'ol/interaction/select';
import OlFeature from 'ol/feature';
import OlGeomPoint from 'ol/geom/point';
import OlEventsCondition from 'ol/events/condition';
//import map_config
import {
  map,
  hillshade
} from './map_config';
//import children components
import { Infobox } from './components/infobox';
import { Imprint } from './components/imprint';
import { Compass } from './components/compass';
import { Distance } from './components/distance';
import ol_control_Profil from 'ol-ext/control/Profile';
//import utilities
import { NewPoint, NewRoute, dialogue, Turf } from './utilities/util.js';

class App extends Component {
  constructor(props) {
     super(props);
     this.state = {
       isHidden: true,
       DLisHidden: true,
       ArrowisHidden: true,
       DistanceisHidden: true,
       ImprintisHidden: true,
       RouteLength: "",
       Profile: 'cycling-tour',
       profileIcon: "bicycle",
       hillshadeIcon: "eye-slash",
       ftcount: 0,
       nominatimDisplay: "none",
       contextmenuDisplay: "none",
       contextmenuDeleteDisplay: "none",
       contextmenuText: "Set start"
     }
  }

  toggleProfile () {
    if (this.state.Profile === "cycling-tour") {
      this.setState({Profile: "foot-hiking", profileIcon: "male"})
    } else {
      this.setState({Profile: "cycling-tour", profileIcon: "bicycle"})
      }
  }
  toggleInfobox () {
    this.setState({
      isHidden: !this.state.isHidden,
      message: dialogue[0]
    })
  }
  toggleImprint () {
    this.setState({
      ImprintisHidden: !this.state.ImprintisHidden
    })
  }
  setMessage (n) {
    this.setState({
      isHidden: false,
      message: dialogue[n]
    })
  }
toggleLayer (layer) {
  if (layer.getVisible() === false) {
    layer.setVisible(true);
    this.setState({hillshadeIcon: "eye-slash"})
  } else {
    layer.setVisible(false);
    this.setState({hillshadeIcon: "eye"})
  }
}

toggleNominatim () {
  if (this.state.nominatimDisplay === "none") {
    this.setState({nominatimDisplay: "block"})
  } else {
    this.setState({nominatimDisplay: "none"})
  }
};

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
hideImprint () {
  this.setState({
    ImprintisHidden: true
  })
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
  this.setState({message:dialogue[4]});
  this.WaypointsSource.clear();
}

geolocate() {
  let geoX = map.getOverlays().getArray()[0].getPosition()[0];
  let geoY = map.getOverlays().getArray()[0].getPosition()[1];
  let geolocatecoordinate = [geoX,geoY];
  NewPoint.addPoint(this.WaypointsSource, this.WaypointsLayer, geolocatecoordinate, this.state.ftcount);
  this.setState({coordinate:geolocatecoordinate});
}

clearmap () {
  this.profilePoint.setGeometry(new OlGeomPoint([0,0]));
  map.removeControl(this.Profile);
  this.directionsVectorSource.clear();
  this.circleSource.clear();
  this.setState({contextmenuText: "Set start", contextmenuDisplay: "none", ftcount: 0, message:dialogue[0],ImprintisHidden:true,DLisHidden:true,isHidden:true,ArrowisHidden:true,DistanceisHidden:true,RouteLength:""});
  let geolocateoverlay = map.getOverlays().getArray()[0];
  map.removeOverlay(geolocateoverlay);
  this.WaypointsSource.clear();
}

contextmenuAddpoint () {
  this.setState({contextmenuDisplay: "none", contextmenuText: "Add waypoint"});
  NewPoint.addPoint(this.WaypointsSource, this.WaypointsLayer, this.state.contextmenuCoord, this.state.ftcount);
}

//WIP missing layer filter function
contextmenuDeletepoint () {
  const ftDelete = map.getFeaturesAtPixel([this.state.contextmenuX, this.state.contextmenuY]);
  console.log(ftDelete);
  this.WaypointsSource.removeFeature(ftDelete[3]);
  this.setState({contextmenuDeleteDisplay: "none"})
};

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

  const setstart = (e) => {
    this.circleSource.clear();
    this.directionsVectorSource.clear();
    NewPoint.addPoint(waypointsSource, waypointsLayer, e.coordinate, this.state.ftcount);
    this.setState({coordinate:e.coordinate, contextmessage1: "Add waypoint", ftcount: this.state.ftcount + 1});
  }

  map.addLayer(waypointsLayer);
  map.addLayer(directionsLayer);
  map.addLayer(userPositionLayer);
  map.addLayer(circlewaypointsLayer);
  map.addLayer(this.profilePointLayer);

  //on.click
  map.on('click', (evt) => {
    this.setState({ coordinate:evt.coordinate, ftcount: this.state.ftcount + 1 });
    this.circleSource.clear();
    this.directionsVectorSource.clear();
    NewPoint.addPoint(waypointsSource, waypointsLayer, evt.coordinate, this.state.ftcount);
    this.setState({});
  })

  //rightclick
  map.getViewport().addEventListener('contextmenu', (evt) => {
    evt.preventDefault();
    const contextmenuCoord = map.getCoordinateFromPixel([evt.x, evt.y]);
    const ftDelete = map.getFeaturesAtPixel([evt.x, evt.y], {});
    this.setState({contextmenuCoord: contextmenuCoord, contextmenuX:evt.x, contextmenuY:evt.y});
    if (ftDelete) {
      this.setState({contextmenuText: "Delete Feature", contextmenuDeleteDisplay: "block"});
    } else {
    this.setState({ftcount: this.state.ftcount + 1, contextmenuDisplay: "block"});
    }
});

  // on.addFeature function
  waypointsSource.on('addfeature', (event) => {
    event.target.refresh();
    const n_features = event.target.getFeatures();
    if (n_features.length === 1) {
      this.directionsVectorSource.clear();
      this.setMessage(2);
      const startpt = OlProjection.toLonLat(event.target.getFeatures()[0].getGeometry().getCoordinates());
      this.setState({startcoordinate:startpt, ArrowisHidden:false});
    } else if (n_features.length === 2) {
      this.setMessage(3);
      this.setState({ArrowisHidden:true})
    } else if (n_features.length === 3) {
      this.setMessage(4);
      NewRoute.calcRoute(directionssrc, directionsLayer, waypointsSource, this.state.Profile);
    } else if (n_features.length > 3) {
      NewRoute.calcRoute(directionssrc, directionsLayer, waypointsSource, this.state.Profile);
    }
  });

  directionssrc.on('addfeature', (event) => {
    map.addControl(profile);
    const gpx = new OlFormatGPX().writeFeatures(event.target.getFeatures(), {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    const href = 'data:text/json;charset=utf-8,' + gpx;
    this.setState({gpx:href,DLisHidden:false});
    this.setState({RouteLength:event.target.getFeatures()[0].getId()});
    profile.setGeometry(event.target.getFeatures()[0]);
    profile.show();
    profile.on('over', (e) => {
      this.profilePoint.setGeometry(new OlGeomPoint(e.coord));
    })
    profile.on('out', (e) => {
      this.profilePoint.setGeometry(new OlGeomPoint([0,0]));
    })
  })
  //set interactions
  const hoverInteraction = new OlInteractionSelect({
    condition: OlEventsCondition.pointerMove,
    layers: [waypointsLayer, circlewaypointsLayer]
  });
  map.addInteraction(hoverInteraction);

  hoverInteraction.on('select', (e) => {
    const modifyFeatures = new OlInteractionModify({
      source: waypointsSource
    });
    map.addInteraction(modifyFeatures);
    modifyFeatures.on('modifyend', (evt) => {
      if (waypointsSource.getFeatures().length > 2) {
        const wpFeatures = waypointsSource.getFeatures();
        // sort array to avoid messy routes
        wpFeatures.sort(function (a,b) {
          if (a.id_ > b.id_) { //getid
            return 1
          }
          if (a.id_ < b.id_) {
            return -1;
          }
          return 0
        });
        waypointsSource.clear();
        waypointsSource.addFeatures(wpFeatures);
        NewRoute.calcRoute(directionssrc, directionsLayer, waypointsSource, this.state.Profile);
      }
    });
    const modifyFeatures2 = new OlInteractionModify({
      source: circleSource
    });
    map.addInteraction(modifyFeatures2);
    modifyFeatures2.on('modifyend', (evt) => {
      const circleSourceFeatures = circleSource.getFeatures();
      // sort array to avoid messy routes
      circleSourceFeatures.sort(function (a,b) {
        if (a.ol_uid > b.ol_uid) {
          return 1
        }
        if (a.ol_uid < b.ol_uid) {
          return -1;
        }
        return 0
      });
      circleSource.clear();
      circleSource.addFeatures(circleSourceFeatures);
      NewRoute.calcRoute(directionssrc, directionsLayer, circleSource, this.state.Profile);
    })
  })
};

  render() {
    return (
      <div className="App">
      <MapComponent
        map={map}
        style={{height: window.innerHeight}}
      />
{!this.state.isHidden &&
  <Infobox
    RouteLength={this.state.RouteLength}
    message={this.state.message}
    gpx={this.state.gpx}
    DLisHidden={this.state.DLisHidden}
    DistanceisHidden={this.state.DistanceisHidden}
  />}
  {!this.state.ImprintisHidden &&
    <Imprint
    hideImprint={this.hideImprint.bind(this)}
    />}
    <div
      style={{display: this.state.contextmenuDisplay, position: 'fixed', top: this.state.contextmenuY-12, left: this.state.contextmenuX+10}}
      >
    <SimpleButton
    className="contextmenu"
    onClick={() => this.contextmenuAddpoint()}
    >{this.state.contextmenuText}
    </SimpleButton>
    </div>
    <div
      style={{display: this.state.contextmenuDeleteDisplay, position: 'fixed', top: this.state.contextmenuY-12, left: this.state.contextmenuX+10}}
      >
    <SimpleButton
    className="contextmenuDelete"
    onClick={() => this.contextmenuDeletepoint()}
    >{this.state.contextmenuText}
    </SimpleButton>
    </div>
<div
  style={{position: 'fixed', top: 20, left: 20}}
>
<SimpleButton
  className="toolbar-btn"
  icon="info"
  onClick={this.toggleInfobox.bind(this)}
/><br />
<SimpleButton
  className="toolbar-btn"
  icon={this.state.profileIcon}
  onClick={() => this.toggleProfile()}
  tooltip="Choose type of locomotion"
  tooltipPlacement="right"
/><br />
<GeoLocationButton
    className="toolbar-btn"
    onGeolocationChange={() => this.geolocate()}
    map={map}
    showMarker={true}
    follow={true}
    tooltip="Geolocate, WIP currently not working"
    tooltipPlacement="right"
>
  <i className="fa fa-location-arrow"></i>
</GeoLocationButton>
<SimpleButton
  className="toolbar-btn"
  icon={this.state.hillshadeIcon}
  onClick={() => this.toggleLayer(hillshade)}
  tooltip="Toggle hillshade"
  tooltipPlacement="right"
/><br />
<SimpleButton
  className="toolbar-btn"
  icon="search"
  onClick={() => this.toggleNominatim()}
/><br />
<SimpleButton
  className="toolbar-btn"
  icon="trash"
  onClick={() => this.clearmap()}
/><br />
<NominatimSearch
    className=""
    map={map}
    size= "large"
    style={{
      width: '80%',
      display: this.state.nominatimDisplay
    }}
    countrycodes="de"
    viewbox="5.8663152875603828,50.3225669900622137,9.4617416224757260,52.5314922619894915"
/>
<br />
</div>
<div
  style={{position: 'fixed', bottom: 20, left: 20}}
>
<SimpleButton
  className="imprint-btn"
  onClick={this.toggleImprint.bind(this)}
>Imprint
</SimpleButton>
</div>
{!this.state.ArrowisHidden &&
    <Compass
        selectBearing={this.handleBearing.bind(this)}
        ArrowisHidden={this.state.ArrowisHidden}
        hideArrows={this.hideArrows.bind(this)}
    />}
{!this.state.DistanceisHidden &&
    <Distance
        selectDistance={this.handleDistance.bind(this)}
        DistanceisHidden={this.state.DistanceisHidden}
    />}
      </div>
    );
  }
}
export default App;

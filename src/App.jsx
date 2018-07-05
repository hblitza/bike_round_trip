import React, { Component } from 'react';
import {
  SimpleButton,
  MapComponent,
  NominatimSearch
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
import OlGeolocation from 'ol/geolocation';
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
import { Profile } from './components/profile';
import { Method } from './components/method.jsx';
import { ChooseLanduse } from './components/landuse.jsx';
import { DGM1 } from './utilities/dgm1';
import ol_control_Profil from 'ol-ext/control/Profile';
import ElevationProfile from './components/ElevationProfile/ElevationProfile';
//import utilities
import { NewPoint, dialogue } from './utilities/util.js';
import { Openrouteservice } from './utilities/openrouteservice.js';
import { GISTools } from './utilities/gistools.js';
import { Landuse } from './utilities/landuse.js';

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
       hillshadeIcon: "eye-slash",
       ftcount: 0,
       turfCount: 0,
       nominatimDisplay: "none",
       contextmenuDisplay: "none",
       contextmenuDeleteDisplay: "none",
       contextmenuText: "Set start",
       windowInnerHeight: window.innerHeight,
       geolocate: 0,
       contextmenuY: 0,
       contextmenuX: 0,
       ProfileisHidden: true,
       MethodisHidden: true,
       LanduseisHidden: true
     }
    window.onresize = this.onWindowResize.bind(this);
  }

  onWindowResize (event) {
    this.setState({windowInnerHeight: event.target.innerHeight});
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

toggleProfile () {
  if (this.state.ProfileisHidden === true) {
  this.setState({ProfileisHidden:false,isHidden: false,message: dialogue[5]});
} else {
  this.setState({ProfileisHidden:true});
}
}

toggleNominatim () {
  if (this.state.nominatimDisplay === "none") {
    this.setState({nominatimDisplay: "block", isHidden: true})
  } else {
    this.setState({nominatimDisplay: "none"})
  }
};

handleBearing (bearing) {
  this.setState({
    bearing: bearing,
    ArrowisHidden: true,
    DistanceisHidden: false,
    message: dialogue[6]
    });
}

handleProfile (profile) {
  this.setState({
    isHidden: true,
    Profile: profile,
    ProfileisHidden: true
  });
}

handleMethod (method) {
  if (method === 'directionandDistance') {
    this.setState({MethodisHidden:true,ArrowisHidden:false})
  } else if (method === 'landuse') {
    this.setMessage(8);
    this.setState({MethodisHidden:true,LanduseisHidden:false})
  };
}

handleLanduse (landuse) {
  console.log(this.state.coordinate);
  this.setState({LanduseisHidden:true})
  if (landuse === 'forest') {
    Landuse.forest(this.state.coordinate, this.landuseSource, this.WaypointsSource);
  } else if (landuse === 'river') {
    Landuse.waterways(this.state.coordinate, this.landuseSource, this.WaypointsSource);
  }
};

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
  this.WaypointsSource.clear({fast: true});
  this.directionsVectorSource.clear();
  const circle = GISTools.calcCircle(this.state.startcoordinate, this.state.bearing, this.state.distance);
  const geojsonformat = new OlFormatGeoJSON();
  let circlewaypoints = [];
  circle.forEach((item) => {
    circlewaypoints.push(geojsonformat.readFeature(item, {dataProjection: 'EPSG:4326',featureProjection: 'EPSG:3857'}));
  });
  circlewaypoints.forEach((item, i) => {
    item.setId(i+1);
  });
  this.setState({ArrowisHidden:true});
  this.WaypointsSource.addFeatures(circlewaypoints);
}

geolocate() {
  const geolocation = new OlGeolocation({
    projection: map.getView().getProjection(),
    tracking: true
  });
  geolocation.on('change', (e) => {
    // TODO accuracy problem
    const userPosition = e.target.getPosition();
    this.setState({ftcount: this.state.ftcount + 1});
    NewPoint.addPoint(this.WaypointsSource, this.WaypointsLayer, userPosition, this.state.ftcount);
  });
  }

clearmap () {
  this.WaypointsSource.clear({fast: true});
  this.directionsVectorSource.clear();
  this.circleSource.clear();
  this.profilePoint.setGeometry(new OlGeomPoint([0,0]));
  map.removeControl(this.Profile);
  this.setState({contextmenuText: "Set start",
                  coordinate: '',
                  contextmenuDeleteDisplay: "none",
                  contextmenuDisplay: "none",
                  ftcount: 0,
                  turfCount: 0,
                  message:dialogue[0],
                  ImprintisHidden:true,
                  DLisHidden:true,
                  isHidden:true,
                  ArrowisHidden:true,
                  DistanceisHidden:true,
                  RouteLength:"",
                  nominatimDisplay: "none",
                  ProfileisHidden: true,
                  MethodisHidden: true,
                  LanduseisHidden: true
                });
  let geolocateoverlay = map.getOverlays().getArray()[0];
  map.removeOverlay(geolocateoverlay);
}

contextmenuAddpoint () {
  this.setState({contextmenuDisplay: "none", contextmenuText: "Add waypoint"});
  NewPoint.addPoint(this.WaypointsSource, this.WaypointsLayer, this.state.contextmenuCoord, this.state.ftcount);
}

//WIP missing layer filter function
contextmenuDeletepoint () {
  const pixel = [this.state.contextmenuX, this.state.contextmenuY];
  const features = [];
  const layers = [];
  map.forEachFeatureAtPixel(pixel, function(feature, layer) {
          layers.push(layer);
          features.push(feature);
        }, {
          layerFilter: function (layer) {
            return layer.get("deleteable") === true;
          }
        });
  const source = layers[0].getSource();
  source.removeFeature(features[0]);
  this.setState({contextmenuDeleteDisplay: "none", ftcount: this.state.ftcount - 2});
};

componentDidMount() {
  const waypointsSource = new OlSourceVector({});
  const waypointsLayer = new OlLayerVector({
    source: waypointsSource,
    style: ptorange
  });
  waypointsLayer.set("deleteable", true);
  const circleSource = new OlSourceVector({});
  const circlewaypointsLayer = new OlLayerVector({
    id: 11,
    source: circleSource,
    style: ptorange
  });
  circlewaypointsLayer.set("deleteable", true);
  const directionssrc = new OlSourceVector({});
  const directionsLayer = new OlLayerVector({
    source: directionssrc,
    style: routeStyle
  });
  const userPositionSource = new OlSourceVector({});
  const userPositionLayer = new OlLayerVector({
    id: "deleteable",
    source: userPositionSource,
    style: ptred
  });

  const profilePointSource = new OlSourceVector({});
  const profilePointLayer = new OlLayerVector({
    source: profilePointSource,
    style: ptred
  });

  const landuseSource = new OlSourceVector({});
  this.landuseSource = landuseSource;
  const landuseLayer = new OlLayerVector({
      source: landuseSource
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

  this.landuseLayer = landuseLayer;
  map.addLayer(waypointsLayer);
  map.addLayer(directionsLayer);
  map.addLayer(userPositionLayer);
  map.addLayer(circlewaypointsLayer);
  map.addLayer(profilePointLayer);
  //map.addLayer(landuseLayer);

  //on.click
  map.on('click', (evt) => {
    //Landuse.waterways(evt.coordinate, this.landuseSource, this.WaypointsSource);

    this.setState({ coordinate:evt.coordinate, ftcount: this.state.ftcount + 1, contextmenuText: "Add waypoint", nominatimDisplay: "none" });
    this.circleSource.clear();
    this.directionsVectorSource.clear();
    NewPoint.addPoint(waypointsSource, waypointsLayer, evt.coordinate, this.state.ftcount);

  })

  //rightclick
  map.getViewport().addEventListener('contextmenu', (evt) => {
    evt.preventDefault();
    const n_features = this.WaypointsSource.getFeatures().length;
    if (n_features === 0) {
      this.setState({contextmenuText: "Set Start"});
    } else {
      this.setState({contextmenuText: "Add waypoint"});
    }
    const contextmenuCoord = map.getCoordinateFromPixel([evt.x, evt.y]);
    const ftDelete = map.getFeaturesAtPixel([evt.x, evt.y], {});
    this.setState({coordinate: contextmenuCoord, contextmenuCoord: contextmenuCoord, contextmenuX:evt.x, contextmenuY:evt.y, nominatimDisplay: "none"});
    if (ftDelete) {
      this.setState({contextmenuText: "Delete Feature", contextmenuDeleteDisplay: "block"});
    } else {
      this.setState({ftcount: this.state.ftcount + 1, contextmenuDisplay: "block"});
    }
});

  // on.addFeature function
  waypointsSource.on(['addfeature', 'removefeature'], (event) => {
    const n_features = event.target.getFeatures().length;
    if (n_features === 0) {
      this.directionsVectorSource.clear();
      this.setState({DLisHidden: true, ArrowisHidden:true, RouteLength: ""});
      this.setMessage(0);
      this.profilePoint.setGeometry(new OlGeomPoint([0,0]));
      map.removeControl(this.Profile);
    } else if (n_features === 1) {
      this.profilePoint.setGeometry(new OlGeomPoint([0,0]));
      map.removeControl(this.Profile);
      map.removeOverlay(map.getOverlays().getArray()[0]);
      this.directionsVectorSource.clear();
      this.setMessage(7);
      const startpt = OlProjection.toLonLat(event.target.getFeatures()[0].getGeometry().getCoordinates());
      this.setState({contextmenuText: "Add waypoint", startcoordinate:startpt, MethodisHidden:false, DLisHidden: true, RouteLength: ""});
      this.profilePoint.setGeometry(new OlGeomPoint([0,0]));
    } else if (n_features === 2) {
      this.directionsVectorSource.clear();
      this.setMessage(3);
      this.setState({DLisHidden: true, RouteLength: "", ArrowisHidden:true, MethodisHidden:true});
      this.profilePoint.setGeometry(new OlGeomPoint([0,0]));
      map.removeControl(this.Profile);
    } else if (n_features > 2 && n_features < 8) {
      this.setMessage(4);
      Openrouteservice.calcRoute(directionssrc, directionsLayer, waypointsSource, this.state.Profile);
    } else if (n_features === 5 && event.feature.getId() === 10) {
      Openrouteservice.calcRoute(directionssrc, directionsLayer, waypointsSource, this.state.Profile);
      this.setMessage(4);
    } else if (n_features === 8 && event.feature.getId() === 10) {
      Openrouteservice.calcRoute(directionssrc, directionsLayer, waypointsSource, this.state.Profile);
      this.setMessage(4);
    } else if (n_features === 9 && event.feature.getId() === 1) {
      Openrouteservice.calcRoute(directionssrc, directionsLayer, waypointsSource, this.state.Profile);
      this.setMessage(4);
    }
  });

  directionssrc.on('addfeature', (event) => {
    const coordinates3d = event.target.getFeatures()[0].getGeometry().getCoordinates();
    const lineLength = event.target.getFeatures()[0].getGeometry().getLength();
    this.setState({coordinates3d:coordinates3d,lineLength:lineLength});
    map.addControl(profile);
    const gpx = new OlFormatGPX().writeFeatures(event.target.getFeatures(), {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    const href = 'data:text/json;charset=utf-8,' + gpx;
    this.setState({gpx:href,DLisHidden:false,RouteLength:event.target.getFeatures()[0].getId()});
    //check dgmSource
    const dgmSource = event.target.getFeatures()[0].get('dgm');
    if (dgmSource === 'dgm1') {
      this.setMessage(9);
    }
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
          if (a.getId() > b.getId()) {
            return 1
          }
          if (a.getId() < b.getId()) {
            return -1;
          }
          return 0
        });
        waypointsSource.clear({fast: true});
        waypointsSource.addFeatures(wpFeatures);
        directionssrc.clear();
        Openrouteservice.calcRoute(directionssrc, directionsLayer, waypointsSource, this.state.Profile);
      }
    });
  })
};

  render() {

    const {
      coordinates3d,
      loading,
      lineLength
    } = this.state;

    return (
      <div className="App">
      <MapComponent
        map={map}
        style={{height: this.state.windowInnerHeight}}
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
  className="toolbar"
>
<SimpleButton
  className="toolbar-btn"
  icon="info"
  onClick={this.toggleInfobox.bind(this)}
/><br />
<SimpleButton
    className="toolbar-btn"
    onClick={() => this.geolocate()}
    tooltip="Set your position as start"
    tooltipPlacement="right"
    >
  <i className="fa fa-location-arrow"></i>
</SimpleButton><br/>
<SimpleButton
  className="toolbar-btn"
  icon={this.state.hillshadeIcon}
  onClick={() => this.toggleLayer(hillshade)}
  tooltip="Toggle hillshade"
  tooltipPlacement="right"
/><br />
<SimpleButton
  className="toolbar-btn"
  icon="bicycle"
  onClick={this.toggleProfile.bind(this)}
  tooltip="Set method of locomotion"
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
/><br/>
</div>
<div
  className="nominatim"
  >
  <NominatimSearch
      className="nominatim"
      map={map}
      size= "large"
      style={{
        width: '80%',
        display: this.state.nominatimDisplay
      }}
      countrycodes="de"
      viewbox="5.8663152875603828,50.3225669900622137,9.4617416224757260,52.5314922619894915"
  />
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
{!this.state.ProfileisHidden &&
    <Profile
      selectProfile={this.handleProfile.bind(this)}
      ProfileisHidden={this.state.DistanceisHidden}
    />}
{!this.state.MethodisHidden &&
        <Method
          selectMethod={this.handleMethod.bind(this)}
        />}
{!this.state.LanduseisHidden &&
                <ChooseLanduse
                  selectLanduse={this.handleLanduse.bind(this)}
                />}
    <div
    className="ElevationProfile"
    >
    {/*
    <ElevationProfile
    height="150"
    width="300"
    elevationData={coordinates3d}
    lineLength={lineLength}
    intersectPoints={coordinates3d}
  />*/}
  </div>
    </div>
    );
  }
}
export default App;

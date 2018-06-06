import OlGeomPoint from 'ol/geom/point';
import OlFeature from 'ol/feature';
import OlFormatGeoJSON from 'ol/format/geojson';
import OlProjection from 'ol/proj';
import * as turf from '@turf/turf';

export class ORSurl {
  static geturl(locations, profile) {
    const baseurl = 'https://api.openrouteservice.org/';
    const service = 'directions';
    const apikey = '58d904a497c67e00015b45fc36af243b98be4646aa542fbd0d9d95de';
    const continue_straight = 'true';
    const orsurl = baseurl + service + '?coordinates=' + locations + '&profile=' + profile +
    '&continue_straight' + continue_straight + '&geometry_format=geojson&elevation=true&instructions=false&api_key=' + apikey;
    return orsurl;
  }
}

export class NewPoint {
  static addPoint(waypointsSource, waypointsLayer, clickCoordinate) {
    let clickCoordinatePoint = new OlGeomPoint(clickCoordinate);
    let waypointsFeature = new OlFeature();
    waypointsFeature.setGeometry(clickCoordinate ?
      clickCoordinatePoint : null);
    waypointsSource.addFeature(waypointsFeature);
  }
}

export class NewRoute {
static calcRoute(directionssrc, directionsLayer, event, profile) {
  const vectorSource = event;
    const dgeom = [];
    vectorSource.getFeatures().forEach(function(item) {
      dgeom.push(OlProjection.toLonLat(item.getGeometry().getCoordinates()) + '|')
    });
    dgeom.push(OlProjection.toLonLat(vectorSource.getFeatures()[0].getGeometry().getCoordinates()));
    const locations = dgeom.join("");
    const orsurl = ORSurl.geturl(locations, profile);
    fetch(orsurl).then(function (response) {
      return response.json();
    }).then(function (json) {
      directionssrc.clear();
      const summary = json.routes[0].summary.distance/1000;
      const summaryde = summary.toLocaleString('en-GB', { maximumFractionDigits: 2});
      const directions = new OlFormatGeoJSON().readFeatures(json.routes[0].geometry, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });
      directions[0].setId(summaryde + ' km');
      directionssrc.addFeature(directions[0]);
    });
  }

static calcRouteCircle(directionssrc, directionsLayer, event, profile) {
const vectorSource = event;
  const dgeom = [];
  vectorSource.getFeatures().forEach(function(item) {
    dgeom.push(OlProjection.toLonLat(item.getGeometry().getCoordinates()) + '|')
  });
  dgeom.push(OlProjection.toLonLat(vectorSource.getFeatures()[0].getGeometry().getCoordinates()));
  const locations = dgeom.join("");
  const orsurl = ORSurl.geturl(locations, profile);
  fetch(orsurl).then(function (response) {
    return response.json();
  }).then(function (json) {
    directionssrc.clear();
    const summary = json.routes[0].summary.distance/1000;
    const summaryde = summary.toLocaleString('en-GB', { maximumFractionDigits: 2});
    const directions = new OlFormatGeoJSON().readFeatures(json.routes[0].geometry, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    directions[0].setId(summaryde + ' km');
    directionssrc.addFeature(directions[0]);
  });
}
}

export const dialogue = [
  "Fancy for a nice bike tour but no clue where to go? Use this tool to plan your round trip. Click on the map or geolocate your current position to start.",
  "Click on the map or geolocate your current position to start.",
  "Ok, that's your startpoint. Add at least two more waypoints or choose a direction.",
  "Add at least one more waypoint.",
  "That's your route. You can keep on adding waypoints or download the route.",
  "Choose your preferred distance."
];

export class Turf {
  static calcCircle (startcoordinate, bearing, distance) {
    let radius = 0.7 * distance / (2 * Math.PI);
    let ptStart = turf.point(startcoordinate);
    let options = {units: 'kilometers'};
    let optionsCircle = {steps: 8, units: 'kilometers'};
    let ptCenter = turf.destination(ptStart, radius, bearing, options);
    let circle = turf.circle(ptCenter, radius, optionsCircle);
    const destination = [];
    //destination.push(ptStart);
    circle.geometry.coordinates[0].forEach(function(item) {
      destination.push(turf.point(item));
    });

    //reordering the array -- to be improved
    //move array element function
    Array.prototype.move = function (from, to) {
      this.splice(to, 0, this.splice(from, 1)[0]);
    };

    function repeat(func, times) {
        func();
        --times && repeat(func, times);
    }

    if (bearing > 292.5 && bearing < 337.5) { //NW
      const times = 5;
      repeat(function () { destination.move(0,8) }, times);
    } else if (bearing > 247.5 && bearing < 292.5) {  //W
      const times = 6;
      repeat(function () { destination.move(0,8) }, times);
    } else if (bearing > 202.5 && bearing < 247.5) { // SW
      const times = 7;
      repeat(function () { destination.move(0,8) }, times);
    } else if (bearing > 112.5 && bearing < 157.5) { //S
      const times = 1;
      repeat(function () { destination.move(0,8) }, times);
    } else if (bearing > 67.5 && bearing < 112.5) { //SE
      const times = 2;
      repeat(function () { destination.move(0,8) }, times);
    } else if (bearing > 22.5 && bearing < 67.5) { //E
      const times = 3;
      repeat(function () { destination.move(0,8) }, times);
    } else if (bearing > 292.5 || bearing < 22.5) { //NE
      const times = 4;
      repeat(function () { destination.move(0,8) }, times);
    }
    destination[0] = ptStart;
    destination[8] = ptStart;
    return destination
  }
}

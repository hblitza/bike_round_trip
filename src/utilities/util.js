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
  static addPoint(waypointsSource, waypointsLayer, clickCoordinate, count) {
    let clickCoordinatePoint = new OlGeomPoint(clickCoordinate);
    let waypointsFeature = new OlFeature();
    waypointsFeature.setGeometry(clickCoordinate ?
      clickCoordinatePoint : null);
    waypointsFeature.setId(count);
    if (count < 8) {
    waypointsSource.addFeature(waypointsFeature);
  } else {
    alert('Maximum number of waypoints reached.')
  }
  }
}

export class NewRoute {
static calcRoute(directionssrc, directionsLayer, event, profile) {
    const vectorSource = event;
    const n_features = event.getFeatures().length;
    const dgeom = [];
    vectorSource.getFeatures().forEach(function(item) {
      dgeom.push(OlProjection.toLonLat(item.getGeometry().getCoordinates()) + '|')
    });
    if (n_features < 9) {
    dgeom.push(OlProjection.toLonLat(vectorSource.getFeatures()[0].getGeometry().getCoordinates()));
    }
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
    const radius = 0.7 * distance / (2 * Math.PI);
    const ptStart = turf.point(startcoordinate);
    const options = {units: 'kilometers'};
    const optionsCircle = {steps: 8, units: 'kilometers'};
    const ptCenter = turf.destination(ptStart, radius, bearing, options);
    const circle = turf.circle(ptCenter, radius, optionsCircle);
    const destination = [];
    //destination.push(ptStart);
    circle.geometry.coordinates[0].forEach(function(item) {
      destination.push(turf.point(item));
    });
    //reordering the array clockwise
    //turf creates a circle counterclockwise
    //depending on the bearing
    //move array element function
    destination.splice(8);

    function repeat(func, times) {
        func();
        --times && repeat(func, times);
    }

    function move(array) {
      const cut = array.shift();
      array.push(cut);
    }
    if (bearing > 112.5 && bearing < 157.5) { //SE
      move(destination);
    } else if (bearing > 67.5 && bearing < 112.5) { //E
      repeat(function () { move(destination) }, 2);
    } else if (bearing > 22.5 && bearing < 67.5) { //NE
      repeat(function () { move(destination) }, 3);
    } else if (bearing > 337.5 || bearing < 22.5) { //N
      repeat(function () { move(destination) }, 4);
    } else if (bearing > 292.5 && bearing < 337.5) { //NW
      repeat(function () { move(destination) }, 5);
    } else if (bearing > 247.5 && bearing < 292.5) {  //W
      repeat(function () { move(destination) }, 6);
    } else if (bearing > 202.5 && bearing < 247.5) { // SW
      repeat(function () { move(destination) }, 7);
    }
    destination[0] = ptStart;
    destination[8] = ptStart;
    return destination
  }
}

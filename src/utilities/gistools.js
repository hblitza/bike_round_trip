import OlProj from 'ol/proj';
import * as turf from '@turf/turf';

export class GISTools {
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
  };

  static pointsWithinPolygon(directions) {
    const olLineCoords = [];
    olLineCoords.push(directions.getGeometry().getCoordinates());
    olLineCoords[0].forEach((item) => {
      item.pop();
    });
    // check if route geometry is within the dgm1 mask
    const dgm1vectordata = require('./../assets/dgm_mask_4326.json');
    const dgm1Mask = turf.feature(dgm1vectordata.features[0].geometry);
    const olLineCoords4326 = [];
    olLineCoords[0].forEach((i) => {
      olLineCoords4326.push(OlProj.toLonLat(i))
    });
    const featureCollection = turf.featureCollection(olLineCoords4326);
    const ptsWithin = turf.pointsWithinPolygon(featureCollection, dgm1Mask);
    if (ptsWithin.features.length === olLineCoords4326.length) {
      return true
    } else {
      return false
    }
  };
}

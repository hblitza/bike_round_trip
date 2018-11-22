import OlGeomPoint from 'ol/geom/point';
import OlFeature from 'ol/feature';
import OlFormatGeoJSON from 'ol/format/geojson';
import OlProj from 'ol/proj';
import * as turf from '@turf/turf';
import { GISTools } from './gistools';
import { DGM1 } from './dgm1';

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

export const dialogue = [
  "Fancy for a nice bike tour but no clue where to go? Use this tool to plan your round trip. Click on the map or geolocate your current position to start.",
  "Click on the map or geolocate your current position to start.",
  "Ok, that's your startpoint. Add at least two more waypoints or choose a direction.",
  "Add at least one more waypoint.",
  "That's your route. You can keep on adding waypoints or download the route.",
  "Choose your preferred method of locomotion.",
  "Choose your preferred distance.",
  "Choose a routing method.",
  "Forest oder river?",
  "That's your route. You can keep on adding waypoints or download the route. \n Height accuracy: +/- 20cm (DGM1 NRW)"
];

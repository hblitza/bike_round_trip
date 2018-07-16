import OlFormatGeoJSON from 'ol/format/geojson';
import OlProj from 'ol/proj';
import { GISTools } from './gistools';
import { DGM1 } from './dgm1';

export class Openrouteservice {
  static geturl(locations, profile) {
    const baseurl = 'https://api.openrouteservice.org/';
    const service = 'directions';
    const apikey = '58d904a497c67e00015b45fc36af243b98be4646aa542fbd0d9d95de';
    const continue_straight = 'true';
    const orsurl = baseurl + service + '?coordinates=' + locations + '&profile=' + profile +
    '&continue_straight' + continue_straight + '&geometry_format=geojson&elevation=true&instructions=false&api_key=' + apikey;
    return orsurl;
  };

  static calcRoute(directionssrc, directionsLayer, event, profile) {
      const vectorSource = event;
      const n_features = event.getFeatures().length;
      const dgeom = [];
      vectorSource.getFeatures().forEach(function(item) {
        dgeom.push(OlProj.toLonLat(item.getGeometry().getCoordinates()) + '|')
      });
      if (n_features < 9) {
      dgeom.push(OlProj.toLonLat(vectorSource.getFeatures()[0].getGeometry().getCoordinates()));
      }
      const locations = dgeom.join("");
      const orsurl = Openrouteservice.geturl(locations, profile);
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
        const checkDGM = GISTools.pointsWithinPolygon(directions[0]);
        if (checkDGM === true) {
          DGM1.getdgm(directions[0], directionssrc, summaryde)
        } else if (checkDGM === false) {
        directionssrc.addFeature(directions[0]);
      }
      });
    }
}

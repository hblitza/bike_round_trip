import OlFormatGeoJSON from 'ol/format/geojson';
import * as turf from '@turf/turf';
import OlProj from 'ol/proj';
import forest from './../assets/forest_landuse_gen_gt_3m_4326.json';
import waterways from './../assets/waterways_nrw_gen.json';

export class Landuse {
  static forest(startcoordinate, landuseSource, waypointsSource) {
    const startcoordinate4326 = OlProj.toLonLat(startcoordinate);
    const start = turf.point(startcoordinate4326);
    const ptWithinNRW = Landuse.ptWithinNRW(start);
    if (ptWithinNRW === false) {
      alert('This feature is only available in NRW')
    } else {

    const geom = forest;
    const landuseFeature = new OlFormatGeoJSON().readFeatures(geom, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    landuseSource.addFeatures(landuseFeature);

    const closestFeature = landuseSource.getClosestFeatureToCoordinate(startcoordinate); //id 222
    const closestFeatureIndex = closestFeature.getProperties().id - 1;
    const closestFeatureTurf = geom.features[closestFeatureIndex];
    const center = turf.center(closestFeatureTurf);
    const features = turf.featureCollection([
          start,
          center
        ]);
    const midpoint = turf.center(features);
    const distance = turf.distance(start,center);
    const bearing = turf.bearing(start,center);
    const options = {units: 'kilometers'};
    const poi1 = turf.destination(midpoint, distance*0.3, bearing-90, options);
    const poi2 = turf.destination(midpoint, distance*0.3, bearing+90, options);
    const rhomb = [];
    rhomb.push(start,poi1,center,poi2,start);
    const geojsonformat = new OlFormatGeoJSON();
    const rhombwaypoints = [];
    rhomb.forEach((item) => {
      rhombwaypoints.push(geojsonformat.readFeature(item, {dataProjection: 'EPSG:4326',featureProjection: 'EPSG:3857'}));
    });
    rhombwaypoints.forEach((item, i) => {
      item.setId(i+10);
    });
    waypointsSource.addFeatures(rhombwaypoints);
  }
}
static pointsAlongLine(linestring, start, options) {
  const nearestPoint = turf.nearestPointOnLine(linestring, start, options);
  const lineCoords = linestring.coordinates;
  const lineFeatures = [];
  lineCoords.forEach((i) => {
    lineFeatures.push(turf.point(i));
  });
  const nearestPointIndex = nearestPoint.properties.index;
  const splitLineCoords = [];
  lineFeatures.forEach((item, index) => {
    if (index > nearestPointIndex) {
      splitLineCoords.push(item.geometry.coordinates)
    }
  });
  const splitLine = turf.lineString(splitLineCoords, {name: 'splitted Line'});
  const length = turf.length(splitLine.geometry, options);
  const distance = 2.5;
  const alongPoints = [];
  alongPoints.push(turf.point(splitLine.geometry.coordinates[0]));
  for (let i = 1; i <= length / distance; i++) {
  const turfPoint = turf.along(splitLine, i * distance, options);
  alongPoints.push(turfPoint);
  }
  return alongPoints
}
static waterways(startcoordinate, landuseSource, waypointsSource) {
  const options = {units: 'kilometers'};
  const startcoordinate4326 = OlProj.toLonLat(startcoordinate);
  const start = turf.point(startcoordinate4326);
  const ptWithinNRW = Landuse.ptWithinNRW(start);
  if (ptWithinNRW === false) {
    alert('This feature is only available in NRW');
  } else {

  const geom = waterways;
  const landuseFeature = new OlFormatGeoJSON().readFeatures(geom, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
  });
  landuseSource.addFeatures(landuseFeature);
  const closestFeature = landuseSource.getClosestFeatureToCoordinate(startcoordinate);
  const closestFeatureIndex = closestFeature.getProperties().id - 1;
  const closestFeatureTurf = geom.features[closestFeatureIndex];
  const nearestPoint = turf.nearestPointOnLine(closestFeatureTurf.geometry, start, options);
  const bearing = turf.bearing(start.geometry,nearestPoint.geometry);
  const alongPoints = [];
  closestFeatureTurf.geometry.coordinates.forEach((i, index) => {
    if (index > (nearestPoint.properties.index - 3) && index < (nearestPoint.properties.index + 3) ) {
    alongPoints.push(turf.point(i))
  };
  });
  const alongPointsTranslated = Landuse.translatePoints(alongPoints, bearing);
  const rhomb = [];
  rhomb.push(start);
  alongPoints.forEach((i) => {
    rhomb.push(i)
  })
  rhomb.push(start);

  const geojsonformat = new OlFormatGeoJSON();
  const rhombwaypoints = [];
  rhomb.forEach((item) => {
    rhombwaypoints.push(geojsonformat.readFeature(item, {dataProjection: 'EPSG:4326',featureProjection: 'EPSG:3857'}));
  });
  rhombwaypoints.forEach((item, i) => {
    item.setId(i+10);
  });
  waypointsSource.addFeatures(rhombwaypoints);
  }
}
static translatePoints(points, bearing) {
  const pointsTranslated = [];
  points.forEach((i) => {
    pointsTranslated.push(turf.transformTranslate(i.geometry, 0.1, bearing*-1))
  });
  return pointsTranslated
}
static LineStringBearing(linestring) {
  const length = linestring.geometry.coordinates.length;
  const p1 = turf.point(linestring.geometry.coordinates[0]);
  const p2 = turf.point(linestring.geometry.coordinates[length-1]);
  const bearing = turf.bearing(p1,p2);
  return bearing
}
static ptWithinNRW(point) {
  const nrwData = require('./../assets/nrw_gen.json');
  const nrwMask = turf.feature(nrwData.features[0].geometry);
  const ptsWithin = turf.pointsWithinPolygon(point, nrwMask);
  if (ptsWithin.features.length ===1) {
    return true
  } else {
    return false
  }
}
};

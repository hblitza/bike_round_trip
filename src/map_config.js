import OlMap from 'ol/map';
import OlView from 'ol/view';
import OlLayerImage from 'ol/layer/image';
import OlLayerTile from 'ol/layer/tile';
import OlSourceImageWMS from 'ol/source/imagewms';
import OlControl from 'ol/control';
import OlAttribution from 'ol/attribution';
import OlSourceOSM from 'ol/source/osm';
import 'ol-ext/control/Profil.css';

const dgmNRWcached = new OlLayerImage({
  source: new OlSourceImageWMS({
    url: 'http://10.133.7.105:8081/service',
    params: {'LAYERS': 'nw_dgm-schummerung_pan_ne', 'VERSION': '1.1.1'},
    ratio: 1,
    serverType: 'geoserver',
    attributions: [
          new OlAttribution({
            html: 'Höhenmodell: <a href="https://open.nrw/dataset/0c6796e5-9eca-4ae6-8b32-1fcc5ae5c481bkg">GeobasisNRW </a>' +
              'dl-de/by-2-0'
            })]
          })
});

const osm = new OlLayerTile({
  source: new OlSourceOSM()
});

const bikestyle = new OlLayerImage({
  source: new OlSourceImageWMS({
    url: 'http://10.133.7.105:8081/service',
    params: {'LAYERS': 'osm_styling', 'VERSION': '1.1.1'},
    ratio: 1,
    serverType: 'geoserver',
    attributions: [
      new OlAttribution({
        html: 'Mapdata: © ' +
            '<a href="https://www.openstreetmap.org/copyright/en">OpenStreetMap</a> contributors; ' +
            'Routing: ' +
                '<a href="https://openrouteservice.org/">openrouteservice</a>'
      })
    ]
  })
});

export const dgmNRW = new OlLayerImage({
  source: new OlSourceImageWMS({
    url: 'http://www.wms.nrw.de/geobasis/wms_nw_dgm-schummerung',
    params: {'layers':'nw_dgm-schummerung_pan_ne'},
    attributions: [
          new OlAttribution({
            html: 'Höhenmodell: <a href="https://open.nrw/dataset/0c6796e5-9eca-4ae6-8b32-1fcc5ae5c481bkg">GeobasisNRW </a>' +
              'dl-de/by-2-0'
            })]
          })
});

//Set layers
//const basemap = bikestyle;
//export const hillshade = dgmNRWcached;
const basemap = osm;
export const hillshade = dgmNRW;

const center = [ 788453.4890155146, 6573085.729161344 ];

export const map = new OlMap({
  controls: OlControl.defaults({zoom: false}),
  view: new OlView({
    center: center,
    zoom: 11,
  })
});

map.addLayer(basemap);
hillshade.setVisible(true);
map.addLayer(hillshade);
const setBlendModeFromSelect = function(evt) {
  evt.context.globalCompositeOperation = 'hard-light';
};

const bindLayerListeners = function(layer) {
  layer.on('precompose', setBlendModeFromSelect);
};
bindLayerListeners(hillshade);

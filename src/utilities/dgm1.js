import './../assets/App.css';
import OlProj from 'ol/proj';
import proj4 from 'proj4';
import OlGeomLineString from 'ol/geom/linestring';
import OlFeature from 'ol/feature';

export class DGM1 {
  static getdgm(directions, directionssrc, summaryde) {
      OlProj.setProj4(proj4);
      const utm32n = 'EPSG:25832';
      proj4.defs(utm32n, '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
      const olLineCoordsUTM32N = [];
      const olLineCoords = [];
      olLineCoords.push(directions.getGeometry().getCoordinates());
      olLineCoords[0].forEach((item) => {
        item.pop();
      });
      olLineCoords[0].forEach((i) => {
        olLineCoordsUTM32N.push(OlProj.transform(i, 'EPSG:3857', utm32n))
      });
      const pois = olLineCoordsUTM32N.join(",");
      const east = [];
      const north = [];
      olLineCoordsUTM32N.forEach((i) => {
        east.push(i[0]);
        north.push(i[1]);
      })
      const n = Math.max(...north);
      const s = Math.min(...north);
      const e = Math.max(...east);
      const w = Math.min(...east);
      const processChain = {
            "list": [
                {
                    "module": "g.region",
                    "id": "g_region_1",
                    "inputs": [
                        {
                            "param": "n",
                            "value": String(n + 10)
                        },
                        {
                            "param": "s",
                            "value": String(s - 10)
                        },
                        {
                            "param": "e",
                            "value": String(e + 10)
                        },
                        {
                            "param": "w",
                            "value": String(w - 10)
                        },
                        {
                            "param": "align",
                            "value": "dgm1_raum_bonn_mosaik_epsg25832@dgm1"
                        }
                    ],
                    "flags": "a"
                },
                {
                    "module": "r.what",
                    "id": "r_what_1",
                    "inputs": [
                        {
                            "param": "map",
                            "value": "dgm1_raum_bonn_mosaik_epsg25832@dgm1"
                        },
                        {
                            "param": "coordinates",
                            "value": String(pois)
                        }
                    ]
                }
            ],
            "version": "1"
        };
      fetch('https://actinia.mundialis.de/api/v1/locations/utm_32n/processing_async_export', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('*******') //hide password before pushing to gh
        }),
        body: JSON.stringify(processChain)
      }).then( (response) => {
        return response.json();
      }).then( (json) => {
        const statusUrl = json.urls.status;
        //console.log(statusUrl);
        function *pollForWeatherInfo() {
                while (true) {
            yield fetch(statusUrl, {
              method: 'GET',
              headers: new Headers({
                'Authorization': 'Basic ' + btoa('*******') //hide password before pushing to gh
              })
            }).then(function (d) {
              var json = d.json();
              return json;
            });
          }
        }

        function runPolling(generator) {
          if (!generator) {
            generator = pollForWeatherInfo();
          }

          var p = generator.next();
          p.value.then(function (d) {
            if (d.status != 'finished') {
              runPolling(generator);
            }
            else {
              const dgm = olLineCoords[0];
              const result = d;
              const stdout = result.process_log[1].stdout;
              const rwhat2 = stdout.split("\n")
              const rwhat3 = [];
              const rwhat4 = [];
              const rwhat5 = [];
              rwhat2.forEach((i) => {
                rwhat3.push(i.split('|'))
              });
              rwhat3.forEach((i) => {
                rwhat4.push(parseFloat(i[3]))
              });
              //rwhat4.pop();
              dgm.forEach((i, index) => {
                i.push(rwhat4[index])
              });
              const line = new OlGeomLineString (dgm);
              directionssrc.clear();
              const lineFeature = new OlFeature(line);
              lineFeature.setId(summaryde + ' km');
              lineFeature.set('dgm', 'dgm1');
              directionssrc.addFeature(lineFeature);
            }
          });
        }
        runPolling();
        })
        }
      }

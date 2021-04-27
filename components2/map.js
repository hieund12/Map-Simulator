import 'ol/ol.css';
import Map from 'ol/Map';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import OLRoute from './route';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';

import styles from './styles';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import Runner from './runner';
import { InfoBox } from './infoBox';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
const speed = 0.5;

export default class OLMap {
  constructor(target) {
    this.map = new Map({
      target: document.getElementById(target),
      view: new View({
        center: [11877500, 1206600],
        zoom: 14.2,
        minZoom: 4,
        maxZoom: 19,
      }),
      layers: [
        new TileLayer({
          source: new OSM({
            attributions: attributions,
            tileSize: 512,
          }),
        }) ],
    });

    this.routeLayer = new VectorLayer({
      source: new VectorSource({
        features: [],
      }),
      style: function (feature, index) {
        if (!feature.getStyle()) return undefined
        return styles[feature.getGeometry().getType()];
      },
    });
    this.airLayer = new VectorLayer({
      source: new VectorSource({
        features: [],
      })
    });
    this.map.addLayer(this.routeLayer);
    this.map.addLayer(this.airLayer);

    this.routes = [];
    this.routeMoveFunctions = [];
    this.routeAnimating = [];

    this.runners = [];
    this.runnerMoveFunctions  = [];
    this.runnerAnimating = [];
    this.infoBox = new InfoBox();
    document.getElementById(target).appendChild(this.infoBox.render());
  }

  addRoute({features, color}) {
    const route = new OLRoute({features});
    this.map.addOverlay(route.popupOverLay)
    this.routes.push(route);
    this.routeLayer.getSource().addFeatures(route.features)
    route.on('moving', () => {
      route.speedPerFrame = 0.001 * (Math.random() + 0.3) * speed;
      if (this.isInitAir) return;
      const currentCoor = route.route.getCoordinateAt(route.distance)
      this.createAirZone(currentCoor)
    })
    this.routeMoveFunctions.push((event) => {
      return route.move(event);
    })
  }

  addRunner({features, name, kmRoute, stops}) {
    const runner = new Runner({features, name});
    runner.stops = stops;
    this.map.addOverlay(runner.popupOverLay)
    this.runners.push(runner);
    this.routeLayer.getSource().addFeatures(runner.features)
    // create info row
    const row = document.createElement('tr');
    row.innerHTML = `
    <tr>
      <td>${name}</td>
      <td>0 Km/h</td>
      <td>0 Km</td>
      <td>0</td>
    </tr>
    `
    this.infoBox.addRow(row)


    runner.on('moving', () => {
      runner.speedPerFrame = 0.001 * (Math.random() + 0.3) * speed
      row.innerHTML = `
      <tr>
        <td>${name}</td>
        <td>${(runner.speedPerFrame*25000).toFixed(2)} Km/h</td>
        <td>${(runner.distance * kmRoute).toFixed(2)} Km</td>
        <td>${(runner.speedPerFrame*80000).toFixed(2)}</td>
      </tr>
      `
      // const currentCoor = runner.route.getCoordinateAt(route.distance)
      // this.createAirZone(currentCoor)
    })
    this.runnerMoveFunctions.push((event) => {
      return runner.move(event);
    })
  }

  createAirZone(coor) {
    let airZones = []
    for (let index = 0; index < 2; index++) {
      // 11879104.186472563, 1204961.2696389516, 6.5138223988206265
      const airZone = new Feature({
        type: 'airZone',
        geometry: new Point([
          coor[0] + Math.random() * 500 * index,
          coor[1] + Math.random() * 500 * index,
          coor[2] + Math.random() * 500 * index
        ]),
      });
      airZone.setStyle(styles['airZone'])
      airZones.push(airZone)
    }
    this.airLayer.getSource().addFeatures(airZones)
  }

  start() {
    // push to moveFuntions
    this.routeAnimating = this.routeMoveFunctions;
    // handler runner
    this.runnerAnimating = this.runnerMoveFunctions;

    this.eventBinding = (event) => {
      this.move(event);
    };
    this.routeLayer.on('postrender', this.eventBinding);
    this.map.render();


    setTimeout(() => {
      this.isInitAir = true;
      for (let index = 0; index < 100; index = index + 3) {
        const currentCoor = this.routes[0].route.getCoordinateAt(index*0.01)
        this.createAirZone(currentCoor)
      }
    }, 6000)
  }

  move(event) {
    this.routeAnimating = this.routeAnimating.filter((handler) => {
      const isAnimating = handler(event);
      return isAnimating;
    })

    this.runnerAnimating = this.runnerAnimating.filter((handler) => {
      const isAnimating = handler(event);
      return isAnimating;
    })

    this.map.render();
    if (this.routeAnimating.length === 0 && this.runnerAnimating.length === 0) {
      this.stopAnimation();
      this.onFinish && this.onFinish();
    }
  }

  stopAnimation() {
    this.routeAnimating = [];
    this.runnerAnimating = [];
    this.isInitAir = false;
    this.routeLayer.un('postrender', this.eventBinding)
    this.routes.forEach((r) => {
      r.stopAnimation()
    })
    this.runners.forEach((r) => {
      r.stopAnimation()
    })
    this.map.render();
    this.onStop && this.onStop()
  }

  reColor() {
    this.airLayer.getSource().getFeatures().forEach((f) => {
      f.set('color', Math.random())
    })
  }
}

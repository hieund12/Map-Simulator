import {getVectorContext} from 'ol/render';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import Overlay from 'ol/Overlay';
import styles from './styles';

export default class OLRoute {
  constructor({
    features
  }) {
    this.paused = false;
    // style features
    this.routeFeature = features[0];
    this.routeFeature.set('animating', false)
    this.route = features[0].getGeometry();
    features[0].setStyle(styles.route.LineString)
    features[1].setStyle(styles.route['Point'])
    features[features.length -1].setStyle(styles.route['Point'])
    this.features = features
    // create popup layer for route
    this.routePopup = document.createElement('div');
    this.routePopup.classList.add('ol-popup');
    this.popupContent = document.createElement('div');
    this.routePopup.appendChild(this.popupContent);
    document.body.appendChild(this.routePopup)

    // create Overlay
    this.popupOverLay = new Overlay({
      offset: [0, -20],
      element: this.routePopup
    });

    // init animation
    this.distance = 0;
    this.speedPerFrame = 0.0003;
    this.lastFrame = 0;
    this.routeAnimating = []
    for (let i = 0; i < 1000; i++) {
      const coors = this.route.getCoordinateAt(i/1000)
      this.routeAnimating.push(coors)
    }
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  // binding to postrender of vector layer
  move(event) {
    this.routeFeature.set('animating', true)
    const vectorContext = getVectorContext(event);
    vectorContext.setStyle(styles.route.animatingRoute)

    if (!this.paused) {
            // run onMoving by 25 times
      this.currentFrame = Number((this.distance*25).toFixed(0));
      if (this.currentFrame > this.lastFrame) {
        this.lastFrame = Number(this.currentFrame)
        this.onMoving && this.onMoving(event)
      }

      // caculate current distance and handle stop
      this.distance = this.distance + this.speedPerFrame;
      if (this.distance >= 0.99) {
        this.stopAnimation(true);
        return false;
      }
    }
    const coordinates = this.route.getCoordinateAt(this.distance)

    //set Popup content
    this.popupContent.innerHTML = `
      <p>AQI: ${(this.speedPerFrame*80000).toFixed(2)}</p>
      <input id="speed" type="range" min="0.0001" max="0.0011" step="0.0001" value="${this.speedPerFrame}">
      <p>Speed: ${(this.speedPerFrame*25000).toFixed(2)} km/h<p>
    `;
    this.popupOverLay.setPosition(coordinates);

    // draw current point route and car
    var currentPoint = new Point(coordinates);
    var feature = new Feature(currentPoint);
    var currentLine = new LineString(this.routeAnimating.slice(0, 1000*this.distance));
    vectorContext.drawGeometry(currentLine);
    vectorContext.drawFeature(feature, styles.route.car(feature, event.frameState.viewState.resolution));

    return true;
  }

  stopAnimation() {
    this.routeFeature.set('animating', false);
    this.lastFrame = 0;
    this.distance = 0;
    this.speedPerFrame = 0.0003;
    this.popupOverLay.setPosition(undefined);
  }

  on(event, handler) {
    if (event === 'moving') this.onMoving = handler;
  }
}

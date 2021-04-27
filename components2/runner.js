import {getVectorContext} from 'ol/render';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import Overlay from 'ol/Overlay';
import styles from './styles';

export default class Runner {
  constructor({
    features,
    name
  }) {
    this.paused = false;
    this.name = name;
    // style features
    this.routeFeature = features[0];
    this.startFeature = features[1];
    this.endFeature = features[features.length - 1]
    this.routeFeature.set('animating', false)
    this.startFeature.set('animating', false)
    this.endFeature.set('animating', false)
    this.route = features[0].getGeometry();
    this.rootRoute = features[0].getGeometry();

    features[0].setStyle(styles.runner.LineString)
    features[1].setStyle(styles.runner.Point)
    features[features.length -1].setStyle(styles.runner.Point)
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

  handlePause() {
      this.popupContent.innerHTML = `
      <p style="margin-bottom: 8px; text-align: center"><b>${this.name}</b></p>
      <p>High AQI deteced, Do you want to change route?</p>
    `;
    const okBtn = document.createElement('button');
    okBtn.classList.add('btn')
    okBtn.classList.add('btn-primary');
    okBtn.innerText = 'OK'
    okBtn.onclick = () => {
      this.stops && this.stops.forEach((s) => {
        if (this.distance >= s.position && !s.done) {
          this.changeRoute(s.features)
          s.done = true;
          this.resume();
        }
      })
    }

    const cancelBtn = document.createElement('button');
    cancelBtn.classList.add('btn')
    cancelBtn.innerText = 'cancel';
    cancelBtn.classList.add('btn-warning')
    cancelBtn.onclick = () => {
      this.stops && this.stops.forEach((s) => {
        if (this.distance >= s.position && !s.done) {
          s.done = true;
          this.resume();
        }
      })
    }

    const wrapper = document.createElement('div');
    wrapper.classList.add('actions-btn2')
    wrapper.appendChild(cancelBtn);
    wrapper.appendChild(okBtn);
    this.popupContent.appendChild(wrapper);
  }

  // binding to postrender of vector layer
  move(event) {
    this.routeFeature.set('animating', true)
    this.startFeature.set('animating', true)
    this.endFeature.set('animating', true)
    const vectorContext = getVectorContext(event);
    vectorContext.setStyle(styles.runner.animatingRoute)

    // handle stop/reset route
    if(this.stops && this.stops.length) {
      this.stops.forEach((s) => {
        if (this.distance >= s.position && !s.done) {
          this.pause();
          !s.init && this.handlePause();
          s.init = true;
        }
      })
    }

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
    !this.paused && (this.popupContent.innerHTML = `
      <p style="margin-bottom: 8px; text-align: center"><b>${this.name}</b></p>
      <p>AQI: ${(this.speedPerFrame*80000).toFixed(2)}</p>
      <input id="speed" type="range" min="0.0001" max="0.0011" step="0.0001" value="${this.speedPerFrame}">
      <p>Speed: ${(this.speedPerFrame*25000).toFixed(2)} Km/h<p>
    `)

    this.popupOverLay.setPosition(coordinates);

    // draw current point route and car
    var currentPoint = new Point(coordinates);
    var feature = new Feature(currentPoint);
    // var currentLine = new LineString(this.routeAnimating.slice(0, 1000*this.distance));
    var currentLine = new LineString(this.routeAnimating.slice(1000*this.distance));

    vectorContext.drawGeometry(currentLine);
    vectorContext.drawFeature(feature, styles.runner.bike(feature, event.frameState.viewState.resolution));

    return true;
  }

  stopAnimation() {
    this.routeFeature.set('animating', false);
    this.startFeature.set('animating', false)
    this.endFeature.set('animating', false)
    this.lastFrame = 0;
    this.distance = 0;
    this.speedPerFrame = 0.0003;
    this.popupOverLay.setPosition(undefined);
    this.route = this.rootRoute;
    this.stops && this.stops.forEach((s) => {
      s.done = false;
      s.init = false;
    })
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

  on(event, handler) {
    if (event === 'moving') this.onMoving = handler;
  }

  changeRoute(features) {
    this.oldRoute = this.route;
    this.route = features[0].getGeometry();
    this.distance = 0;
    this.speedPerFrame = 0.0003;
    this.lastFrame = 0;
    this.routeAnimating = []
    for (let i = 0; i < 1000; i++) {
      const coors = this.route.getCoordinateAt(i/1000)
      this.routeAnimating.push(coors)
    }
  }
}

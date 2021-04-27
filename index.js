import OLMap from './components/map';
import route1 from './data/route1.json';
import route1reverse from './data2/route1-reverse.json';
import route2 from './data/route2.json';
import route3 from './data/route3.json';
import route4 from './data/route4.json';

import GeoJSON from 'ol/format/GeoJSON';
(function() {

const map = new OLMap('map');
const startButton = document.createElement('button')
startButton.classList.add('button', 'button1')
startButton.innerText = 'Start'
startButton.onclick = () => {
  if (startButton.innerText === 'Stop') {
    map.stopAnimation();
    map.airLayer.getSource().clear()
    startButton.classList.remove('button3')
    startButton.classList.add('button1')
    startButton.innerText = 'Start'
    return;
  }
  map.airLayer.getSource().clear()
  map.start();
  startButton.classList.remove('button1')
  startButton.classList.add('button3')
  startButton.innerText = 'Stop'
}
document.querySelector('#map').appendChild(startButton)

const features1 = new GeoJSON().readFeatures(route1, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
map.addRoute({features: features1})
const features1Reverse = new GeoJSON().readFeatures(route1reverse, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
map.addRoute({features: features1Reverse})

const features2 = new GeoJSON().readFeatures(route2, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
map.addRunner({features: features2, name: 'Algorithm 1', kmRoute: 8.3})
const features3 = new GeoJSON().readFeatures(route3, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
map.addRunner({features: features3, name: 'Algorithm 2', kmRoute: 5.8})
const features4 = new GeoJSON().readFeatures(route4, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
map.addRunner({features: features4, name: 'Algorithm 3', kmRoute: 3.9})

map.onStop = () => {
  startButton.classList.remove('button3')
  startButton.classList.add('button1')
  startButton.innerText = 'Start';
}
map.onFinish = () => {
  $('#exampleModal').modal('show')
}

const btns = document.querySelectorAll('.timeBtn')
btns.forEach((btn) => {
  btn.onclick = () => {
    btns.forEach((a) => {
      a.classList.remove('active');
    })
    btn.classList.add('active')
    map.reColor();
  }
})

})()

import OLMap from './components2/map';
import route1 from './data/route1.json';
import route1reverse from './data2/route1-reverse.json';
import route2 from './data/route2.json';
import route3 from './data/route3.json';
import route4 from './data/route4.json';
import route31 from './data2/route3-1.json';
import route21 from './data2/route2-1.json';
import route41 from './data2/route4-1.json';


import GeoJSON from 'ol/format/GeoJSON';

let isInit = false;
(function () {
  var tabEl = document.querySelector('#nav-2-tab')
  tabEl.addEventListener('shown.bs.tab', function (event) {
    console.log(event.target.id)
    if (event.target.id === 'nav-2-tab') {
      if (isInit) return;
      isInit = true;
      const map = new OLMap('map2');
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
      document.querySelector('#map2').appendChild(startButton)
      
      const features1 = new GeoJSON().readFeatures(route1, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
      map.addRoute({features: features1})

      const features1Reverse = new GeoJSON().readFeatures(route1reverse, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
      map.addRoute({features: features1Reverse})

      const features31 = new GeoJSON().readFeatures(route31, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
      const features3 = new GeoJSON().readFeatures(route3, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
      map.addRunner({features: features3, name: 'Algorithm 2', kmRoute: 5.8, stops: [{
        position: 0.43,
        features: features31
      }]})

      const features21 = new GeoJSON().readFeatures(route21, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
      const features2 = new GeoJSON().readFeatures(route2, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
      map.addRunner({features: features2, name: 'Algorithm 1', kmRoute: 8.3, stops: [{
        position: 0.13,
        features: features21
      }]})
      
      const features41 = new GeoJSON().readFeatures(route41, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
      const features4 = new GeoJSON().readFeatures(route4, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
      map.addRunner({features: features4, name: 'Algorithm 3', kmRoute: 3.9, stops: [{
        position: 0.385,
        features: features41
      }]})
      
      map.onStop = () => {
        startButton.classList.remove('button3')
        startButton.classList.add('button1')
        startButton.innerText = 'Start'
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
    }
  })
})()

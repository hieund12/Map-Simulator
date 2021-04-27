import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style,
  RegularShape,
  Icon
} from 'ol/style';
import carIcon from '../imgs/car.png';
import bikeIcon from '../imgs/bike.png';

const carOlIcon = new Icon({
  scale: 0.2,
  src: carIcon,
  anchorXUnits: 'fraction',
  anchorYUnits: 'fraction',
})
carOlIcon.load();

const bikeOlIcon = new Icon({
  scale: 0.2,
  src: bikeIcon,
  anchorXUnits: 'fraction',
  anchorYUnits: 'fraction',
})
bikeOlIcon.load();

export default {
  route: {
    'animatingRoute': new Style({
      stroke: new Stroke({
        color: 'rgba(241, 74, 74, 0.8)',
        width: 4,
      }),
    }),
    'LineString': (feature, resolution) => {
      if (feature.get('animating')) return;
      return new Style({
        stroke: new Stroke({
          color: 'rgba(241, 74, 74, 0.8)',
          width: 4,
        }),
      })
    },
    'car': (f, resolution) => {
      const style = new Style({
        image: carOlIcon,
      })
      const scale = 0.28/resolution > 0.08 ? 0.28/resolution : 0.08
      style.getImage().setScale(scale)
      return style
    },
    'Point': new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({color: 'black'}),
        stroke: new Stroke({
          color: 'white',
          width: 2,
        }),
      }),
    })
  },
  'airZone': (feature, resolution) => {
    if (!feature.get('color')) {
      feature.set('color', AIR_COLORS[Math.floor(Math.random() * 5)])
    }
    return new Style({
      image: new RegularShape({
        radius: 500/resolution,
        angle: Math.PI / 4,
        points: 4,
        fill: new Fill({
          color: AIR_COLORS[Math.floor(Math.random() * 5)],
        }),
      })
    })
  },
  runner: {
    'animatingRoute': new Style({
      stroke: new Stroke({
        color: 'rgba(99, 165, 33, 0.8)',
        width: 4,
      }),
    }),
    'LineString': (feature, resolution) => {
      if (feature.get('animating')) return;
      return new Style({
        stroke: new Stroke({
          color: 'rgba(99, 165, 33, 0.8)',
          width: 4,
        }),
      })
    },
    'Point': (feature, resolution) => {
      if (feature.get('animating')) return;
      return new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({color: 'black'}),
          stroke: new Stroke({
            color: 'white',
            width: 2,
          }),
        }),
      })
    },
    'bike': (f, resolution) => {
      const style = new Style({
        image: bikeOlIcon,
      })
      const scale = 0.1/resolution < 0.08 ? 0.08 : 0.1/resolution
      style.getImage().setScale(scale)
      return style
    },
  }
};

const AIR_COLORS = ['rgba(241, 74, 74, 0.2)','rgba(243, 237, 57, 0.2)', 'rgba(99, 165, 33, 0.2)', 'rgba(205, 133, 8, 0.2)', 'rgba(99, 8, 92, 0.2)', 'rgba(99, 8, 8, 0.2)']

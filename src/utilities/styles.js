import OlStyleStyle from 'ol/style/style';
import OlStyleStroke from 'ol/style/stroke';
import OlStyleCircle from 'ol/style/circle';
import OlStyleFill from 'ol/style/fill';

export const ptred = new OlStyleStyle({
  image: new OlStyleCircle({
    radius: 8,
    fill: new OlStyleFill({
      color: '#f72727'
    }),
    stroke: new OlStyleStroke({
      color: '#fff',
      width: 2
    })
  })
});

export const ptorange = new OlStyleStyle({
  image: new OlStyleCircle({
    radius: 8,
    fill: new OlStyleFill({
      color: '#FFA500'
    }),
    stroke: new OlStyleStroke({
      color: '#fff',
      width: 2
    })
  })
});

export const routeStyle = new OlStyleStyle({
  stroke: new OlStyleStroke({
    color: 'rgba(255,0,0,0.6)',
    width: 4
  })
});

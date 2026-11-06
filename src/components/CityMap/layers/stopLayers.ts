import type { GeoJSONSourceSpecification, Map } from 'maplibre-gl';

import { transportData } from '@/data/transportData';

const stopSourceId = 'transport-stops';
const stopLayerId = 'transport-stop-points';

const stops: GeoJSONSourceSpecification['data'] = {
  type: 'FeatureCollection',
  features: transportData.stops.flatMap(({ id, coordinates }) => {
    if (!coordinates) return [];

    const { longitude, latitude } = coordinates;

    return [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [longitude, latitude] },
        properties: { stopId: id },
      },
    ];
  }),
};

export const addStopLayers = (map: Map) => {
  map.addSource(stopSourceId, {
    type: 'geojson',
    data: stops,
    attribution:
      '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>',
  });

  map.addLayer({
    id: stopLayerId,
    type: 'circle',
    source: stopSourceId,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 16, 7],
      'circle-color': '#297bb0',
      'circle-stroke-color': '#fff',
      'circle-stroke-width': 1.5,
    },
  });
};

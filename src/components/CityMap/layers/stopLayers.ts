import type { GeoJSONSourceSpecification, Map } from 'maplibre-gl';

import { transportCatalog } from '@/data/transportData';

import { getNearestStopId } from './getNearestStopId';

const stopSourceId = 'transport-stops';
const stopLayerId = 'transport-stop-points';
const selectedStopLayerId = 'transport-selected-stop';

const stops: GeoJSONSourceSpecification['data'] = {
  type: 'FeatureCollection',
  features: transportCatalog.mappedStops.map(({ id, coordinates: { longitude, latitude } }) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [longitude, latitude] },
    properties: { stopId: id },
  })),
};

export const selectStopOnMap = (map: Map, stopId?: string) => {
  const selectedStop = stopId ? transportCatalog.getMappedStop(stopId) : undefined;

  map.setLayoutProperty(stopLayerId, 'visibility', selectedStop ? 'none' : 'visible');
  map.setFilter(selectedStopLayerId, ['==', ['get', 'stopId'], selectedStop?.id ?? '']);

  return selectedStop?.coordinates;
};

export const addStopLayers = (map: Map, onSelectStop: (stopId: string) => void) => {
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
      'circle-color': '#246f9b', //--color-stop
      'circle-stroke-color': '#fff',
      'circle-stroke-width': 1.5,
    },
  });

  map.addLayer({
    id: selectedStopLayerId,
    type: 'circle',
    source: stopSourceId,
    filter: ['==', ['get', 'stopId'], ''],
    paint: {
      'circle-radius': 9,
      'circle-color': '#246f9b', //--color-stop
      'circle-stroke-color': '#fff',
      'circle-stroke-width': 3,
    },
  });

  const clickableLayers = [selectedStopLayerId, stopLayerId];

  map.on('click', clickableLayers, ({ point, features }) => {
    const stopId = getNearestStopId(map, point, features ?? []);

    if (stopId) onSelectStop(stopId);
  });

  map.on('mouseenter', clickableLayers, () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', clickableLayers, () => {
    map.getCanvas().style.cursor = '';
  });
};

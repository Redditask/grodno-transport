import type { GeoJSONSourceSpecification, Map, Popup } from 'maplibre-gl';

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

export const selectRouteStopsOnMap = (map: Map, routeStopIds?: string[]) => {
  map.setFilter(
    stopLayerId,
    routeStopIds ? ['in', ['get', 'stopId'], ['literal', routeStopIds]] : null,
  );
};

export const addStopLayers = (
  map: Map,
  onSelectStop: (stopId: string) => void,
  stopTooltip: Popup,
) => {
  const stopColor = getComputedStyle(map.getContainer()).getPropertyValue('--color-stop').trim();

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
      'circle-color': stopColor,
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
      'circle-color': stopColor,
      'circle-stroke-color': '#fff',
      'circle-stroke-width': 3,
    },
  });

  const clickableLayers = [selectedStopLayerId, stopLayerId];

  let hoveredStopId: string | undefined;

  map.on('click', clickableLayers, ({ point, features }) => {
    stopTooltip.remove();

    const stopId = getNearestStopId(map, point, features ?? []);

    if (stopId) onSelectStop(stopId);
  });

  map.on('mousemove', clickableLayers, ({ point, features }) => {
    const stopId = getNearestStopId(map, point, features ?? []);
    if (!stopId || map.isMoving()) return;
    if (stopId === hoveredStopId && stopTooltip.isOpen()) return;

    const stop = transportCatalog.getMappedStop(stopId);
    if (!stop) return;

    const { longitude, latitude } = stop.coordinates;
    hoveredStopId = stopId;
    map.getCanvas().style.cursor = 'pointer';
    stopTooltip.setLngLat([longitude, latitude]).setText(stop.name);

    if (!stopTooltip.isOpen()) stopTooltip.addTo(map);
  });

  map.on('mouseleave', clickableLayers, () => {
    hoveredStopId = undefined;
    map.getCanvas().style.cursor = '';
    stopTooltip.remove();
  });
};

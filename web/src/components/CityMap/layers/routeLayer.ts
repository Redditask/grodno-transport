import type { GeoJSONSource, LngLatBoundsLike, Map } from 'maplibre-gl';

import { getRouteGeometry } from '@/data/routeGeometry';
import { transportCatalog } from '@/data/transportData';

import { selectRouteStopsOnMap } from './stopLayers';

const routeLineId = 'transport-route-line';

export const selectRouteOnMap = (map: Map, routeId?: string): LngLatBoundsLike | undefined => {
  const stopIds = routeId ? transportCatalog.getRouteStopIds(routeId) : undefined;
  selectRouteStopsOnMap(map, stopIds);

  const coordinates = routeId ? getRouteGeometry(routeId) : undefined;
  const source = map.getSource<GeoJSONSource>(routeLineId);
  if (source?.type !== 'geojson') return;

  const transportType = routeId ? transportCatalog.getRouteTransportType(routeId) : undefined;
  if (!coordinates?.length || !transportType) {
    source.setData({ type: 'FeatureCollection', features: [] });
    return;
  }

  source.setData({
    type: 'Feature',
    geometry: { type: 'LineString', coordinates },
    properties: { transportType },
  });

  let [west, south] = coordinates[0];
  let east = west;
  let north = south;

  for (const [longitude, latitude] of coordinates) {
    west = Math.min(west, longitude);
    south = Math.min(south, latitude);
    east = Math.max(east, longitude);
    north = Math.max(north, latitude);
  }

  return [west, south, east, north];
};

export const addRouteLayer = (map: Map) => {
  const styles = getComputedStyle(map.getContainer());
  const busColor = styles.getPropertyValue('--color-bus-medium').trim();
  const trolleybusColor = styles.getPropertyValue('--color-trolleybus-medium').trim();

  map.addSource(routeLineId, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
    attribution:
      '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>',
  });

  map.addLayer({
    id: routeLineId,
    type: 'line',
    source: routeLineId,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': ['match', ['get', 'transportType'], 'trolleybus', trolleybusColor, busColor],
      'line-width': 4,
    },
  });
};

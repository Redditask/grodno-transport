import type { Map, MapGeoJSONFeature, Point } from 'maplibre-gl';

export const getNearestStopId = (
  map: Map,
  point: Point,
  features: MapGeoJSONFeature[],
): string | undefined => {
  let nearestStopId: string | undefined;
  let nearestDistance = Infinity;

  for (const feature of features) {
    const { stopId } = feature.properties;
    if (typeof stopId !== 'string' || feature.geometry.type !== 'Point') continue;

    const [longitude, latitude] = feature.geometry.coordinates;
    const distance = point.dist(map.project([longitude, latitude]));

    if (distance >= nearestDistance) continue;

    nearestStopId = stopId;
    nearestDistance = distance;
  }

  return nearestStopId;
};

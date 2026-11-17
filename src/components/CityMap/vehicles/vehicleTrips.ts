import type { Departure } from '@/domain/schedule';

type MapPoint = [longitude: number, latitude: number];

interface RoutePoint {
  coordinates: MapPoint;
  distance: number;
}

interface VehicleTrip {
  times: number[];
}

const maxStopDistance = 55;
const maxSpeedMetersPerMinute = 1_500;

const toMeters = ([longitude, latitude]: MapPoint, referenceLatitude: number): MapPoint => [
  longitude * 111_320 * Math.cos((referenceLatitude * Math.PI) / 180),
  latitude * 111_320,
];

const interpolate = (from: MapPoint, to: MapPoint, progress: number): MapPoint => [
  from[0] + (to[0] - from[0]) * progress,
  from[1] + (to[1] - from[1]) * progress,
];

export const measureRoute = (coordinates: number[][]): RoutePoint[] => {
  const referenceLatitude = coordinates[0]?.[1] ?? 0;
  const points: RoutePoint[] = [];

  for (const [longitude, latitude] of coordinates) {
    const point: MapPoint = [longitude, latitude];
    const previous = points.at(-1);

    let distance = 0;

    if (previous) {
      const [fromX, fromY] = toMeters(previous.coordinates, referenceLatitude);
      const [toX, toY] = toMeters(point, referenceLatitude);

      distance = previous.distance + Math.hypot(toX - fromX, toY - fromY);
    }

    points.push({ coordinates: point, distance });
  }

  return points;
};

export const projectStops = (route: RoutePoint[], stops: MapPoint[]): number[] | undefined => {
  if (route.length < 2) return;

  const referenceLatitude = route[0].coordinates[1];
  const stopDistances: number[] = [];

  for (const stop of stops) {
    const [stopX, stopY] = toMeters(stop, referenceLatitude);
    const previousDistance = stopDistances.at(-1) ?? -1;
    let nearestDistance = maxStopDistance;

    let routeDistance: number | undefined;

    for (let index = 1; index < route.length; index++) {
      const from = route[index - 1];
      const to = route[index];

      const length = to.distance - from.distance;

      if (!length || to.distance <= previousDistance) continue;

      const [fromX, fromY] = toMeters(from.coordinates, referenceLatitude);
      const [toX, toY] = toMeters(to.coordinates, referenceLatitude);

      const progress = Math.max(
        0,
        Math.min(
          1,
          ((stopX - fromX) * (toX - fromX) + (stopY - fromY) * (toY - fromY)) / length ** 2,
        ),
      );

      const distance = from.distance + length * progress;
      if (distance <= previousDistance) continue;

      const [x, y] = interpolate([fromX, fromY], [toX, toY], progress);
      const distanceToStop = Math.hypot(stopX - x, stopY - y);
      if (distanceToStop >= nearestDistance) continue;

      nearestDistance = distanceToStop;
      routeDistance = distance;
    }

    if (routeDistance === undefined) return;
    stopDistances.push(routeDistance);
  }

  return stopDistances;
};

export const buildVehicleTrips = (
  departuresByStop: Departure[][],
  stopDistances: number[],
): VehicleTrip[] => {
  const departures = departuresByStop[0];
  if (!departures || stopDistances.length < 2 || departuresByStop.length !== stopDistances.length)
    return [];
  if (departuresByStop.some((times) => times.length !== departures.length)) return [];

  const sortedTimes = departuresByStop.map((times) =>
    times.map(({ serviceMinutes }) => serviceMinutes).sort((a, b) => a - b),
  );

  return departures.flatMap((_, tripIndex) => {
    const times = sortedTimes.map((stopTimes) => stopTimes[tripIndex]);
    const isPlausible = times.every((time, stopIndex) => {
      if (stopIndex === 0) return true;

      const minutes = time - times[stopIndex - 1];
      const distance = stopDistances[stopIndex] - stopDistances[stopIndex - 1];
      return minutes > 0 && distance / minutes <= maxSpeedMetersPerMinute;
    });

    return isPlausible ? [{ times }] : [];
  });
};

export const getVehiclePosition = (
  route: RoutePoint[],
  stopDistances: number[],
  { times }: VehicleTrip,
  minutes: number,
): MapPoint | undefined => {
  if (minutes < times[0] || minutes >= times[times.length - 1]) return;

  const nextStop = times.findIndex((time) => time > minutes);
  const progress = (minutes - times[nextStop - 1]) / (times[nextStop] - times[nextStop - 1]);
  const startDistance = stopDistances[nextStop - 1];
  const distance = startDistance + (stopDistances[nextStop] - startDistance) * progress;

  const nextPoint = route.findIndex((point) => point.distance >= distance);
  if (nextPoint <= 0) return route[0]?.coordinates;

  const from = route[nextPoint - 1];
  const to = route[nextPoint];

  return interpolate(
    from.coordinates,
    to.coordinates,
    (distance - from.distance) / (to.distance - from.distance),
  );
};

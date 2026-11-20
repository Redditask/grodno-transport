import type { Departure } from '@/domain/schedule';

type MapPoint = [longitude: number, latitude: number];

interface RoutePoint {
  coordinates: MapPoint;
  distance: number;
}

interface StopProjection {
  routeDistance: number;
  distanceToStop: number;
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

// Для каждой точки сохраняем координаты для карты и расстояние от начала маршрута вдоль дороги.
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

// stops уже содержит площадки в порядке маршрута. Возвращаем расстояния вдоль линии
// от начала маршрута до каждой из этих площадок в том же порядке.
export const projectStops = (route: RoutePoint[], stops: MapPoint[]): number[] | undefined => {
  if (route.length < 2) return;

  const referenceLatitude = route[0].coordinates[1];
  const points = route.map(({ coordinates, distance }) => ({
    coordinates: toMeters(coordinates, referenceLatitude),
    distance,
  }));

  // Для каждой площадки просматриваем всю линию. Если автобус проходит рядом дважды,
  // обе точки становятся вариантами привязки одной площадки.
  const projectionsByStop = stops.map((stop) => {
    const [stopX, stopY] = toMeters(stop, referenceLatitude);
    const projections: StopProjection[] = [];

    for (let index = 1; index < points.length; index++) {
      const from = points[index - 1];
      const to = points[index];
      const length = to.distance - from.distance;
      if (!length) continue;

      const [fromX, fromY] = from.coordinates;
      const [toX, toY] = to.coordinates;
      const progress = Math.max(
        0,
        Math.min(
          1,
          ((stopX - fromX) * (toX - fromX) + (stopY - fromY) * (toY - fromY)) / length ** 2,
        ),
      );

      const [x, y] = interpolate(from.coordinates, to.coordinates, progress);
      const distanceToStop = Math.hypot(stopX - x, stopY - y);
      if (distanceToStop >= maxStopDistance) continue;

      projections.push({ routeDistance: from.distance + length * progress, distanceToStop });
    }

    return projections;
  });

  // Идём с конца и ищем самый поздний вариант для каждой остановки.
  // Он должен быть раньше границы следующей остановки. Для последней остановки границы ещё нет.
  const latestDistances: number[] = [];
  let nextDistance = Infinity;

  for (let index = projectionsByStop.length - 1; index >= 0; index--) {
    const projections = projectionsByStop[index];
    let latestIndex = projections.length - 1;

    while (latestIndex >= 0 && projections[latestIndex].routeDistance >= nextDistance) {
      latestIndex--;
    }
    if (latestIndex < 0) return;

    nextDistance = projections[latestIndex].routeDistance;
    latestDistances[index] = nextDistance;
  }

  // С начала выбираем ближайшую к площадке точку после предыдущей остановки
  // и в пределах границы, найденной при проходе с конца.
  const stopDistances: number[] = [];

  for (const [index, projections] of projectionsByStop.entries()) {
    const previousDistance = stopDistances.at(-1) ?? -1;
    let nearest: StopProjection | undefined;

    for (const projection of projections) {
      if (projection.routeDistance <= previousDistance) continue;
      if (projection.routeDistance > latestDistances[index]) break;

      if (!nearest || projection.distanceToStop < nearest.distanceToStop) nearest = projection;
    }

    if (!nearest) return;
    stopDistances.push(nearest.routeDistance);
  }

  return stopDistances;
};

// Собираем рейсы из расписаний отдельных остановок. Первое время на каждой остановке
// считаем одним рейсом, второе — следующим. Если число отправлений различается,
// пары могут сдвинуться, поэтому такое расписание пропускаем.
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
    // Отбрасываем рейс, если время идёт назад или перегон требует слишком высокой скорости.
    const isPlausible = times.every((time, stopIndex) => {
      if (stopIndex === 0) return true;

      const minutes = time - times[stopIndex - 1];
      const distance = stopDistances[stopIndex] - stopDistances[stopIndex - 1];
      return minutes > 0 && distance / minutes <= maxSpeedMetersPerMinute;
    });

    return isPlausible ? [{ times }] : [];
  });
};

// По времени определяем, между какими остановками едет машина и какую часть пути она уже прошла.
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

  // Переводим пройденное расстояние в координаты на линии дороги.
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

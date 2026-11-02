import type { Line } from '../domain/line';
import type { Route } from '../domain/route';
import type { Schedule } from '../domain/schedule';
import type { Stop } from '../domain/stop';
import { getRoutesByStopId } from './getRoutesByStopId';
import { getScheduleByRouteAndStopIds } from './getScheduleByRouteAndStopIds';

export interface StopRouteItem {
  route: Route;
  line: Line;
  origin: string;
  destination: string;
  schedule: Schedule | undefined;
}

export interface TransportData {
  lines: Line[];
  routes: Route[];
  stops: Stop[];
  schedules: Schedule[];
}

export const getStopRouteItems = (
  stop: Stop,
  { lines, routes, stops, schedules }: TransportData,
): StopRouteItem[] => {
  return getRoutesByStopId(routes, stop.id).flatMap((route) => {
    const line = lines.find(({ id }) => id === route.lineId);
    if (!line) return [];

    const origin = stops.find(({ id }) => id === route.stopIds[0])?.name ?? 'Начальная остановка';
    const destination =
      stops.find(({ id }) => id === route.stopIds.at(-1))?.name ?? 'Конечная остановка';

    const schedule = getScheduleByRouteAndStopIds(schedules, route.id, stop.id);

    return [{ route, line, origin, destination, schedule }];
  });
};

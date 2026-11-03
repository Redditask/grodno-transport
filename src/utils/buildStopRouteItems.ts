import type { TransportData } from '../data/transportData';
import type { Line } from '../domain/line';
import type { Route } from '../domain/route';
import type { Schedule } from '../domain/schedule';
import type { Stop } from '../domain/stop';
import { findStopSchedule } from './findStopSchedule';
import { getStopRoutes } from './getStopRoutes';

export interface StopRouteItem {
  route: Route;
  line: Line;
  origin: string;
  destination: string;
  schedule: Schedule | undefined;
}

export const buildStopRouteItems = (
  stop: Stop,
  { lines, routes, stops, schedules }: TransportData,
): StopRouteItem[] => {
  return getStopRoutes(routes, stop.id).flatMap((route) => {
    const line = lines.find(({ id }) => id === route.lineId);
    if (!line) return [];

    const origin = stops.find(({ id }) => id === route.stopIds[0])?.name ?? 'Начальная остановка';
    const destination =
      stops.find(({ id }) => id === route.stopIds.at(-1))?.name ?? 'Конечная остановка';

    const schedule = findStopSchedule(schedules, route.id, stop.id);

    return [{ route, line, origin, destination, schedule }];
  });
};

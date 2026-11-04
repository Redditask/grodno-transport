import type { Line } from '@/domain/line';
import type { Route } from '@/domain/route';
import type { Schedule } from '@/domain/schedule';
import type { Stop } from '@/domain/stop';

import lines from './lines.json';
import routes from './routes.json';
import schedules from './schedules.json';
import stops from './stops.json';

export interface TransportData {
  lines: Line[];
  routes: Route[];
  stops: Stop[];
  schedules: Schedule[];
}

export const transportData: TransportData = {
  lines,
  routes,
  stops,
  schedules,
};

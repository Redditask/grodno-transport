import type { Schedule } from '../domain/schedule';
import type { TransportData } from '../utils/getStopRouteItems';
import { lines } from './lines';
import { routes } from './routes';
import scheduleSnapshot from './schedules.json';
import { stops } from './stops';

const schedules: Schedule[] = scheduleSnapshot.schedules;

export const transportData: TransportData = {
  lines,
  routes,
  stops,
  schedules,
};

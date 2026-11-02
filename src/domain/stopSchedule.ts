import type { Route } from './route';
import type { Stop } from './stop';

export interface StopSchedule {
  routeId: Route['id'];
  stopId: Stop['id'];
  departures: {
    weekday: string[];
    weekend: string[];
  };
}

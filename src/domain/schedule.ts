import type { Route } from './route';
import type { Stop } from './stop';

export interface Departure {
  time: string;
  serviceMinutes: number;
  annotation?: string;
}

export interface UpcomingDeparture extends Departure {
  dayOffset: number;
}

export interface Schedule {
  routeId: Route['id'];
  stopId: Stop['id'];
  departures: {
    weekday: Departure[];
    weekend: Departure[];
  };
  notes: string[];
}

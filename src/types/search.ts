import type { Route } from '@/domain/route';
import type { Stop } from '@/domain/stop';

import type { RouteSummary } from './route';

export type SearchScreen =
  | { kind: 'results' }
  | { kind: 'stopRoutes'; stopId: Stop['id'] }
  | { kind: 'routeStops'; routeId: Route['id'] }
  | { kind: 'schedule'; routeId: Route['id']; stopId: Stop['id'] };

export interface SearchHistoryEntry {
  screen: SearchScreen;
  scrollTop: number;
  focusId?: string;
}

export interface TransportSearchResults {
  routes: RouteSummary[];
  stops: Stop[];
}

export interface ResultLimits {
  routes: number;
  stops: number;
}

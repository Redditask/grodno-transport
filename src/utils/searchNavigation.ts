import type { Route } from '@/domain/route';
import type { Stop } from '@/domain/stop';

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

export const createSearchHistory = (): SearchHistoryEntry[] => [
  { screen: { kind: 'results' }, scrollTop: 0 },
];

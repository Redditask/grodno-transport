import type { Route } from '../domain/route';

export const getRoutesByStopId = (routes: Route[], stopId: string) =>
  routes.filter(({ stopIds }) => stopIds.includes(stopId));

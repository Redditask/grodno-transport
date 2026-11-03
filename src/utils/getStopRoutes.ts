import type { Route } from '../domain/route';

export const getStopRoutes = (routes: Route[], stopId: string) =>
  routes.filter(({ stopIds }) => stopIds.includes(stopId));

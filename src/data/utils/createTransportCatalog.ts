import type { TransportData } from '@/data/transportData';
import { buildRouteSummary } from '@/data/utils/buildRouteSummary';
import { getOppositeStop } from '@/data/utils/getOppositeStop';
import { searchTransport } from '@/data/utils/searchTransport';

export const createTransportCatalog = (data: TransportData) => {
  const { stops, routes, schedules } = data;
  const mappedStops = stops.flatMap(({ id, coordinates }) =>
    coordinates ? [{ id, coordinates }] : [],
  );

  const getStop = (stopId: string) => stops.find(({ id }) => id === stopId);
  const getRoute = (routeId: string) => routes.find(({ id }) => id === routeId);

  const findStopSchedule = (routeId: string, stopId: string) =>
    schedules.find((schedule) => schedule.routeId === routeId && schedule.stopId === stopId);

  return {
    search: (query: string) => searchTransport(query, data),

    mappedStops,
    getMappedStop: (stopId?: string) => mappedStops.find(({ id }) => id === stopId),

    getStopDetails(stopId: string) {
      const stop = getStop(stopId);
      if (!stop) return undefined;

      return {
        stop,
        oppositeStop: getOppositeStop(stops, stop),
        routeItems: routes.flatMap((route) => {
          if (!route.stopIds.includes(stopId)) return [];

          const routeSummary = buildRouteSummary(route, data);
          if (!routeSummary) return [];

          return [{ ...routeSummary, schedule: findStopSchedule(route.id, stopId) }];
        }),
      };
    },

    getRouteStopIds: (routeId: string) => getRoute(routeId)?.stopIds,

    getRouteDetails(routeId: string) {
      const route = getRoute(routeId);
      const routeSummary = route ? buildRouteSummary(route, data) : undefined;
      if (!route || !routeSummary) return undefined;

      const oppositeRoute = routes.find(
        (otherRoute) => otherRoute.lineId === route.lineId && otherRoute.id !== routeId,
      );
      const routeStops = route.stopIds.flatMap((stopId, index) => {
        const stop = getStop(stopId);
        if (!stop) return [];

        return [{ stop, index, schedule: findStopSchedule(routeId, stopId) }];
      });

      return { routeSummary, oppositeRoute, routeStops };
    },

    getScheduleDetails(routeId: string, stopId: string) {
      const stop = getStop(stopId);
      const route = getRoute(routeId);
      const routeSummary = route ? buildRouteSummary(route, data) : undefined;
      if (!stop || !routeSummary) return undefined;

      return {
        stop,
        routeItem: { ...routeSummary, schedule: findStopSchedule(routeId, stopId) },
      };
    },
  };
};

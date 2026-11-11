import type { TransportData } from '@/data/transportData';
import { buildRouteSummary } from '@/data/utils/buildRouteSummary';
import { getOppositeStop } from '@/data/utils/getOppositeStop';
import { createTransportSearch } from '@/data/utils/searchTransport';
import type { Schedule } from '@/domain/schedule';

export const createTransportCatalog = (data: TransportData) => {
  const { stops, routes, schedules } = data;
  const mappedStops = stops.flatMap(({ id, name, coordinates }) =>
    coordinates ? [{ id, name, coordinates }] : [],
  );

  const stopsById = new Map(stops.map((stop) => [stop.id, stop]));
  const routesById = new Map(routes.map((route) => [route.id, route]));
  const mappedStopsById = new Map(mappedStops.map((stop) => [stop.id, stop]));
  const schedulesByRoute = new Map<string, Map<string, Schedule>>();

  for (const schedule of schedules) {
    let routeSchedules = schedulesByRoute.get(schedule.routeId);

    if (!routeSchedules) {
      routeSchedules = new Map();
      schedulesByRoute.set(schedule.routeId, routeSchedules);
    }

    routeSchedules.set(schedule.stopId, schedule);
  }

  const getStop = (stopId: string) => stopsById.get(stopId);
  const getRoute = (routeId: string) => routesById.get(routeId);
  const findStopSchedule = (routeId: string, stopId: string) =>
    schedulesByRoute.get(routeId)?.get(stopId);

  return {
    search: createTransportSearch(data),

    mappedStops,
    getMappedStop: (stopId?: string) =>
      stopId === undefined ? undefined : mappedStopsById.get(stopId),

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

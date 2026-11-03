import type { Schedule } from '../domain/schedule';

export const findStopSchedule = (
  schedules: Schedule[],
  routeId: string,
  stopId: string,
): Schedule | undefined =>
  schedules.find(
    ({ routeId: scheduleRouteId, stopId: scheduleStopId }) =>
      scheduleRouteId === routeId && scheduleStopId === stopId,
  );

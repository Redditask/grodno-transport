import { getRouteGeometry } from '@/data/routeGeometry';
import { transportCatalog } from '@/data/transportData';
import { formatTransportLabel } from '@/utils/formatTransportLabel';
import { formatTransportTime, getDayType, timeToMinutes } from '@/utils/transportTime';

import { buildVehicleTrips, getVehiclePosition, measureRoute, projectStops } from './vehicleTrips';

const pilotRouteIds = ['bus-17-direction-0', 'bus-17-direction-1', 'trolleybus-1-direction-0'];

const buildPilotRoutes = () =>
  pilotRouteIds.flatMap((routeId) => {
    const details = transportCatalog.getRouteDetails(routeId);
    const coordinates = getRouteGeometry(routeId);
    if (!details || !coordinates) return [];

    const { routeSummary, routeStops } = details;
    const { route, line, origin, destination } = routeSummary;
    const mappedStops = routeStops.flatMap(({ stop }) =>
      stop.coordinates ? [[stop.coordinates.longitude, stop.coordinates.latitude] as const] : [],
    );
    if (mappedStops.length !== route.stopIds.length) return [];

    const geometry = measureRoute(coordinates);
    const stopDistances = projectStops(
      geometry,
      mappedStops.map(([lon, lat]) => [lon, lat]),
    );
    if (!stopDistances) return [];

    return [
      {
        routeId,
        stopIds: new Set(route.stopIds),
        transportType: line.transportType,
        label: formatTransportLabel(line) + ' · ' + origin + ' → ' + destination,
        geometry,
        stopDistances,
        trips: {
          weekday: buildVehicleTrips(
            routeStops.map(({ schedule }) => schedule?.departures.weekday ?? []),
            stopDistances,
          ),
          weekend: buildVehicleTrips(
            routeStops.map(({ schedule }) => schedule?.departures.weekend ?? []),
            stopDistances,
          ),
        },
      },
    ];
  });

export const createVehiclePositions = () => {
  const routes = buildPilotRoutes();
  let serviceMinute = -1;
  let minutesToday = 0;
  let serviceDayTypes: ReturnType<typeof getDayType>[] = [];

  return (now: Date, selectedRouteId?: string, selectedStopId?: string) => {
    // Часы и тип дня пересчитываем раз в минуту, а движение уточняем по секундам.
    const minute = Math.floor(now.getTime() / 60_000);
    if (minute !== serviceMinute) {
      serviceMinute = minute;
      serviceDayTypes = [getDayType(now, -1), getDayType(now)];
      minutesToday = timeToMinutes(formatTransportTime(now));
    }

    const minutes = minutesToday + (now.getSeconds() + now.getMilliseconds() / 1000) / 60;
    const matchingRoutes = routes.filter(({ routeId, stopIds }) =>
      selectedRouteId
        ? routeId === selectedRouteId
        : !selectedStopId || stopIds.has(selectedStopId),
    );

    return matchingRoutes.flatMap(
      ({ routeId, transportType, label, trips, geometry, stopDistances }) =>
        serviceDayTypes.flatMap((dayType, dayIndex) => {
          const dayOffset = dayIndex - 1;
          const serviceMinutes = minutes - dayOffset * 1440;

          return trips[dayType].flatMap((trip) => {
            const coordinates = getVehiclePosition(geometry, stopDistances, trip, serviceMinutes);
            if (!coordinates) return [];

            return {
              id: routeId + ':' + (minute - minutesToday + dayOffset * 1440) + ':' + trip.times[0],
              routeId,
              transportType,
              label,
              coordinates,
            };
          });
        }),
    );
  };
};

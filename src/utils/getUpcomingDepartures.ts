import type { Schedule, UpcomingDeparture } from '../domain/schedule';
import { formatTransportTime, getDayType, timeToMinutes } from './transportTime';

export const getUpcomingDepartures = (schedule: Schedule, now: Date): UpcomingDeparture[] => {
  const currentMinutes = timeToMinutes(formatTransportTime(now));
  const futureDepartures: { departure: UpcomingDeparture; minutesUntil: number }[] = [];

  for (let serviceDayOffset = -1; serviceDayOffset <= 7; serviceDayOffset++) {
    const departures = schedule.departures[getDayType(now, serviceDayOffset)];

    for (const departure of departures) {
      const departureMinutes = serviceDayOffset * 1440 + departure.serviceMinutes;
      const minutesUntil = departureMinutes - currentMinutes;

      if (minutesUntil >= 0) {
        futureDepartures.push({
          departure: { ...departure, dayOffset: Math.floor(departureMinutes / 1440) },
          minutesUntil,
        });
      }
    }
  }

  const uniqueDepartures = new Map<number, UpcomingDeparture>();

  for (const { departure, minutesUntil } of futureDepartures.sort(
    (a, b) => a.minutesUntil - b.minutesUntil,
  )) {
    if (!uniqueDepartures.has(minutesUntil)) {
      uniqueDepartures.set(minutesUntil, departure);
    }
  }

  return [...uniqueDepartures.values()].slice(0, 4);
};

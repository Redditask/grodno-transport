import type { Schedule, UpcomingDeparture } from '../domain/schedule';
import { formatTransportTime, getDayType, timeToMinutes } from './transportTime';

export const upcomingDepartures = (schedule: Schedule, now: Date): UpcomingDeparture[] => {
  const currentMinutes = timeToMinutes(formatTransportTime(now));
  const allDepartures = [...schedule.departures.weekday, ...schedule.departures.weekend];
  const previousDays = Math.max(
    0,
    ...allDepartures.map((item) => Math.floor(item.serviceMinutes / 1440)),
  );
  const candidates: { departure: UpcomingDeparture; minutesUntil: number }[] = [];

  // Include the previous service day: its last departures can occur after midnight.
  for (let serviceDay = -previousDays; serviceDay <= 7; serviceDay++) {
    const departures = schedule.departures[getDayType(now, serviceDay)];

    for (const departure of departures) {
      const absoluteMinutes = serviceDay * 1440 + departure.serviceMinutes;
      const minutesUntil = absoluteMinutes - currentMinutes;

      if (minutesUntil >= 0) {
        candidates.push({
          departure: { ...departure, dayOffset: Math.floor(absoluteMinutes / 1440) },
          minutesUntil,
        });
      }
    }
  }

  const unique = new Map<number, UpcomingDeparture>();

  for (const candidate of candidates.sort((a, b) => a.minutesUntil - b.minutesUntil)) {
    if (!unique.has(candidate.minutesUntil)) {
      unique.set(candidate.minutesUntil, candidate.departure);
    }
  }

  return [...unique.values()].slice(0, 4);
};

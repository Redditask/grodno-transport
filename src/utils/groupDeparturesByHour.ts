import type { Departure } from '../domain/schedule';

export interface DepartureHour {
  hour: string;
  dayOffset: number;
  departures: Departure[];
}

export const groupDeparturesByHour = (departures: Departure[]): DepartureHour[] => {
  const groups = new Map<string, DepartureHour>();

  for (const departure of [...departures].sort((a, b) => a.serviceMinutes - b.serviceMinutes)) {
    const dayOffset = Math.floor(departure.serviceMinutes / 1440);
    const hour = String(Math.floor(departure.serviceMinutes / 60) % 24).padStart(2, '0');
    const key = `${dayOffset}:${hour}`;
    const group = groups.get(key) ?? { hour, dayOffset, departures: [] };

    group.departures.push(departure);
    groups.set(key, group);
  }

  return [...groups.values()];
};

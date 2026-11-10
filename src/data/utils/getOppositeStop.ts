import type { Stop } from '@/domain/stop';

const normalizeName = (name: string): string =>
  name.trim().toLocaleLowerCase('ru').replaceAll('ё', 'е').replace(/\s+/g, ' ');

export const getOppositeStop = (stops: Stop[], stop: Stop): Stop | undefined => {
  const name = normalizeName(stop.name);
  const matchingStops = stops
    .filter((otherStop) => normalizeName(otherStop.name) === name)
    .sort((a, b) => a.id.localeCompare(b.id, 'ru', { numeric: true }));

  if (matchingStops.length < 2 || matchingStops.some((otherStop) => !otherStop.directionHint)) {
    return undefined;
  }

  const currentIndex = matchingStops.findIndex((otherStop) => otherStop.id === stop.id);

  return matchingStops[(currentIndex + 1) % matchingStops.length];
};

import type { TransportData } from '@/data/transportData';
import type { Route } from '@/domain/route';
import type { RouteSummary } from '@/types/route';

export const buildRouteSummary = (
  route: Route,
  { lines, stops }: TransportData,
): RouteSummary | undefined => {
  const line = lines.find((line) => line.id === route.lineId);
  if (!line) return undefined;

  const origin = stops.find((stop) => stop.id === route.stopIds[0])?.name ?? 'Начальная остановка';
  const destination =
    stops.find((stop) => stop.id === route.stopIds.at(-1))?.name ?? 'Конечная остановка';

  return { route, line, origin, destination };
};

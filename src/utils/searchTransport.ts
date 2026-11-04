import type { TransportData } from '@/data/transportData';
import type { TransportType } from '@/domain/line';
import type { Stop } from '@/domain/stop';
import type { RouteSummary } from '@/models/route';

import { buildRouteSummary } from './buildRouteSummary';

export interface TransportSearchResults {
  routes: RouteSummary[];
  stops: Stop[];
}

export interface ResultLimits {
  routes: number;
  stops: number;
}

const normalizeSearchText = (text: string): string =>
  text.trim().toLocaleLowerCase('ru').replaceAll('ё', 'е').replace(/\s+/g, ' ');

export const searchTransport = (
  query: string,
  transportData: TransportData,
): TransportSearchResults => {
  const searchText = normalizeSearchText(query);
  if (!searchText) return { routes: [], stops: [] };

  const typeMatch = searchText.match(/^(автобус(?:ы)?|троллейбус(?:ы)?)(?=\s|№|\d|$)/u);
  const transportType: TransportType | undefined = typeMatch
    ? typeMatch[1].startsWith('троллейбус')
      ? 'trolleybus'
      : 'bus'
    : undefined;
  const numberQuery = searchText
    .slice(typeMatch?.[0].length ?? 0)
    .replace(/^\s*№\s*/, '')
    .trim();

  const routes = transportData.routes
    .flatMap((route) => {
      const summary = buildRouteSummary(route, transportData);

      if (!summary || (transportType && summary.line.transportType !== transportType)) return [];

      if (!numberQuery && transportType) return [summary];

      return normalizeSearchText(summary.line.number).startsWith(numberQuery) ? [summary] : [];
    })
    .sort((a, b) => {
      const exactOrder =
        Number(normalizeSearchText(b.line.number) === numberQuery) -
        Number(normalizeSearchText(a.line.number) === numberQuery);

      return (
        exactOrder ||
        a.line.number.localeCompare(b.line.number, 'ru', { numeric: true }) ||
        a.line.transportType.localeCompare(b.line.transportType) ||
        a.route.id.localeCompare(b.route.id, 'ru', { numeric: true })
      );
    });

  const stops = transportType
    ? []
    : transportData.stops
        .filter((stop) => normalizeSearchText(stop.name).includes(searchText))
        .sort((a, b) => {
          const prefixOrder =
            Number(normalizeSearchText(b.name).startsWith(searchText)) -
            Number(normalizeSearchText(a.name).startsWith(searchText));

          return (
            prefixOrder ||
            a.name.localeCompare(b.name, 'ru', { numeric: true }) ||
            a.id.localeCompare(b.id, 'ru', { numeric: true })
          );
        });

  return { routes, stops };
};

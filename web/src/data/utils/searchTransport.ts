import type { TransportData } from '@/data/transportData';
import type { Stop } from '@/domain/stop';
import type { RouteSummary } from '@/types/route';
import type { TransportSearchResults } from '@/types/search';

import { buildRouteSummary } from './buildRouteSummary';

const normalizeSearchText = (text: string): string =>
  text.trim().toLocaleLowerCase('ru').replaceAll('ё', 'е').replace(/\s+/g, ' ');

const searchCollator = new Intl.Collator('ru', { numeric: true });

export const createTransportSearch = (transportData: TransportData) => {
  const routeEntries = transportData.routes
    .flatMap((route) => {
      const summary = buildRouteSummary(route, transportData);

      return summary ? [{ summary, number: normalizeSearchText(summary.line.number) }] : [];
    })
    .sort(
      ({ summary: a }, { summary: b }) =>
        searchCollator.compare(a.line.number, b.line.number) ||
        a.line.transportType.localeCompare(b.line.transportType) ||
        searchCollator.compare(a.route.id, b.route.id),
    );

  const stopEntries = transportData.stops
    .map((stop) => ({ stop, name: normalizeSearchText(stop.name) }))
    .sort(
      ({ stop: a }, { stop: b }) =>
        searchCollator.compare(a.name, b.name) || searchCollator.compare(a.id, b.id),
    );

  return (query: string): TransportSearchResults => {
    const searchText = normalizeSearchText(query);
    if (!searchText) return { routes: [], stops: [] };

    const typeMatch = searchText.match(/^(автобус(?:ы)?|троллейбус(?:ы)?)(?=\s|№|\d|$)/u);
    const transportType = typeMatch?.[1].startsWith('троллейбус') ? 'trolleybus' : 'bus';
    const numberQuery = searchText
      .slice(typeMatch?.[0].length ?? 0)
      .replace(/^\s*№\s*/, '')
      .trim();

    const exactRoutes: RouteSummary[] = [];
    const otherRoutes: RouteSummary[] = [];

    for (const { summary, number } of routeEntries) {
      if (typeMatch && summary.line.transportType !== transportType) continue;
      if (!number.startsWith(numberQuery)) continue;

      (number === numberQuery ? exactRoutes : otherRoutes).push(summary);
    }

    const prefixStops: Stop[] = [];
    const otherStops: Stop[] = [];

    if (!typeMatch) {
      for (const { stop, name } of stopEntries) {
        if (!name.includes(searchText)) continue;

        (name.startsWith(searchText) ? prefixStops : otherStops).push(stop);
      }
    }

    return { routes: [...exactRoutes, ...otherRoutes], stops: [...prefixStops, ...otherStops] };
  };
};

// Модульные тесты используют эту функцию, чтобы выполнить один запрос на тестовых данных.
export const searchTransport = (query: string, transportData: TransportData) =>
  createTransportSearch(transportData)(query);

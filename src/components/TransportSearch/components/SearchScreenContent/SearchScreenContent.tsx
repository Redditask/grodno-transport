import type { TransportData } from '@/data/transportData';
import { buildRouteSummary } from '@/utils/buildRouteSummary';
import { buildStopRouteItems } from '@/utils/buildStopRouteItems';
import type { SearchScreen } from '@/utils/searchNavigation';
import type { TransportSearchResults } from '@/utils/searchTransport';
import type { ResultLimits } from '@/utils/searchTransport';

import { RouteStopsPanel } from '../RouteStopsPanel/RouteStopsPanel';
import { SchedulePanel } from '../SchedulePanel/SchedulePanel';
import { SearchResults } from '../SearchResults/SearchResults';
import { StopRoutesPanel } from '../StopRoutesPanel/StopRoutesPanel';

interface SearchScreenContentProps {
  screen: SearchScreen;
  transportData: TransportData;
  results: TransportSearchResults;
  limits: ResultLimits;
  onShowMore: (group: keyof ResultLimits) => void;
  onOpenScreen: (screen: SearchScreen) => void;
}

export const SearchScreenContent = ({
  screen,
  transportData,
  results,
  limits,
  onShowMore,
  onOpenScreen,
}: SearchScreenContentProps) => {
  if (screen.kind === 'results') {
    return (
      <SearchResults
        results={results}
        limits={limits}
        onShowMore={onShowMore}
        onSelectStop={(stopId) => onOpenScreen({ kind: 'stopRoutes', stopId })}
        onSelectRoute={(routeId) => onOpenScreen({ kind: 'routeStops', routeId })}
      />
    );
  }

  if (screen.kind === 'stopRoutes') {
    const stop = transportData.stops.find((stop) => stop.id === screen.stopId);

    if (!stop) return <p role="alert">Остановка не найдена.</p>;

    return (
      <StopRoutesPanel
        stop={stop}
        routeItems={buildStopRouteItems(stop, transportData)}
        onSelectRoute={(routeId) => onOpenScreen({ kind: 'schedule', routeId, stopId: stop.id })}
      />
    );
  }

  if (screen.kind === 'routeStops') {
    const route = transportData.routes.find((route) => route.id === screen.routeId);
    const routeSummary = route ? buildRouteSummary(route, transportData) : undefined;

    if (!routeSummary) return <p role="alert">Маршрут не найден.</p>;

    return (
      <RouteStopsPanel
        routeSummary={routeSummary}
        transportData={transportData}
        onSelectStop={(stopId) =>
          onOpenScreen({ kind: 'schedule', routeId: screen.routeId, stopId })
        }
      />
    );
  }

  return (
    <SchedulePanel
      key={`${screen.routeId}:${screen.stopId}`}
      routeId={screen.routeId}
      stopId={screen.stopId}
      transportData={transportData}
    />
  );
};

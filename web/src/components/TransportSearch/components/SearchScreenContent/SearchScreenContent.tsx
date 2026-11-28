import { transportCatalog } from '@/data/transportData';
import type { ResultLimits, SearchScreen, TransportSearchResults } from '@/types/search';

import { RouteStopsPanel } from '../RouteStopsPanel/RouteStopsPanel';
import { SchedulePanel } from '../SchedulePanel/SchedulePanel';
import { SearchResults } from '../SearchResults/SearchResults';
import { StopRoutesPanel } from '../StopRoutesPanel/StopRoutesPanel';

interface SearchScreenContentProps {
  screen: SearchScreen;
  results: TransportSearchResults;
  limits: ResultLimits;
  onShowMore: (group: keyof ResultLimits) => void;
  onOpenScreen: (screen: SearchScreen) => void;
  onReplaceScreen: (screen: SearchScreen) => void;
}

export const SearchScreenContent = ({
  screen,
  results,
  limits,
  onShowMore,
  onOpenScreen,
  onReplaceScreen,
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
    const details = transportCatalog.getStopDetails(screen.stopId);

    if (!details) return <p role="alert">Остановка не найдена.</p>;

    return (
      <StopRoutesPanel
        {...details}
        onSwitchStop={(stopId) => onReplaceScreen({ kind: 'stopRoutes', stopId })}
        onSelectRoute={(routeId) =>
          onOpenScreen({ kind: 'schedule', routeId, stopId: screen.stopId })
        }
      />
    );
  }

  if (screen.kind === 'routeStops') {
    const details = transportCatalog.getRouteDetails(screen.routeId);

    if (!details) return <p role="alert">Маршрут не найден.</p>;

    return (
      <RouteStopsPanel
        {...details}
        onSwitchRoute={(routeId) => onReplaceScreen({ kind: 'routeStops', routeId })}
        onSelectStop={(stopId) =>
          onOpenScreen({ kind: 'schedule', routeId: screen.routeId, stopId })
        }
      />
    );
  }

  const details = transportCatalog.getScheduleDetails(screen.routeId, screen.stopId);

  if (!details) return <p role="alert">Остановка или маршрут не найдены.</p>;

  return <SchedulePanel key={`${screen.routeId}:${screen.stopId}`} {...details} />;
};

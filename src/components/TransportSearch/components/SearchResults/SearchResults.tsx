import type { ResultLimits, TransportSearchResults } from '@/types/search';
import { formatTransportLabel } from '@/utils/formatTransportLabel';

import { SearchResultButton } from '../SearchResultButton/SearchResultButton';
import { StopBadge } from '../StopBadge/StopBadge';
import { TransportBadge } from '../TransportBadge/TransportBadge';

import panel from '../../styles/SearchPanel.module.scss';
import styles from './SearchResults.module.scss';

interface SearchResultsProps {
  results: TransportSearchResults;
  limits: ResultLimits;
  onShowMore: (group: keyof ResultLimits) => void;
  onSelectStop: (stopId: string) => void;
  onSelectRoute: (routeId: string) => void;
}

export const SearchResults = ({
  results,
  limits,
  onShowMore,
  onSelectStop,
  onSelectRoute,
}: SearchResultsProps) => {
  const groups = ['routes', 'stops'] as const;

  if (!results.routes.length && !results.stops.length) {
    return (
      <p className={styles.empty} role="status">
        Ничего не найдено. Попробуйте другое название или номер.
      </p>
    );
  }

  return (
    <div className={styles.results}>
      <p className={styles.summary} role="status">
        Маршрутов: {results.routes.length} · Остановок: {results.stops.length}
      </p>

      {groups.map((group) =>
        results[group].length > 0 ? (
          <section key={group} aria-labelledby={`search-${group}`}>
            <h2 id={`search-${group}`} className={styles.heading}>
              {group === 'routes' ? 'Маршруты' : 'Остановки'}
            </h2>

            <ul className={styles.list}>
              {group === 'routes'
                ? results.routes
                    .slice(0, limits.routes)
                    .map(({ route, line, origin, destination }) => (
                      <li key={route.id}>
                        <SearchResultButton
                          resultId={route.id}
                          transportType={line.transportType}
                          onClick={() => onSelectRoute(route.id)}
                        >
                          <TransportBadge line={line} />

                          <span className={styles.details}>
                            <span className={styles.label}>{formatTransportLabel(line)}</span>

                            <span className={styles.title}>
                              {origin} → {destination}
                            </span>
                          </span>
                        </SearchResultButton>
                      </li>
                    ))
                : results.stops.slice(0, limits.stops).map((stop) => (
                    <li key={stop.id}>
                      <SearchResultButton resultId={stop.id} onClick={() => onSelectStop(stop.id)}>
                        <StopBadge />

                        <span className={styles.details}>
                          <span className={styles.label}>Остановка</span>

                          <span className={styles.title}>{stop.name}</span>

                          {stop.directionHint ? (
                            <span className={`${panel.directionHint} ${styles.stopDirection}`}>
                              {stop.directionHint}
                            </span>
                          ) : null}
                        </span>
                      </SearchResultButton>
                    </li>
                  ))}
            </ul>

            {results[group].length > limits[group] ? (
              <button
                className={styles.more}
                type="button"
                onClick={() => onShowMore(group)}
                aria-label={`Показать ещё ${group === 'routes' ? 'маршруты' : 'остановки'}`}
              >
                Показать ещё
              </button>
            ) : null}
          </section>
        ) : null,
      )}
    </div>
  );
};

import type { SearchScreen } from '@/types/search';

import styles from './SearchScreenNavigation.module.scss';

interface SearchScreenNavigationProps {
  screen: SearchScreen;
  previousScreen?: SearchScreen;
  hasQuery: boolean;
  onBack: () => void;
  onOpenScreen: (screen: SearchScreen) => void;
}

const backLabels = {
  stopRoutes: 'К другим маршрутам',
  routeStops: 'К другим остановкам',
  schedule: 'К расписанию',
};

const getScheduleShortcut = (
  screen: SearchScreen,
  previousScreen?: SearchScreen,
): { label: string; target: SearchScreen } | undefined => {
  if (screen.kind !== 'schedule') return;

  if (previousScreen?.kind === 'routeStops') {
    return {
      label: 'К остановке',
      target: { kind: 'stopRoutes', stopId: screen.stopId },
    };
  }

  if (previousScreen?.kind === 'stopRoutes') {
    return {
      label: 'К маршруту',
      target: { kind: 'routeStops', routeId: screen.routeId },
    };
  }
};

export const SearchScreenNavigation = ({
  screen,
  previousScreen,
  hasQuery,
  onBack,
  onOpenScreen,
}: SearchScreenNavigationProps) => {
  if (screen.kind === 'results') return null;

  const previousKind = previousScreen?.kind;
  const backLabel =
    previousKind && previousKind !== 'results'
      ? backLabels[previousKind]
      : hasQuery
        ? 'К результатам'
        : 'К карте';
  const scheduleShortcut = getScheduleShortcut(screen, previousScreen);

  return (
    <div className={styles.navigation}>
      <button className={styles.button} type="button" onClick={() => onBack()}>
        <span aria-hidden="true">←</span>
        {backLabel}
      </button>

      {scheduleShortcut ? (
        <button
          className={styles.button}
          type="button"
          data-result-id="schedule-shortcut"
          onClick={() => onOpenScreen(scheduleShortcut.target)}
        >
          {scheduleShortcut.label}
          <span aria-hidden="true">→</span>
        </button>
      ) : null}
    </div>
  );
};

import type { KeyboardEvent } from 'react';
import { useCallback, useRef, useState } from 'react';

import { AppFooter } from '@/components/AppFooter/AppFooter';
import { AppHeader } from '@/components/AppHeader/AppHeader';
import { CityMap } from '@/components/CityMap/CityMap';
import { TransportSearch } from '@/components/TransportSearch/TransportSearch';
import { useTransportNavigation } from '@/hooks/useTransportNavigation';

import styles from './App.module.scss';

export const App = () => {
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);

  const navigation = useTransportNavigation();
  const { open, back, reset, selectedStopId, selectedRouteId } = navigation;

  const handleOpenStopFromMap = useCallback(
    (stopId: string) => {
      setIsSearchCollapsed(false);

      open({ kind: 'stopRoutes', stopId }, 'map');
    },
    [open],
  );
  const handleOpenRouteFromMap = useCallback(
    (routeId: string) => {
      setIsSearchCollapsed(false);

      open({ kind: 'routeStops', routeId }, 'map');
    },
    [open],
  );

  const handleBackOnEscape = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape') return;

    event.preventDefault();
    event.stopPropagation();

    back();
  };

  return (
    <div className={styles.page}>
      <AppHeader />

      <main className={styles.mapStage}>
        <CityMap
          selectedStopId={selectedStopId}
          selectedRouteId={selectedRouteId}
          overlayRef={searchPanelRef}
          onSelectStop={handleOpenStopFromMap}
          onSelectRoute={handleOpenRouteFromMap}
          onClearSelection={reset}
          onKeyDown={handleBackOnEscape}
        />

        <div className={styles.searchPanel} ref={searchPanelRef}>
          <TransportSearch
            navigation={navigation}
            isCollapsed={isSearchCollapsed}
            onCollapseChange={setIsSearchCollapsed}
            onKeyDown={handleBackOnEscape}
          />
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

import type { KeyboardEvent } from 'react';
import { useCallback, useRef } from 'react';

import { AppFooter } from '@/components/AppFooter/AppFooter';
import { AppHeader } from '@/components/AppHeader/AppHeader';
import { CityMap } from '@/components/CityMap/CityMap';
import { TransportSearch } from '@/components/TransportSearch/TransportSearch';
import { useTransportNavigation } from '@/hooks/useTransportNavigation';

import styles from './App.module.scss';

export const App = () => {
  const searchPanelRef = useRef<HTMLDivElement>(null);

  const navigation = useTransportNavigation();

  const { open, back, selectedStopId, selectedRouteId } = navigation;

  const handleOpenStopFromMap = useCallback(
    (stopId: string) => open({ kind: 'stopRoutes', stopId }, 'map'),
    [open],
  );
  const hasMapSelection = Boolean(selectedStopId || selectedRouteId);

  const handleDismissMapSelection = () => {
    back(selectedStopId ? 'unselected' : undefined);
  };

  const handleMapStageKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || !hasMapSelection) return;

    event.preventDefault();
    event.stopPropagation();

    handleDismissMapSelection();
  };

  return (
    <div className={styles.page}>
      <AppHeader />

      <main className={styles.mapStage} onKeyDownCapture={handleMapStageKeyDown}>
        <CityMap
          selectedStopId={selectedStopId}
          selectedRouteId={selectedRouteId}
          overlayRef={searchPanelRef}
          onSelectStop={handleOpenStopFromMap}
          onClearSelection={handleDismissMapSelection}
        />

        <div className={styles.searchPanel} ref={searchPanelRef}>
          <TransportSearch navigation={navigation} />
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

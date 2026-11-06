import { AppFooter } from '@/components/AppFooter/AppFooter';
import { AppHeader } from '@/components/AppHeader/AppHeader';
import { CityMap } from '@/components/CityMap/CityMap';
import { TransportSearch } from '@/components/TransportSearch/TransportSearch';
import { useTransportNavigation } from '@/hooks/useTransportNavigation';

import styles from './App.module.scss';

export const App = () => {
  const {
    screenHistory,
    setScreenHistory,
    selectedStopId,
    handleOpenStopFromMap,
    handleDismissMapSelection,
    handleMapStageKeyDown,
  } = useTransportNavigation();

  return (
    <div className={styles.page}>
      <AppHeader />

      <main className={styles.mapStage} onKeyDownCapture={handleMapStageKeyDown}>
        <CityMap
          selectedStopId={selectedStopId}
          onSelectStop={handleOpenStopFromMap}
          onClearStop={handleDismissMapSelection}
        />

        <div className={styles.searchPanel}>
          <TransportSearch screenHistory={screenHistory} onScreenHistoryChange={setScreenHistory} />
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

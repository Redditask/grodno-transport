import { useCallback, useState } from 'react';

import type { SearchHistoryEntry } from '@/types/search';

export const useTransportNavigation = () => {
  const [screenHistory, setScreenHistory] = useState<SearchHistoryEntry[]>([
    { screen: { kind: 'results' }, scrollTop: 0 },
  ]);

  const activeScreen = screenHistory[screenHistory.length - 1].screen;

  const selectedStopId =
    activeScreen.kind === 'stopRoutes' || activeScreen.kind === 'schedule'
      ? activeScreen.stopId
      : undefined;

  const handleOpenStopFromMap = useCallback((stopId: string) => {
    setScreenHistory(([results]) => [
      results,
      { screen: { kind: 'stopRoutes', stopId }, scrollTop: 0 },
    ]);
  }, []);

  return {
    screenHistory,
    setScreenHistory,
    selectedStopId,
    handleOpenStopFromMap,
  };
};

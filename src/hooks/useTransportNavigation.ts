import type { KeyboardEvent } from 'react';
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

  const handleDismissMapSelection = useCallback(() => {
    setScreenHistory((history) => {
      let remainingLength = history.length;

      while (remainingLength > 1) {
        const { kind } = history[remainingLength - 1].screen;
        if (kind === 'results' || kind === 'routeStops') break;

        remainingLength -= 1;
      }

      return remainingLength === history.length ? history : history.slice(0, remainingLength);
    });
  }, []);

  const handleMapStageKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || !selectedStopId) return;

    event.preventDefault();
    event.stopPropagation();
    handleDismissMapSelection();
  };

  return {
    screenHistory,
    setScreenHistory,
    selectedStopId,
    handleOpenStopFromMap,
    handleDismissMapSelection,
    handleMapStageKeyDown,
  };
};

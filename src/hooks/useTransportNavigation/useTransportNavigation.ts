import { useCallback, useReducer } from 'react';

import type { SearchScreen } from '@/types/search';

import type { OpenFrom } from './utils';
import {
  getActiveSearchEntry,
  getSelectedStopId,
  initialSearchHistory,
  updateSearchHistory,
} from './utils';

export const useTransportNavigation = () => {
  const [screenHistory, dispatch] = useReducer(updateSearchHistory, initialSearchHistory);

  const open = useCallback((screen: SearchScreen, from: OpenFrom) => {
    dispatch({ kind: 'open', screen, from });
  }, []);

  const activeEntry = getActiveSearchEntry(screenHistory);
  const activeScreen = activeEntry.screen;
  const previousScreen = screenHistory.at(-2)?.screen;

  const selectedStopId = getSelectedStopId(screenHistory);
  const selectedRouteId = activeScreen.kind === 'routeStops' ? activeScreen.routeId : undefined;

  const replace = (screen: SearchScreen) => dispatch({ kind: 'replace', screen });
  const back = (until?: 'unselected') => dispatch({ kind: 'back', until });
  const reset = () => dispatch({ kind: 'reset' });

  return {
    activeEntry,
    activeScreen,
    previousScreen,
    open,
    replace,
    back,
    reset,
    selectedStopId,
    selectedRouteId,
  };
};

import type { SearchHistoryEntry, SearchScreen } from '@/types/search';

export type OpenFrom = Pick<SearchHistoryEntry, 'scrollTop' | 'focusId'> | 'map';

type NavigationAction =
  | { kind: 'open'; screen: SearchScreen; from: OpenFrom }
  | { kind: 'replace'; screen: SearchScreen }
  | { kind: 'back' }
  | { kind: 'reset' };

type SearchHistory = [SearchHistoryEntry, ...SearchHistoryEntry[]];

export const getActiveSearchEntry = (history: SearchHistory) => history.at(-1) ?? history[0];

const getScreenStopId = (screen: SearchScreen) =>
  screen.kind === 'stopRoutes' || screen.kind === 'schedule' ? screen.stopId : undefined;

export const getSelectedStopId = (history: SearchHistory) =>
  getScreenStopId(getActiveSearchEntry(history).screen);

export const initialSearchHistory: SearchHistory = [{ screen: { kind: 'results' }, scrollTop: 0 }];

export const updateSearchHistory = (
  history: SearchHistory,
  action: NavigationAction,
): SearchHistory => {
  switch (action.kind) {
    case 'open': {
      const nextEntry = { screen: action.screen, scrollTop: 0 };

      if (action.from === 'map') {
        if (
          nextEntry.screen.kind === 'stopRoutes' &&
          nextEntry.screen.stopId === getSelectedStopId(history)
        ) {
          return history;
        }

        const currentEntry = getActiveSearchEntry(history);

        if (
          nextEntry.screen.kind === 'routeStops' &&
          currentEntry.screen.kind === 'routeStops' &&
          nextEntry.screen.routeId === currentEntry.screen.routeId
        ) {
          return history;
        }

        return [...history, nextEntry];
      }

      const nextHistory: SearchHistory = [...history];
      nextHistory[nextHistory.length - 1] = {
        ...getActiveSearchEntry(history),
        ...action.from,
      };
      nextHistory.push(nextEntry);

      return nextHistory;
    }
    case 'replace':
      if (history.length === 1) return history;

      return [history[0], ...history.slice(1, -1), { screen: action.screen, scrollTop: 0 }];
    case 'back':
      return history.length === 1 ? history : [history[0], ...history.slice(1, -1)];
    case 'reset':
      return initialSearchHistory;
  }
};

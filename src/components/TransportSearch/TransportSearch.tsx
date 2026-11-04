import type { ChangeEvent, KeyboardEvent } from 'react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { transportData } from '@/data/transportData';
import type { SearchHistoryEntry, SearchScreen } from '@/utils/searchNavigation';
import { createSearchHistory } from '@/utils/searchNavigation';
import type { ResultLimits } from '@/utils/searchTransport';
import { searchTransport } from '@/utils/searchTransport';

import { SearchScreenContent } from './components/SearchScreenContent/SearchScreenContent';

import panel from './styles/SearchPanel.module.scss';
import styles from './TransportSearch.module.scss';

export const TransportSearch = () => {
  const [query, setQuery] = useState('');
  const [limits, setLimits] = useState<ResultLimits>({ routes: 10, stops: 10 });
  const [screenHistory, setScreenHistory] = useState<SearchHistoryEntry[]>(createSearchHistory);

  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeEntry = screenHistory[screenHistory.length - 1];
  const screen = activeEntry.screen;
  const previousScreen = screenHistory.at(-2)?.screen;
  const backLabel =
    previousScreen?.kind === 'stopRoutes'
      ? 'К маршрутам'
      : previousScreen?.kind === 'routeStops'
        ? 'К остановкам'
        : 'К результатам';

  const hasQuery = query.trim().length > 0;
  const results = useMemo(() => searchTransport(query, transportData), [query]);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    content.scrollTop = activeEntry.scrollTop;

    const focusTarget = activeEntry.focusId
      ? [...content.querySelectorAll<HTMLElement>('[data-result-id]')].find(
          (element) => element.dataset.resultId === activeEntry.focusId,
        )
      : screen.kind !== 'results'
        ? content.querySelector<HTMLElement>('[data-screen-heading]')
        : null;

    focusTarget?.focus({ preventScroll: true });
  }, [activeEntry, screen.kind]);

  const openScreen = (nextScreen: SearchScreen) => {
    const scrollTop = contentRef.current?.scrollTop ?? 0;
    const focusId =
      document.activeElement instanceof HTMLElement
        ? document.activeElement.dataset.resultId
        : undefined;

    setScreenHistory((history) => [
      ...history.slice(0, -1),
      { ...history[history.length - 1], scrollTop, focusId },
      { screen: nextScreen, scrollTop: 0 },
    ]);
  };

  const handleBack = () =>
    setScreenHistory((history) => (history.length > 1 ? history.slice(0, -1) : history));

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    setLimits({ routes: 10, stops: 10 });
    setScreenHistory(createSearchHistory());
  };

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) =>
    updateQuery(event.target.value);

  const handleClearQuery = () => {
    updateQuery('');

    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();

      if (screenHistory.length > 1) handleBack();
    }
  };

  const handleShowMore = (group: keyof ResultLimits) =>
    setLimits((current) => ({ ...current, [group]: current[group] + 10 }));

  return (
    <section
      className={styles.search}
      aria-label="Поиск транспорта и остановок"
      onKeyDown={handleKeyDown}
    >
      <div className={styles.searchBar}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>

        <input
          ref={inputRef}
          className={styles.input}
          type="search"
          aria-label="Поиск остановки или номера транспорта"
          placeholder="Остановка или номер транспорта"
          autoComplete="off"
          value={query}
          onChange={handleQueryChange}
        />

        {query.length > 0 ? (
          <button
            className={styles.clear}
            type="button"
            aria-label="Очистить поиск"
            onClick={handleClearQuery}
          >
            ×
          </button>
        ) : null}
      </div>

      {hasQuery ? (
        <div className={styles.content} ref={contentRef}>
          {screen.kind !== 'results' ? (
            <button className={panel.back} type="button" onClick={handleBack}>
              <span aria-hidden="true">←</span>
              {backLabel}
            </button>
          ) : null}

          <SearchScreenContent
            screen={screen}
            transportData={transportData}
            results={results}
            limits={limits}
            onShowMore={handleShowMore}
            onOpenScreen={openScreen}
          />
        </div>
      ) : null}
    </section>
  );
};

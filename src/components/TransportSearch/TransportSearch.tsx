import type { ChangeEvent, KeyboardEvent } from 'react';
import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { transportCatalog } from '@/data/transportData';
import type { useTransportNavigation } from '@/hooks/useTransportNavigation';
import type { ResultLimits, SearchScreen } from '@/types/search';

import { SearchScreenContent } from './components/SearchScreenContent/SearchScreenContent';

import panel from './styles/SearchPanel.module.scss';
import styles from './TransportSearch.module.scss';

interface TransportSearchProps {
  navigation: ReturnType<typeof useTransportNavigation>;
}

export const TransportSearch = ({ navigation }: TransportSearchProps) => {
  const { activeEntry, previousScreen, back, reset } = navigation;
  const [query, setQuery] = useState('');
  const [limits, setLimits] = useState<ResultLimits>({ routes: 10, stops: 10 });
  const [isCollapsed, setIsCollapsed] = useState(false);

  const contentId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const screen = activeEntry.screen;
  const hasQuery = query.trim().length > 0;
  const hasContent = hasQuery || screen.kind !== 'results';
  const backLabel =
    previousScreen?.kind === 'stopRoutes'
      ? 'К маршрутам'
      : previousScreen?.kind === 'routeStops'
        ? 'К остановкам'
        : hasQuery
          ? 'К результатам'
          : 'К карте';

  const results = useMemo(() => transportCatalog.search(query), [query]);

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

    navigation.open(nextScreen, { scrollTop, focusId });
  };

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    setIsCollapsed(false);
    setLimits({ routes: 10, stops: 10 });
    reset();
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

      back();
    }
  };

  const handleShowMore = (group: keyof ResultLimits) =>
    setLimits((current) => ({ ...current, [group]: current[group] + 10 }));

  const handleTogglePanel = () => setIsCollapsed((collapsed) => !collapsed);

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

        {hasContent ? (
          <button
            className={styles.togglePanel}
            type="button"
            aria-controls={contentId}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Развернуть панель поиска' : 'Свернуть панель поиска'}
            onClick={handleTogglePanel}
          >
            <svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
              <path
                d="m5 12 5-5 5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {hasContent ? (
        <div
          className={styles.content}
          id={contentId}
          data-collapsed={isCollapsed}
          ref={contentRef}
        >
          {screen.kind !== 'results' ? (
            <button className={panel.back} type="button" onClick={() => back()}>
              <span aria-hidden="true">←</span>
              {backLabel}
            </button>
          ) : null}

          <SearchScreenContent
            screen={screen}
            results={results}
            limits={limits}
            onShowMore={handleShowMore}
            onOpenScreen={openScreen}
            onReplaceScreen={navigation.replace}
          />
        </div>
      ) : null}
    </section>
  );
};

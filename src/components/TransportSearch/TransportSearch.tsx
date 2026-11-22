import type { ChangeEvent, KeyboardEventHandler, UIEvent } from 'react';
import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { transportCatalog } from '@/data/transportData';
import type { useTransportNavigation } from '@/hooks/useTransportNavigation';
import type { ResultLimits, SearchScreen } from '@/types/search';

import { SearchScreenContent } from './components/SearchScreenContent/SearchScreenContent';
import { SearchScreenNavigation } from './components/SearchScreenNavigation/SearchScreenNavigation';

import styles from './TransportSearch.module.scss';

const scrollThreshold = 120;

interface TransportSearchProps {
  navigation: ReturnType<typeof useTransportNavigation>;
  isCollapsed: boolean;
  onCollapseChange: (isCollapsed: boolean) => void;
  onKeyDown: KeyboardEventHandler<HTMLElement>;
}

export const TransportSearch = ({
  navigation,
  isCollapsed,
  onCollapseChange,
  onKeyDown,
}: TransportSearchProps) => {
  const { activeEntry, previousScreen, back, reset } = navigation;
  const [query, setQuery] = useState('');
  const [limits, setLimits] = useState<ResultLimits>({ routes: 10, stops: 10 });

  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const contentId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const screen = activeEntry.screen;
  const hasQuery = query.trim().length > 0;
  const hasContent = hasQuery || screen.kind !== 'results';

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
    setShowScrollToTop(false);
    onCollapseChange(false);
    setLimits({ routes: 10, stops: 10 });
    reset();
  };

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) =>
    updateQuery(event.target.value);

  const handleClearQuery = () => {
    updateQuery('');

    inputRef.current?.focus();
  };

  const handleShowMore = (group: keyof ResultLimits) =>
    setLimits((current) => ({ ...current, [group]: current[group] + 10 }));

  const handleTogglePanel = () => onCollapseChange(!isCollapsed);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setShowScrollToTop(event.currentTarget.scrollTop > scrollThreshold);
  };

  const handleScrollToTop = () => {
    const content = contentRef.current;
    if (!content) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    content.focus({ preventScroll: true });
    content.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
  };

  return (
    <section
      className={styles.search}
      aria-label="Поиск транспорта и остановок"
      onKeyDown={onKeyDown}
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
          tabIndex={-1}
          onScroll={handleScroll}
        >
          <SearchScreenNavigation
            screen={screen}
            previousScreen={previousScreen}
            hasQuery={hasQuery}
            onBack={back}
            onOpenScreen={openScreen}
          />

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

      {hasContent && showScrollToTop ? (
        <button
          className={styles.scrollToTop}
          type="button"
          aria-label="Прокрутить вверх"
          aria-controls={contentId}
          onClick={handleScrollToTop}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 19V5m-6 6 6-6 6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}
    </section>
  );
};

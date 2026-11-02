import type { KeyboardEvent } from 'react';
import { useEffect, useId, useRef, useState } from 'react';

import type { Route } from '../../domain/route';
import type { Stop } from '../../domain/stop';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import type { TransportData } from '../../utils/getStopRouteItems';
import { getStopRouteItems } from '../../utils/getStopRouteItems';
import type { DayType } from '../../utils/transportTime';
import { getDayType } from '../../utils/transportTime';
import { StopButton } from '../StopButton/StopButton';
import { RouteListPanel } from './components/RouteListPanel/RouteListPanel';
import { SchedulePanel } from './components/SchedulePanel/SchedulePanel';

import styles from './StopCard.module.scss';

type CardView =
  { kind: 'closed' } | { kind: 'routes' } | { kind: 'schedule'; routeId: Route['id'] };

export interface StopCardProps {
  stop: Stop;
  data: TransportData;
}

export const StopCard = ({ stop, data }: StopCardProps) => {
  const now = useCurrentTime();
  const [view, setView] = useState<CardView>({ kind: 'closed' });
  const [scheduleDay, setScheduleDay] = useState<DayType>(() => getDayType(now));

  const panelId = useId();

  const cardRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const todayType = getDayType(now);
  const routeItems = view.kind === 'closed' ? [] : getStopRouteItems(stop, data);

  const selectedItem =
    view.kind === 'schedule'
      ? routeItems.find(({ route }) => route.id === view.routeId)
      : undefined;

  useEffect(() => {
    if (view.kind !== 'closed')
      panelRef.current
        ?.querySelector<HTMLElement>('[data-panel-focus]')
        ?.focus({ preventScroll: true });
  }, [view.kind]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || view.kind === 'closed') return;

    event.preventDefault();

    if (view.kind === 'schedule') {
      setView({ kind: 'routes' });
    } else {
      setView({ kind: 'closed' });
      cardRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    }
  };

  const handleToggle = () =>
    setView((current) => (current.kind === 'closed' ? { kind: 'routes' } : { kind: 'closed' }));

  const handleSelect = (routeId: string) => {
    setScheduleDay(todayType);
    setView({ kind: 'schedule', routeId });
  };

  const handleBack = () => setView({ kind: 'routes' });

  return (
    <article className={styles.card} ref={cardRef} onKeyDown={handleKeyDown} aria-label={stop.name}>
      <StopButton
        stop={stop}
        expanded={view.kind !== 'closed'}
        panelId={panelId}
        onClick={handleToggle}
      />

      <div id={panelId} hidden={view.kind === 'closed'} ref={panelRef}>
        {view.kind === 'routes' ? (
          <RouteListPanel items={routeItems} onSelect={handleSelect} />
        ) : null}

        {view.kind === 'schedule' && selectedItem ? (
          <SchedulePanel
            item={selectedItem}
            scheduleDay={scheduleDay}
            todayType={todayType}
            onDayChange={setScheduleDay}
            onBack={handleBack}
          />
        ) : null}
      </div>
    </article>
  );
};

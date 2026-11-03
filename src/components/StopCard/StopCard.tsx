import type { KeyboardEvent } from 'react';
import { useEffect, useId, useRef, useState } from 'react';

import type { TransportData } from '../../data/transportData';
import type { Route } from '../../domain/route';
import type { Stop } from '../../domain/stop';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import { buildStopRouteItems } from '../../utils/buildStopRouteItems';
import type { DayType } from '../../utils/transportTime';
import { getDayType } from '../../utils/transportTime';
import { StopButton } from '../StopButton/StopButton';
import { RouteSchedulePanel } from './components/RouteSchedulePanel/RouteSchedulePanel';
import { StopRoutesPanel } from './components/StopRoutesPanel/StopRoutesPanel';

import styles from './StopCard.module.scss';

type CardView = { kind: 'routes' } | { kind: 'schedule'; routeId: Route['id'] };

export interface StopCardProps {
  stop: Stop;
  transportData: TransportData;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const StopCard = ({ stop, transportData, isOpen, onToggle, onClose }: StopCardProps) => {
  const now = useCurrentTime();
  const todayDayType = getDayType(now);
  const [view, setView] = useState<CardView>({ kind: 'routes' });
  const [selectedDayType, setSelectedDayType] = useState<DayType>(todayDayType);

  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  const routeItems = isOpen ? buildStopRouteItems(stop, transportData) : [];

  const selectedRouteItem =
    view.kind === 'schedule'
      ? routeItems.find(({ route }) => route.id === view.routeId)
      : undefined;

  useEffect(() => {
    if (isOpen)
      panelRef.current
        ?.querySelector<HTMLElement>('[data-panel-focus]')
        ?.focus({ preventScroll: true });
  }, [isOpen, view.kind]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || !isOpen) return;

    event.preventDefault();

    if (view.kind === 'schedule') {
      setView({ kind: 'routes' });
    } else {
      onClose();
      cardRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    }
  };

  const handleToggle = () => {
    setView({ kind: 'routes' });
    onToggle();
  };

  const handleSelectRoute = (routeId: string) => {
    setSelectedDayType(todayDayType);
    setView({ kind: 'schedule', routeId });
  };

  const handleBackToRoutes = () => setView({ kind: 'routes' });

  return (
    <article className={styles.card} ref={cardRef} onKeyDown={handleKeyDown} aria-label={stop.name}>
      <StopButton stop={stop} expanded={isOpen} panelId={panelId} onClick={handleToggle} />

      <div id={panelId} hidden={!isOpen} ref={panelRef}>
        {isOpen && view.kind === 'routes' ? (
          <StopRoutesPanel routeItems={routeItems} onSelectRoute={handleSelectRoute} />
        ) : null}

        {isOpen && view.kind === 'schedule' && selectedRouteItem ? (
          <RouteSchedulePanel
            routeItem={selectedRouteItem}
            selectedDayType={selectedDayType}
            todayDayType={todayDayType}
            onDayChange={setSelectedDayType}
            onBack={handleBackToRoutes}
          />
        ) : null}
      </div>
    </article>
  );
};

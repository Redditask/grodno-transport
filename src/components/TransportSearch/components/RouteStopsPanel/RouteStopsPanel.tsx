import type { TransportData } from '@/data/transportData';
import type { RouteSummary } from '@/types/route';
import { findStopSchedule } from '@/utils/findStopSchedule';
import { formatTransportLabel } from '@/utils/formatTransportLabel';

import { SwitchDirectionButton } from '../SwitchDirectionButton/SwitchDirectionButton';
import { TransportBadge } from '../TransportBadge/TransportBadge';
import { StopListItem } from './components/StopListItem/StopListItem';

import panel from '../../styles/SearchPanel.module.scss';
import styles from './RouteStopsPanel.module.scss';

interface RouteStopsPanelProps {
  routeSummary: RouteSummary;
  transportData: TransportData;
  onSwitchRoute: (routeId: string) => void;
  onSelectStop: (stopId: string) => void;
}

export const RouteStopsPanel = ({
  routeSummary,
  transportData,
  onSwitchRoute,
  onSelectStop,
}: RouteStopsPanelProps) => {
  const { route, line, origin, destination } = routeSummary;

  const oppositeRoute = transportData.routes.find(
    (otherRoute) => otherRoute.lineId === route.lineId && otherRoute.id !== route.id,
  );

  return (
    <div className={panel.panel} data-transport={line.transportType}>
      <div className={styles.heading}>
        <TransportBadge line={line} />

        <div>
          <p className={styles.label}>{formatTransportLabel(line)}</p>

          <h2 className={panel.heading} tabIndex={-1} data-screen-heading>
            {origin} → {destination}
          </h2>
        </div>
      </div>

      {oppositeRoute ? (
        <SwitchDirectionButton
          transportType={line.transportType}
          onClick={() => onSwitchRoute(oppositeRoute.id)}
        />
      ) : null}

      <p className={panel.caption}>Остановки по порядку · Ближайшие отправления по расписанию</p>

      <ol className={styles.stops}>
        {route.stopIds.map((stopId, index) => {
          const stop = transportData.stops.find((stop) => stop.id === stopId);
          if (!stop) return null;

          const schedule = findStopSchedule(transportData.schedules, route.id, stopId);

          return (
            <StopListItem
              key={`${index}:${stopId}`}
              resultId={`${index}:${stopId}`}
              stop={stop}
              schedule={schedule}
              onSelectStop={onSelectStop}
            />
          );
        })}
      </ol>

      <p className={panel.panelFootnote}>
        Времена у разных остановок могут относиться к разным рейсам. Выберите остановку для полного
        расписания.
      </p>
    </div>
  );
};

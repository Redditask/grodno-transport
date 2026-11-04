import type { TransportData } from '@/data/transportData';
import type { RouteSummary } from '@/models/route';
import { findStopSchedule } from '@/utils/findStopSchedule';
import { formatTransportLabel } from '@/utils/formatTransportLabel';

import { TransportBadge } from '../TransportBadge/TransportBadge';
import { StopListItem } from './components/StopListItem/StopListItem';

import panel from '../../styles/SearchPanel.module.scss';
import styles from './RouteStopsPanel.module.scss';

interface RouteStopsPanelProps {
  routeSummary: RouteSummary;
  transportData: TransportData;
  onSelectStop: (stopId: string) => void;
}

export const RouteStopsPanel = ({
  routeSummary,
  transportData,
  onSelectStop,
}: RouteStopsPanelProps) => {
  const { route, line, origin, destination } = routeSummary;

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

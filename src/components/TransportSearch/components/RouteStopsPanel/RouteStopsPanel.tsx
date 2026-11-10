import type { Route } from '@/domain/route';
import type { Schedule } from '@/domain/schedule';
import type { Stop } from '@/domain/stop';
import type { RouteSummary } from '@/types/route';
import { formatTransportLabel } from '@/utils/formatTransportLabel';

import { SwitchDirectionButton } from '../SwitchDirectionButton/SwitchDirectionButton';
import { TransportBadge } from '../TransportBadge/TransportBadge';
import { StopListItem } from './components/StopListItem/StopListItem';

import panel from '../../styles/SearchPanel.module.scss';
import styles from './RouteStopsPanel.module.scss';

interface RouteStopsPanelProps {
  routeSummary: RouteSummary;
  oppositeRoute: Route | undefined;
  routeStops: { stop: Stop; index: number; schedule: Schedule | undefined }[];
  onSwitchRoute: (routeId: string) => void;
  onSelectStop: (stopId: string) => void;
}

export const RouteStopsPanel = ({
  routeSummary,
  oppositeRoute,
  routeStops,
  onSwitchRoute,
  onSelectStop,
}: RouteStopsPanelProps) => {
  const { line, origin, destination } = routeSummary;

  return (
    <div className={panel.panel} data-transport={line.transportType}>
      <div className={panel.screenHeading}>
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
        {routeStops.map(({ stop, index, schedule }) => (
          <StopListItem
            key={`${index}:${stop.id}`}
            resultId={`${index}:${stop.id}`}
            stop={stop}
            schedule={schedule}
            onSelectStop={onSelectStop}
          />
        ))}
      </ol>

      <p className={panel.panelFootnote}>
        Времена у разных остановок могут относиться к разным рейсам. Выберите остановку для полного
        расписания.
      </p>
    </div>
  );
};

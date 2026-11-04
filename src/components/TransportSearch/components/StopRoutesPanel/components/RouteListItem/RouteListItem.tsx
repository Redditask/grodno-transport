import type { StopRouteItem } from '@/models/route';
import { formatTransportLabel } from '@/utils/formatTransportLabel';

import { NextDepartures } from '../../../NextDepartures/NextDepartures';
import { SearchResultButton } from '../../../SearchResultButton/SearchResultButton';
import { TransportBadge } from '../../../TransportBadge/TransportBadge';

import styles from './RouteListItem.module.scss';

interface RouteListItemProps {
  routeItem: StopRouteItem;
  onSelectRoute: (routeId: string) => void;
}

export const RouteListItem = ({ routeItem, onSelectRoute }: RouteListItemProps) => {
  const { route, line, origin, destination, schedule } = routeItem;

  return (
    <li>
      <SearchResultButton
        resultId={route.id}
        transportType={line.transportType}
        onClick={() => onSelectRoute(route.id)}
      >
        <TransportBadge line={line} />

        <span className={styles.details}>
          <span className={styles.label}>{formatTransportLabel(line)}</span>

          <span className={styles.direction}>
            {origin} → {destination}
          </span>

          <NextDepartures schedule={schedule} />
        </span>
      </SearchResultButton>
    </li>
  );
};

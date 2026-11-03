import { useCurrentTime } from '../../../../../../hooks/useCurrentTime';
import type { StopRouteItem } from '../../../../../../utils/buildStopRouteItems';
import { getUpcomingDepartures } from '../../../../../../utils/getUpcomingDepartures';
import { formatDayOffset, getDayType } from '../../../../../../utils/transportTime';
import { TransportBadge } from '../../../../../TransportBadge/TransportBadge';

import styles from './RouteListItem.module.scss';

interface RouteListItemProps {
  routeItem: StopRouteItem;
  onSelectRoute: (routeId: string) => void;
}

export const RouteListItem = ({ routeItem, onSelectRoute }: RouteListItemProps) => {
  const { route, line, origin, destination, schedule } = routeItem;

  const now = useCurrentTime();
  const times = schedule?.departures[getDayType(now)];
  const nextDepartures = schedule ? getUpcomingDepartures(schedule, now) : [];

  const handleSelectRoute = () => onSelectRoute(route.id);

  return (
    <li data-transport={line.transportType} className={styles.routeItem}>
      <button
        className={styles.routeButton}
        type="button"
        onClick={handleSelectRoute}
        aria-label={`${line.transportType === 'bus' ? 'Автобус' : 'Троллейбус'} №${line.number}, ${origin} → ${destination}. Полное расписание`}
      >
        <TransportBadge line={line} />

        <span className={styles.routeInfo}>
          <span className={styles.transportName}>
            {line.transportType === 'bus' ? 'Автобус' : 'Троллейбус'} №{line.number}
          </span>

          <span className={styles.direction}>
            {origin} → {destination}
          </span>

          <span className={styles.nextTimes}>
            {nextDepartures.length > 0 ? (
              nextDepartures.map((departure) => (
                <span className={styles.nextTime} key={`${departure.dayOffset}:${departure.time}`}>
                  {departure.time}

                  {departure.dayOffset > 0 ? (
                    <small>{formatDayOffset(departure.dayOffset)}</small>
                  ) : null}
                </span>
              ))
            ) : (
              <span className={styles.noDepartures}>
                {!schedule
                  ? 'Расписание пока не загружено'
                  : times?.length === 0
                    ? 'Сегодня рейсов нет'
                    : 'На сегодня движение завершено'}
              </span>
            )}
          </span>
        </span>

        <span className={styles.routeArrow} aria-hidden="true">
          ↗
        </span>
      </button>
    </li>
  );
};

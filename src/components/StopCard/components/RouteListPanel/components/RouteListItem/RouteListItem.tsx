import { useCurrentTime } from '../../../../../../hooks/useCurrentTime';
import type { StopRouteItem } from '../../../../../../utils/getStopRouteItems';
import { formatDayOffset, getDayType } from '../../../../../../utils/transportTime';
import { upcomingDepartures } from '../../../../../../utils/upcomingDepartures';
import { TransportBadge } from '../../../../../TransportBadge/TransportBadge';

import styles from './RouteListItem.module.scss';

interface Props {
  item: StopRouteItem;
  onSelect: (routeId: string) => void;
}

export const RouteListItem = ({ item, onSelect }: Props) => {
  const { route, line, origin, destination, schedule } = item;

  const now = useCurrentTime();
  const times = schedule?.departures[getDayType(now)];
  const upcoming = schedule ? upcomingDepartures(schedule, now) : [];

  const handleSelect = () => onSelect(route.id);

  return (
    <li data-transport={line.transportType} className={styles.routeItem}>
      <button
        className={styles.routeButton}
        type="button"
        onClick={handleSelect}
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
            {upcoming.length > 0 ? (
              upcoming.map((departure) => (
                <span className={styles.nextTime} key={`${departure.dayOffset}:${departure.time}`}>
                  {departure.time}
                  {departure.annotation ? <sup>{departure.annotation}</sup> : null}

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

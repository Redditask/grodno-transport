import type { Schedule } from '@/domain/schedule';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { getUpcomingDepartures } from '@/utils/getUpcomingDepartures';
import { formatDayOffset } from '@/utils/transportTime';

import styles from './NextDepartures.module.scss';

interface NextDeparturesProps {
  schedule: Schedule | undefined;
  limit?: number;
}

export const NextDepartures = ({ schedule, limit = 4 }: NextDeparturesProps) => {
  const now = useCurrentTime();
  const departures = schedule ? getUpcomingDepartures(schedule, now).slice(0, limit) : [];

  if (!schedule) return <span className={styles.empty}>Расписание неизвестно</span>;
  if (!departures.length) return <span className={styles.empty}>Нет отправлений</span>;

  return (
    <span className={styles.times}>
      {departures.map((departure) => (
        <span className={styles.time} key={`${departure.dayOffset}:${departure.time}`}>
          <time dateTime={departure.time}>{departure.time}</time>

          {departure.dayOffset > 0 ? <small>{formatDayOffset(departure.dayOffset)}</small> : null}
        </span>
      ))}
    </span>
  );
};

import { useCurrentTime } from '@/hooks/useCurrentTime';
import { formatTransportDate, formatTransportTime } from '@/utils/transportTime';

import styles from './AppHeader.module.scss';

export const AppHeader = () => {
  const now = useCurrentTime();
  const localTime = formatTransportTime(now);
  const localDate = formatTransportDate(now);

  return (
    <header className={styles.header}>
      <h1>Транспорт Гродно</h1>

      <div className={styles.dateTime}>
        <time className={styles.liveTime} dateTime={localTime}>
          <span aria-hidden="true" />
          {localTime}
        </time>

        <span className={styles.localDate}>{localDate}</span>
      </div>
    </header>
  );
};

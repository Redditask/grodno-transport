import { useCurrentTime } from '@/hooks/useCurrentTime';
import { formatTransportTime } from '@/utils/transportTime';

import styles from './AppHeader.module.scss';

export const AppHeader = () => {
  const localTime = formatTransportTime(useCurrentTime());

  return (
    <header className={styles.header}>
      <div className={styles.eyebrow}>
        <span className={styles.city}>Гродно</span>
        <span className={styles.liveTime}>
          <span aria-hidden="true" />
          {localTime}
        </span>
      </div>

      <h1>Транспорт Гродно</h1>

      <p className={styles.description}>Найдите остановку или маршрут — посмотрите расписание.</p>
    </header>
  );
};

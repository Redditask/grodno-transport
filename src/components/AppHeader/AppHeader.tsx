import { useCurrentTime } from '@/hooks/useCurrentTime';
import { formatTransportTime } from '@/utils/transportTime';

import styles from './AppHeader.module.scss';

export const AppHeader = () => {
  const localTime = formatTransportTime(useCurrentTime());

  return (
    <header className={styles.header}>
      <h1>Транспорт Гродно</h1>

      <span className={styles.liveTime}>
        <span aria-hidden="true" />
        {localTime}
      </span>
    </header>
  );
};

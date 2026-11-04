import type { Schedule } from '@/domain/schedule';
import type { Stop } from '@/domain/stop';

import { NextDepartures } from '../../../NextDepartures/NextDepartures';

import styles from './StopListItem.module.scss';

interface StopListItemProps {
  stop: Stop;
  schedule: Schedule | undefined;
  resultId: string;
  onSelectStop: (stopId: string) => void;
}

export const StopListItem = ({ stop, schedule, resultId, onSelectStop }: StopListItemProps) => (
  <li className={styles.stop}>
    <button
      type="button"
      className={styles.stopButton}
      data-result-id={resultId}
      onClick={() => onSelectStop(stop.id)}
    >
      <span className={styles.name}>{stop.name}</span>

      <NextDepartures schedule={schedule} limit={1} />

      <span className={styles.arrow} aria-hidden="true">
        ›
      </span>
    </button>
  </li>
);

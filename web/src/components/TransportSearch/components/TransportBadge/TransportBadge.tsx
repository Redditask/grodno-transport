import type { Line } from '@/domain/line';

import panel from '../../styles/SearchPanel.module.scss';
import styles from './TransportBadge.module.scss';

interface TransportBadgeProps {
  line: Line;
}

export const TransportBadge = ({ line }: TransportBadgeProps) => (
  <span className={`${panel.badge} ${styles.badge}`} aria-hidden="true">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      {line.transportType === 'trolleybus' ? (
        <path d="m9 5-3-4m9 4 3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <path d="M3 10v4m18-4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}

      <rect x="5" y="5" width="14" height="15" rx="3" stroke="currentColor" strokeWidth="1.5" />

      <path
        d="M5 12h14M8 20v2m8-2v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <circle cx="8.5" cy="16" r="1" fill="currentColor" />
      <circle cx="15.5" cy="16" r="1" fill="currentColor" />
    </svg>

    <span>{line.number}</span>
  </span>
);

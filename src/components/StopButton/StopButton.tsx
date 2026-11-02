import type { Stop } from '../../domain/stop';

import styles from './StopButton.module.scss';

export interface StopButtonProps {
  stop: Stop;
  onClick?: () => void;
  expanded?: boolean;
  panelId?: string;
}

export const StopButton = ({ stop, onClick, expanded, panelId }: StopButtonProps) => {
  return (
    <button
      className={styles.button}
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-controls={panelId}
    >
      <span className={styles.icon} aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      </span>

      <span className={styles.content}>
        <span className={styles.label}>Остановка</span>
        <span className={styles.name}>{stop.name}</span>
      </span>

      <svg
        className={styles.arrow}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </button>
  );
};

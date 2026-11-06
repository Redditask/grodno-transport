import panel from '../../styles/SearchPanel.module.scss';
import styles from './StopBadge.module.scss';

export const StopBadge = () => (
  <span className={`${panel.badge} ${styles.badge}`} aria-hidden="true">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
    </svg>
  </span>
);

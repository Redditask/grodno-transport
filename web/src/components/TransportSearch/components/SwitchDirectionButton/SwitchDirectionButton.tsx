import type { TransportType } from '@/domain/line';

import styles from './SwitchDirectionButton.module.scss';

interface SwitchDirectionButtonProps {
  transportType?: TransportType;
  onClick: () => void;
}

export const SwitchDirectionButton = ({ transportType, onClick }: SwitchDirectionButtonProps) => (
  <button className={styles.button} type="button" data-transport={transportType} onClick={onClick}>
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8h16m-4-4 4 4-4 4M20 16H4m4-4-4 4 4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    Сменить направление
  </button>
);

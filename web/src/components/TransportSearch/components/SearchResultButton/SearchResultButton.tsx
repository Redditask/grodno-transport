import type { ReactNode } from 'react';

import type { TransportType } from '@/domain/line';

import styles from './SearchResultButton.module.scss';

interface SearchResultButtonProps {
  children: ReactNode;
  onClick: () => void;
  resultId?: string;
  transportType?: TransportType;
  label?: string;
}

export const SearchResultButton = ({
  children,
  onClick,
  resultId,
  transportType,
  label,
}: SearchResultButtonProps) => (
  <button
    className={styles.button}
    type="button"
    onClick={onClick}
    data-result-id={resultId}
    data-transport={transportType}
    aria-label={label}
  >
    {children}

    <span className={styles.chevron} aria-hidden="true">
      ›
    </span>
  </button>
);

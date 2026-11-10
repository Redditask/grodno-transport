import type { RefObject } from 'react';
import { useRef } from 'react';

import { useCityMap } from '@/hooks/useCityMap';
import { useMapSelectionView } from '@/hooks/useMapSelectionView';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './CityMap.module.scss';

interface CityMapProps {
  selectedStopId?: string;
  selectedRouteId?: string;
  overlayRef: RefObject<HTMLDivElement | null>;
  onSelectStop: (stopId: string) => void;
  onClearStop: () => void;
}

export const CityMap = ({
  selectedStopId,
  selectedRouteId,
  overlayRef,
  onSelectStop,
  onClearStop,
}: CityMapProps) => {
  const { containerRef, mapRef, status } = useCityMap(onSelectStop);
  const clearButtonRef = useRef<HTMLButtonElement>(null);

  useMapSelectionView({
    mapRef,
    containerRef,
    overlayRef,
    clearButtonRef,
    selectedStopId,
    selectedRouteId,
    isMapReady: status === 'ready',
  });

  return (
    <section className={styles.viewport} aria-label="Карта Гродно">
      <div className={styles.map} ref={containerRef} />

      {selectedStopId ? (
        <button
          ref={clearButtonRef}
          className={styles.clearStop}
          type="button"
          onClick={onClearStop}
        >
          Отменить выбор
        </button>
      ) : null}

      {status !== 'ready' ? (
        <div className={styles.status}>
          <p role="status">
            {status === 'loading' ? 'Загружаем карту Гродно…' : 'Не удалось загрузить карту.'}
          </p>
        </div>
      ) : null}
    </section>
  );
};

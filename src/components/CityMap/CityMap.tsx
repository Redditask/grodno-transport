import { useEffect } from 'react';

import { useCityMap } from '@/hooks/useCityMap';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './CityMap.module.scss';

import { selectStopOnMap } from './layers/stopLayers';

interface CityMapProps {
  selectedStopId?: string;
  onSelectStop: (stopId: string) => void;
}

export const CityMap = ({
  selectedStopId,
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
    isMapReady: status === 'ready',
  });

  return (
    <section className={styles.viewport} aria-label="Карта Гродно">
      <div className={styles.map} ref={containerRef} />

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

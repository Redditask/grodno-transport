import { useCityMap } from '@/hooks/useCityMap';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './CityMap.module.scss';

export const CityMap = () => {
  const { containerRef, status } = useCityMap();

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

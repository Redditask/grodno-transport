import type { ChangeEvent } from 'react';
import { useState } from 'react';

import { transportData } from '../../data/transportData';
import { StopCard } from '../StopCard/StopCard';

import styles from './StopsList.module.scss';

export const StopsList = () => {
  const [query, setQuery] = useState('');

  const searchText = query.trim().toLocaleLowerCase('ru');
  const visibleStops = transportData.stops.filter((stop) =>
    stop.name.toLocaleLowerCase('ru').includes(searchText),
  );

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <section aria-labelledby="stops-heading">
      <div className={styles.sectionHeading}>
        <h2 id="stops-heading">Остановки</h2>

        <span aria-live="polite">
          {visibleStops.length} / {transportData.stops.length}
        </span>
      </div>

      <input
        className={styles.search}
        type="search"
        aria-label="Поиск остановки"
        placeholder="Найти остановку"
        value={query}
        onChange={handleSearchChange}
      />

      <div className={styles.stops}>
        {visibleStops.map((stop) => (
          <StopCard key={stop.id} stop={stop} data={transportData} />
        ))}
      </div>

      {visibleStops.length === 0 ? (
        <p className={styles.empty} role="status">
          Остановки не найдены. Попробуйте другое название.
        </p>
      ) : null}
    </section>
  );
};

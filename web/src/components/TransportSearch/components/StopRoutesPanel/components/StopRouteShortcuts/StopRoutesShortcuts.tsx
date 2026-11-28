import type { TransportType } from '@/domain/line';
import type { StopRouteItem } from '@/types/route';
import { formatTransportLabel } from '@/utils/formatTransportLabel';

import styles from './StopRoutesShortcuts.module.scss';

const transportGroups: { type: TransportType; label: string }[] = [
  { type: 'bus', label: 'Автобусы' },
  { type: 'trolleybus', label: 'Троллейбусы' },
];

interface StopRoutesShortcutsProps {
  routeItems: StopRouteItem[];
  onSelectRoute: (routeId: string) => void;
}

export const StopRoutesShortcuts = ({ routeItems, onSelectRoute }: StopRoutesShortcutsProps) => {
  const groups = transportGroups
    .map(({ type, label }) => {
      const routes = routeItems
        .filter(({ line }) => line.transportType === type)
        .sort((a, b) => a.line.number.localeCompare(b.line.number, 'ru', { numeric: true }));

      const routeCounts = new Map<string, number>();
      const directionIndexes = new Map<string, number>();

      for (const { line } of routes) {
        routeCounts.set(line.number, (routeCounts.get(line.number) ?? 0) + 1);
      }

      const shortcuts = routes.map(({ route, line, origin, destination }) => {
        const number = line.number;
        const directionIndex = (directionIndexes.get(number) ?? 0) + 1;
        directionIndexes.set(number, directionIndex);

        return {
          routeId: route.id,
          number,
          directionIndex: routeCounts.get(number) === 1 ? undefined : directionIndex,
          destination,
          label: `Расписание. ${formatTransportLabel(line)}. ${origin} → ${destination}`,
        };
      });

      const directions = shortcuts.filter(({ directionIndex }) => directionIndex !== undefined);

      return { type, label, shortcuts, directions };
    })
    .filter(({ shortcuts }) => shortcuts.length > 0);

  return (
    <div className={styles.shortcuts}>
      {groups.map(({ type, label, shortcuts, directions }) => (
        <div key={type} className={styles.group} data-transport={type}>
          <h3 className={styles.heading}>{label}</h3>

          <ul className={styles.routes} aria-label={label}>
            {shortcuts.map(({ routeId, number, directionIndex, label: shortcutLabel }) => (
              <li key={routeId}>
                <button
                  className={styles.shortcut}
                  type="button"
                  aria-label={shortcutLabel}
                  data-result-id={`shortcut-${routeId}`}
                  onClick={() => onSelectRoute(routeId)}
                >
                  {number}
                  {directionIndex && <sup>{directionIndex}</sup>}
                </button>
              </li>
            ))}
          </ul>

          {directions.length > 0 && (
            <details className={styles.directionDetails}>
              <summary className={styles.directionSummary}>Направления</summary>

              <ul className={styles.directions} aria-label="Направления">
                {directions.map(({ routeId, number, directionIndex, destination }) => (
                  <li key={routeId}>
                    <span className={styles.directionNumber}>
                      {number}
                      <sup>{directionIndex}</sup>
                    </span>
                    {' → '}
                    {destination}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      ))}
    </div>
  );
};

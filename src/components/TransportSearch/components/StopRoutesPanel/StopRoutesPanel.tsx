import type { Stop } from '@/domain/stop';
import type { StopRouteItem } from '@/types/route';

import { StopBadge } from '../StopBadge/StopBadge';
import { SwitchDirectionButton } from '../SwitchDirectionButton/SwitchDirectionButton';
import { RouteListItem } from './components/RouteListItem/RouteListItem';

import panel from '../../styles/SearchPanel.module.scss';
import styles from './StopRoutesPanel.module.scss';

interface StopRoutesPanelProps {
  stop: Stop;
  oppositeStop: Stop | undefined;
  routeItems: StopRouteItem[];
  onSelectRoute: (routeId: string) => void;
  onSwitchStop: (stopId: string) => void;
}

export const StopRoutesPanel = ({
  stop,
  oppositeStop,
  routeItems,
  onSelectRoute,
  onSwitchStop,
}: StopRoutesPanelProps) => {
  return (
    <div className={panel.panel}>
      <div className={panel.screenHeading}>
        <StopBadge />

        <div>
          <p className={styles.label}>Остановка</p>

          <h2 className={panel.heading} tabIndex={-1} data-screen-heading>
            {stop.name}
          </h2>

          {stop.directionHint ? (
            <span className={panel.directionHint}>{stop.directionHint}</span>
          ) : null}
        </div>
      </div>

      {oppositeStop ? (
        <SwitchDirectionButton onClick={() => onSwitchStop(oppositeStop.id)} />
      ) : null}

      <p className={panel.caption}>Ближайший транспорт по расписанию</p>

      {routeItems.length ? (
        <ul className={styles.routes}>
          {routeItems.map((routeItem) => (
            <RouteListItem
              key={routeItem.route.id}
              routeItem={routeItem}
              onSelectRoute={onSelectRoute}
            />
          ))}
        </ul>
      ) : (
        <p className={panel.empty}>Для этой остановки пока нет маршрутов.</p>
      )}

      <p className={panel.panelFootnote}>Выберите маршрут, чтобы посмотреть все отправления.</p>
    </div>
  );
};

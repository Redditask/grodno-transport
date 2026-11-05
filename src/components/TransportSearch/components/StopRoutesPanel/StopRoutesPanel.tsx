import type { Stop } from '@/domain/stop';
import type { StopRouteItem } from '@/types/route';

import { RouteListItem } from './components/RouteListItem/RouteListItem';

import panel from '../../styles/SearchPanel.module.scss';
import styles from './StopRoutesPanel.module.scss';

interface StopRoutesPanelProps {
  stop: Stop;
  routeItems: StopRouteItem[];
  onSelectRoute: (routeId: string) => void;
}

export const StopRoutesPanel = ({ stop, routeItems, onSelectRoute }: StopRoutesPanelProps) => (
  <div className={panel.panel}>
    <h2 className={panel.heading} tabIndex={-1} data-screen-heading>
      {stop.name}
    </h2>

    <p className={panel.caption}>Остановка · Ближайший транспорт по расписанию</p>

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

import type { StopRouteItem } from '../../../../utils/buildStopRouteItems';
import { RouteListItem } from './components/RouteListItem/RouteListItem';

import panel from '../../styles/StopPanel.module.scss';
import styles from './StopRoutesPanel.module.scss';

interface StopRoutesPanelProps {
  routeItems: StopRouteItem[];
  onSelectRoute: (routeId: string) => void;
}

export const StopRoutesPanel = ({ routeItems, onSelectRoute }: StopRoutesPanelProps) => (
  <div className={panel.panel}>
    <div className={panel.panelHeading}>
      <h2 tabIndex={-1} data-panel-focus>
        Ближайший транспорт
      </h2>
      <span className={panel.caption}>По расписанию</span>
    </div>

    {routeItems.length === 0 ? (
      <p className={panel.empty}>Для этой остановки пока нет маршрутов.</p>
    ) : (
      <ul className={styles.routes}>
        {routeItems.map((routeItem) => (
          <RouteListItem
            key={routeItem.route.id}
            routeItem={routeItem}
            onSelectRoute={onSelectRoute}
          />
        ))}
      </ul>
    )}

    <p className={panel.panelFootnote}>Выберите маршрут, чтобы посмотреть все отправления.</p>
  </div>
);

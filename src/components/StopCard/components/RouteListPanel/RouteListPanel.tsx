import type { StopRouteItem } from '../../../../utils/getStopRouteItems';
import { RouteListItem } from './components/RouteListItem/RouteListItem';

import panel from '../../styles/StopPanel.module.scss';
import styles from './RouteListPanel.module.scss';

interface Props {
  items: StopRouteItem[];
  onSelect: (routeId: string) => void;
}

export const RouteListPanel = ({ items, onSelect }: Props) => (
  <div className={panel.panel}>
    <div className={panel.panelHeading}>
      <h2 tabIndex={-1} data-panel-focus>
        Ближайший транспорт
      </h2>
      <span className={panel.caption}>По расписанию</span>
    </div>
    '
    {items.length === 0 ? (
      <p className={panel.empty}>Для этой остановки пока нет маршрутов.</p>
    ) : (
      <ul className={styles.routes}>
        {items.map((item) => (
          <RouteListItem key={item.route.id} item={item} onSelect={onSelect} />
        ))}
      </ul>
    )}
    <p className={panel.panelFootnote}>Выберите маршрут, чтобы посмотреть все отправления.</p>
  </div>
);

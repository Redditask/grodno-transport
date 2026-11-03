import type { StopRouteItem } from '../../../../utils/buildStopRouteItems';
import { groupDeparturesByHour } from '../../../../utils/groupDeparturesByHour';
import type { DayType } from '../../../../utils/transportTime';
import { TransportBadge } from '../../../TransportBadge/TransportBadge';

import panel from '../../styles/StopPanel.module.scss';
import styles from './RouteSchedulePanel.module.scss';

interface RouteSchedulePanelProps {
  routeItem: StopRouteItem;
  selectedDayType: DayType;
  todayDayType: DayType;
  onDayChange: (day: DayType) => void;
  onBack: () => void;
}

export const RouteSchedulePanel = ({
  routeItem,
  selectedDayType,
  todayDayType,
  onDayChange,
  onBack,
}: RouteSchedulePanelProps) => {
  const departures = routeItem.schedule?.departures[selectedDayType];
  const groupedDepartures = groupDeparturesByHour(departures ?? []);

  const handleWeekday = () => onDayChange('weekday');
  const handleWeekend = () => onDayChange('weekend');

  return (
    <div className={panel.panel} data-transport={routeItem.line.transportType}>
      <button className={styles.backButton} type="button" data-panel-focus onClick={onBack}>
        <span aria-hidden="true">←</span> К маршрутам
      </button>

      <div className={styles.scheduleHeading}>
        <TransportBadge line={routeItem.line} />

        <div>
          <span className={styles.transportName}>
            {routeItem.line.transportType === 'bus' ? 'Автобус' : 'Троллейбус'} №
            {routeItem.line.number}
          </span>

          <h2 className={styles.direction}>
            {routeItem.origin} → {routeItem.destination}
          </h2>
        </div>
      </div>

      <div className={styles.daySwitch} role="group" aria-label="Дни движения">
        <button type="button" aria-pressed={selectedDayType === 'weekday'} onClick={handleWeekday}>
          Будни
        </button>

        <button type="button" aria-pressed={selectedDayType === 'weekend'} onClick={handleWeekend}>
          Выходные
        </button>
      </div>

      <div className={panel.panelHeading}>
        <h3>Все отправления</h3>

        <span className={panel.caption}>
          {selectedDayType === todayDayType
            ? 'Сегодня'
            : selectedDayType === 'weekday'
              ? 'Будний день'
              : 'Выходной день'}
        </span>
      </div>

      {departures === undefined ? (
        <p className={panel.empty}>Расписание пока не загружено.</p>
      ) : departures.length === 0 ? (
        <p className={panel.empty}>В выбранный день рейсов нет.</p>
      ) : (
        <dl className={styles.timetable}>
          {groupedDepartures.map(({ hour, dayOffset, departures: hourDepartures }) => (
            <div className={styles.hourRow} key={`${dayOffset}:${hour}`}>
              <dt>
                {hour}
                <span>{dayOffset > 0 ? `+${dayOffset} дн.` : 'ч'}</span>
              </dt>

              <dd>
                {hourDepartures.map((departure) => (
                  <time
                    dateTime={departure.time}
                    key={departure.serviceMinutes}
                    aria-label={`${departure.time}${dayOffset > 0 ? ', на следующий день' : ''}`}
                  >
                    {departure.time.split(':')[1]}
                  </time>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <p className={panel.panelFootnote}>Плановое время отправления с этой остановки.</p>
    </div>
  );
};

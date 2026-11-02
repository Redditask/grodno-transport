import type { StopRouteItem } from '../../../../utils/getStopRouteItems';
import { groupDeparturesByHour } from '../../../../utils/groupDeparturesByHour';
import type { DayType } from '../../../../utils/transportTime';
import { TransportBadge } from '../../../TransportBadge/TransportBadge';

import panel from '../../styles/StopPanel.module.scss';
import styles from './SchedulePanel.module.scss';

interface Props {
  item: StopRouteItem;
  scheduleDay: DayType;
  todayType: DayType;
  onDayChange: (day: DayType) => void;
  onBack: () => void;
}

export const SchedulePanel = ({ item, scheduleDay, todayType, onDayChange, onBack }: Props) => {
  const departures = item.schedule?.departures[scheduleDay];
  const groupedDepartures = groupDeparturesByHour(departures ?? []);

  const handleWeekday = () => onDayChange('weekday');
  const handleWeekend = () => onDayChange('weekend');

  return (
    <div className={panel.panel} data-transport={item.line.transportType}>
      <button className={styles.backButton} type="button" data-panel-focus onClick={onBack}>
        <span aria-hidden="true">←</span> К маршрутам
      </button>

      <div className={styles.scheduleHeading}>
        <TransportBadge line={item.line} />

        <div>
          <span className={styles.transportName}>
            {item.line.transportType === 'bus' ? 'Автобус' : 'Троллейбус'} №{item.line.number}
          </span>

          <h2 className={styles.direction}>
            {item.origin} → {item.destination}
          </h2>
        </div>
      </div>

      <div className={styles.daySwitch} role="group" aria-label="Дни движения">
        <button type="button" aria-pressed={scheduleDay === 'weekday'} onClick={handleWeekday}>
          Будни
        </button>

        <button type="button" aria-pressed={scheduleDay === 'weekend'} onClick={handleWeekend}>
          Выходные
        </button>
      </div>

      <div className={panel.panelHeading}>
        <h3>Все отправления</h3>

        <span className={panel.caption}>
          {scheduleDay === todayType
            ? 'Сегодня'
            : scheduleDay === 'weekday'
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
                    key={`${departure.serviceMinutes}:${departure.annotation ?? ''}`}
                    aria-label={`${departure.time}${dayOffset > 0 ? ', на следующий день' : ''}`}
                  >
                    {departure.time.split(':')[1]}
                    {departure.annotation ? <sup>{departure.annotation}</sup> : null}
                  </time>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {item.schedule && item.schedule.notes.length > 0 ? (
        <ul className={styles.notes}>
          {item.schedule.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}

      <p className={panel.panelFootnote}>Плановое время отправления с этой остановки.</p>
    </div>
  );
};

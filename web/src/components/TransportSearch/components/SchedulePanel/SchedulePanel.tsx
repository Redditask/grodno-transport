import { useState } from 'react';

import type { Stop } from '@/domain/stop';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import type { StopRouteItem } from '@/types/route';
import { formatTransportLabel } from '@/utils/formatTransportLabel';
import { groupDeparturesByHour } from '@/utils/groupDeparturesByHour';
import type { DayType } from '@/utils/transportTime';
import { getDayType } from '@/utils/transportTime';

import { TransportBadge } from '../TransportBadge/TransportBadge';

import panel from '../../styles/SearchPanel.module.scss';
import styles from './SchedulePanel.module.scss';

interface SchedulePanelProps {
  stop: Stop;
  routeItem: StopRouteItem;
}

export const SchedulePanel = ({ stop, routeItem }: SchedulePanelProps) => {
  const now = useCurrentTime();
  const todayDayType = getDayType(now);
  const [selectedDayType, setSelectedDayType] = useState<DayType>(todayDayType);

  const departures = routeItem.schedule?.departures[selectedDayType];
  const groupedDepartures = groupDeparturesByHour(departures ?? []);

  const handleWeekday = () => setSelectedDayType('weekday');
  const handleWeekend = () => setSelectedDayType('weekend');

  return (
    <div className={panel.panel} data-transport={routeItem.line.transportType}>
      <h2 className={panel.heading} tabIndex={-1} data-screen-heading>
        {stop.name}
      </h2>

      <p className={panel.caption}>Расписание на остановке</p>

      <div className={styles.scheduleHeading}>
        <TransportBadge line={routeItem.line} />

        <div>
          <span className={styles.transportName}>{formatTransportLabel(routeItem.line)}</span>

          <h3 className={styles.direction}>
            {routeItem.origin} → {routeItem.destination}
          </h3>
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

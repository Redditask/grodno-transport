import { useState } from 'react';

import type { TransportData } from '@/data/transportData';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { buildRouteSummary } from '@/utils/buildRouteSummary';
import { findStopSchedule } from '@/utils/findStopSchedule';
import { groupDeparturesByHour } from '@/utils/groupDeparturesByHour';
import type { DayType } from '@/utils/transportTime';
import { getDayType } from '@/utils/transportTime';

import { TransportBadge } from '../TransportBadge/TransportBadge';

import panel from '../../styles/SearchPanel.module.scss';
import styles from './SchedulePanel.module.scss';

interface SchedulePanelProps {
  routeId: string;
  stopId: string;
  transportData: TransportData;
}

export const SchedulePanel = ({ routeId, stopId, transportData }: SchedulePanelProps) => {
  const now = useCurrentTime();
  const todayDayType = getDayType(now);
  const [selectedDayType, setSelectedDayType] = useState<DayType>(todayDayType);

  const stop = transportData.stops.find((stop) => stop.id === stopId);
  const route = transportData.routes.find((route) => route.id === routeId);
  const routeSummary = route ? buildRouteSummary(route, transportData) : undefined;

  if (!stop || !routeSummary) return <p role="alert">Остановка или маршрут не найдены.</p>;

  const routeItem = {
    ...routeSummary,
    schedule: findStopSchedule(transportData.schedules, routeId, stopId),
  };
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
          <span className={styles.transportName}>
            {routeItem.line.transportType === 'bus' ? 'Автобус' : 'Троллейбус'} №
            {routeItem.line.number}
          </span>

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

const assert = require('node:assert/strict');
const { test } = require('node:test');

const upcomingModule = import('@/utils/getUpcomingDepartures');
const groupingModule = import('@/utils/groupDeparturesByHour');

const makeSchedule = (weekday, weekend = []) => ({
  routeId: 'route',
  stopId: 'stop',
  departures: { weekday, weekend },
});

test('Friday night departures appear on Saturday and then expire', async () => {
  const { getUpcomingDepartures } = await upcomingModule;

  // Рейс 00:10 относится к пятничному расписанию, хотя на часах уже суббота.
  const schedule = makeSchedule([{ time: '00:10', serviceMinutes: 1450 }]);
  const before = JSON.stringify(schedule);

  assert.equal(
    getUpcomingDepartures(schedule, new Date('2026-11-06T23:00:00+03:00'))[0].dayOffset,
    1,
  );
  assert.equal(
    getUpcomingDepartures(schedule, new Date('2026-11-07T00:05:00+03:00'))[0].dayOffset,
    0,
  );
  assert.ok(
    getUpcomingDepartures(schedule, new Date('2026-11-07T00:11:00+03:00')).every(
      (item) => item.dayOffset > 0,
    ),
  );
  assert.equal(JSON.stringify(schedule), before);
});

test('upcoming departures include the current minute, use the next day calendar and remove duplicate moments', async () => {
  const { getUpcomingDepartures } = await upcomingModule;

  // Два одинаковых рейса в текущую минуту и один рейс по расписанию субботы.
  const schedule = makeSchedule(
    [
      { time: '23:00', serviceMinutes: 1380 },
      { time: '23:00', serviceMinutes: 1380 },
    ],
    [{ time: '00:10', serviceMinutes: 10 }],
  );

  const result = getUpcomingDepartures(schedule, new Date('2026-11-06T23:00:00+03:00'));

  // Ожидаем не больше четырёх ближайших отправлений, без повтора 23:00.
  assert.equal(result.length, 4);
  assert.deepEqual(
    result.slice(0, 2).map((item) => [item.time, item.dayOffset]),
    [
      ['23:00', 0],
      ['00:10', 1],
    ],
  );

  assert.deepEqual(getUpcomingDepartures(makeSchedule([]), new Date()), []);
});

test('hour grouping sorts without mutation and separates midnight of different service days', async () => {
  const { groupDeparturesByHour } = await groupingModule;

  // Перемешиваем минуты и добавляем два одинаковых времени в разные сутки.
  const departures = [
    { time: '00:10', serviceMinutes: 1450 },
    { time: '08:17', serviceMinutes: 497 },
    { time: '00:10', serviceMinutes: 10 },
    { time: '08:05', serviceMinutes: 485 },
  ];
  const before = JSON.stringify(departures);

  const result = groupDeparturesByHour(departures);

  assert.deepEqual(
    result.map((item) => [item.hour, item.dayOffset]),
    [
      ['00', 0],
      ['08', 0],
      ['00', 1],
    ],
  );
  assert.deepEqual(
    result[1].departures.map((item) => item.time),
    ['08:05', '08:17'],
  );

  assert.equal(JSON.stringify(departures), before);
});

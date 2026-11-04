const assert = require('node:assert/strict');
const { test } = require('node:test');

const modules = Promise.all([
  import('../src/utils/searchTransport.ts'),
  import('../src/utils/buildStopRouteItems.ts'),
  import('@/utils/getUpcomingDepartures'),
  import('../src/utils/groupDeparturesByHour.ts'),
]);

const lines = [
  { id: 'bus-2', number: '2', transportType: 'bus' },
  { id: 'trolley-2', number: '2', transportType: 'trolleybus' },
  { id: 'bus-20', number: '20', transportType: 'bus' },
  { id: 'bus-12', number: '12', transportType: 'bus' },
];
const stops = ['Центр', 'Рынок', 'Центральная улица', 'Школа №2', 'Улица Ёлочная'].map(
  (name, index) => ({
    id: `stop-${index}`,
    name,
    coordinates: { latitude: 0, longitude: 0 },
  }),
);
const routes = [
  { id: 'bus-20-out', lineId: 'bus-20', stopIds: ['stop-0', 'stop-1'] },
  { id: 'bus-2-out', lineId: 'bus-2', stopIds: ['stop-0', 'stop-1'] },
  { id: 'bus-2-back', lineId: 'bus-2', stopIds: ['stop-1', 'stop-0'] },
  { id: 'bus-2-branch', lineId: 'bus-2', stopIds: ['stop-0', 'stop-2'] },
  { id: 'trolley-2-out', lineId: 'trolley-2', stopIds: ['stop-0', 'stop-1'] },
  { id: 'bus-12-out', lineId: 'bus-12', stopIds: ['stop-0', 'stop-1'] },
];

const data = { lines, routes, stops, schedules: [] };

test('empty and whitespace-only queries have no results', async () => {
  const [{ searchTransport }] = await modules;

  for (const query of ['', '   '])
    assert.deepEqual(searchTransport(query, data), { routes: [], stops: [] });
});

test('number search ranks exact matches first, keeps all directions and excludes substring matches', async () => {
  const [{ searchTransport }] = await modules;

  const result = searchTransport('2', data);

  assert.deepEqual(
    result.routes.map((item) => item.line.number),
    ['2', '2', '2', '2', '20'],
  );
  assert.equal(result.routes.filter((item) => item.line.id === 'bus-2').length, 3);
  assert.equal(result.stops[0].name, 'Школа №2');
});

test('transport qualifiers restrict the type and support the number sign', async () => {
  const [{ searchTransport }] = await modules;

  const buses = searchTransport('  Автобус №2 ', data);

  assert.ok(buses.routes.length > 0);
  assert.ok(buses.routes.every((item) => item.line.transportType === 'bus'));
  assert.deepEqual(buses.stops, []);

  assert.equal(searchTransport('троллейбус 2', data).routes.length, 1);
  assert.equal(searchTransport('автобус', data).routes.length, 5);
});

test('stop search ignores case and ё, prioritizes prefixes and preserves distinct stop identities', async () => {
  const [{ searchTransport }] = await modules;

  const fixture = {
    ...data,
    stops: [
      ...stops,
      { ...stops[0], id: 'duplicate-name' },
      { ...stops[0], id: 'inside-name', name: 'Улица Центр' },
    ],
  };

  const result = searchTransport(' ЦЕНТР ', fixture);

  assert.equal(result.stops.length, 4);
  assert.equal(result.stops.at(-1).id, 'inside-name');
  assert.equal(searchTransport('елочная', fixture).stops[0].id, 'stop-4');
});

test('unmatched queries return no results and search never changes its inputs', async () => {
  const [{ searchTransport }] = await modules;

  const before = JSON.stringify(data);

  const result = searchTransport('несуществующая', data);

  assert.equal(result.stops.length + result.routes.length, 0);

  searchTransport('2', data);
  assert.equal(JSON.stringify(data), before);
});

test('stop route items keep routes with unknown schedules and resolve both endpoints', async () => {
  const [, { buildStopRouteItems }] = await modules;

  const result = buildStopRouteItems(stops[0], data);

  const outbound = result.find((item) => item.route.id === 'bus-2-out');
  const inbound = result.find((item) => item.route.id === 'bus-2-back');

  assert.equal(outbound.origin, 'Центр');
  assert.equal(outbound.destination, 'Рынок');
  assert.equal(inbound.origin, 'Рынок');
  assert.equal(outbound.schedule, undefined);
});

const makeSchedule = (weekday, weekend = []) => ({
  routeId: 'route',
  stopId: 'stop',
  departures: { weekday, weekend },
});

test('Friday night departures appear on Saturday and then expire', async () => {
  const [, , { getUpcomingDepartures }] = await modules;

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
  const [, , { getUpcomingDepartures }] = await modules;

  const schedule = makeSchedule(
    [
      { time: '23:00', serviceMinutes: 1380 },
      { time: '23:00', serviceMinutes: 1380 },
    ],
    [{ time: '00:10', serviceMinutes: 10 }],
  );

  const result = getUpcomingDepartures(schedule, new Date('2026-11-06T23:00:00+03:00'));

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
  const [, , , { groupDeparturesByHour }] = await modules;

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

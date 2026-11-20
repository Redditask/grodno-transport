const assert = require('node:assert/strict');
const { test } = require('node:test');

const modules = import('@/components/CityMap/vehicles/vehiclePositions');

test('map shows every active trip and filters by direction or physical stop', async () => {
  const { createVehiclePositions } = await modules;
  const getPositions = createVehiclePositions();

  const now = new Date('2026-11-11T06:58:00+03:00');

  // Пять рейсов одного направления идут одновременно, у каждого своя метка.
  const buses = getPositions(now, 'bus-17-direction-0');

  assert.equal(buses.length, 5);
  assert.equal(new Set(buses.map(({ id }) => id)).size, 5);
  assert.ok(getPositions(now).some(({ transportType }) => transportType === 'trolleybus'));

  // Фильтр использует ID площадки и не смешивает встречные остановки.
  const routes = require('../../src/data/routes.json');
  const outbound = routes.find(({ id }) => id === 'bus-17-direction-0');
  const stopId = outbound.stopIds[0];
  const routeIdsAtStop = new Set(
    routes.filter(({ stopIds }) => stopIds.includes(stopId)).map(({ id }) => id),
  );
  const allPositions = getPositions(now);
  const positionsAtStop = getPositions(now, undefined, stopId);

  assert.deepEqual(
    positionsAtStop,
    allPositions.filter(({ routeId }) => routeIdsAtStop.has(routeId)),
  );
  assert.ok(positionsAtStop.length < allPositions.length);
  assert.ok(positionsAtStop.some(({ routeId }) => routeId === outbound.id));
  assert.deepEqual(getPositions(new Date('2026-11-11T03:00:00+03:00')), []);
});

test('a trip keeps its identity when Friday service continues after midnight', async () => {
  const { createVehiclePositions } = await modules;
  const getPositions = createVehiclePositions();

  const routeId = 'bus-17-direction-0';

  // Полночь меняет дату и тип дня, но рейс начинался ещё в пятницу.
  const before = getPositions(new Date('2026-11-13T23:59:59+03:00'), routeId);
  const after = getPositions(new Date('2026-11-14T00:00:00+03:00'), routeId);

  assert.equal(before.length, 1);
  assert.equal(after.length, 1);
  assert.equal(after[0].id, before[0].id);
  assert.notDeepEqual(after[0].coordinates, before[0].coordinates);
});

test('compatible directions from across the network appear over a weekday and weekend', async () => {
  const { createVehiclePositions } = await modules;
  const getPositions = createVehiclePositions();
  const routeIds = new Set();

  // Проверяем охват по расписанию за оба типа дня, а не только три направления пилота.
  for (const date of ['2026-11-11', '2026-11-14']) {
    const startOfDay = Date.parse(date + 'T00:00:00+03:00');
    for (let minute = 0; minute < 1440; minute++) {
      for (const { routeId } of getPositions(new Date(startOfDay + minute * 60_000))) {
        routeIds.add(routeId);
      }
    }
  }

  assert.equal(routeIds.size, 144);
  assert.ok(routeIds.has('bus-34-direction-0'));
  assert.ok(routeIds.has('trolleybus-11-direction-0'));
  assert.ok(!routeIds.has('bus-46-direction-1'));
});

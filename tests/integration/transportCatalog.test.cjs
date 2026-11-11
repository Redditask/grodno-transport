const assert = require('node:assert/strict');
const { test } = require('node:test');

const data = require('../fixtures/searchData.cjs');

const catalogModule = import('@/data/transportData');

test('catalog search keeps results independent across successive normalized queries', async () => {
  const { createTransportCatalog } = await import('@/data/utils/createTransportCatalog');
  // Используем один каталог для нескольких запросов, как в приложении.
  const catalog = createTransportCatalog(data);

  const buses = catalog.search('  АВТОБУС №2  ');
  assert.deepEqual(
    buses.routes.map(({ line }) => line.number),
    ['2', '2', '2', '20'],
  );
  assert.ok(buses.routes.every(({ line }) => line.transportType === 'bus'));
  assert.deepEqual(buses.stops, []);

  // Меняем тип запроса и затем возвращаемся к автобусам: старые результаты не должны вмешиваться.
  const stops = catalog.search('  УЛИЦА ЕЛОЧНАЯ  ');
  assert.deepEqual(
    stops.stops.map(({ id }) => id),
    ['stop-4'],
  );
  assert.deepEqual(stops.routes, []);

  assert.deepEqual(catalog.search('автобус 2'), buses);
});

test('catalog keeps ordered stops and resolves the same timetable from each screen', async () => {
  const { transportCatalog } = await catalogModule;
  const routes = require('../../src/data/routes.json');
  const routeId = 'bus-18-direction-1';
  const stopId = 'stop-1654';
  // Получаем одно расписание тремя путями: из маршрута, из остановки и из экрана расписания.
  const route = transportCatalog.getRouteDetails(routeId);
  const stop = transportCatalog.getStopDetails(stopId);
  const fullSchedule = transportCatalog.getScheduleDetails(routeId, stopId);
  const schedule = route.routeStops.find(({ stop }) => stop.id === stopId).schedule;

  assert.deepEqual(
    route.routeStops.map(({ stop }) => stop.id),
    routes.find(({ id }) => id === routeId).stopIds,
  );
  assert.equal(route.oppositeRoute.id, 'bus-18-direction-0');
  assert.ok(schedule);
  assert.equal(stop.routeItems.find((item) => item.route.id === routeId).schedule, schedule);
  assert.equal(fullSchedule.routeItem.schedule, schedule);
  assert.equal(
    transportCatalog.getScheduleDetails(routeId, 'stop-1132').routeItem.schedule,
    undefined,
  );
  assert.equal(transportCatalog.getScheduleDetails(routeId, 'missing-stop'), undefined);
});

test('a stop without coordinates stays searchable and has no map marker', async () => {
  const { transportCatalog } = await catalogModule;
  // Остановка без координат остаётся доступна в поиске, но не создаёт метку.
  const stopId = 'stop-1132';

  assert.ok(transportCatalog.search('Береговой').stops.some(({ id }) => id === stopId));
  assert.equal(transportCatalog.getMappedStop(stopId), undefined);
  assert.ok(transportCatalog.getMappedStop('stop-1654'));
});

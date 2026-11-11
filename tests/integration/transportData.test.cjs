const assert = require('node:assert/strict');
const { test } = require('node:test');

const lines = require('../../src/data/lines.json');
const routes = require('../../src/data/routes.json');
const schedules = require('../../src/data/schedules.json');
const stops = require('../../src/data/stops.json');

const indexById = (entries, name) => {
  const index = new Map();

  for (const entry of entries) {
    assert.ok(!index.has(entry.id), `${name}: duplicate ID ${entry.id}`);
    index.set(entry.id, entry);
  }

  return index;
};

test('transport JSON has unique IDs and valid line, route, stop and schedule links', () => {
  // Строим индексы и проверяем уникальность ID перед проверкой ссылок между таблицами.
  const linesById = indexById(lines, 'lines');
  const routesById = indexById(routes, 'routes');
  const stopsById = indexById(stops, 'stops');
  // Для каждой пары «маршрут + остановка» допустимо только одно расписание.
  const scheduleKeys = new Set();

  for (const line of lines) {
    assert.ok(
      ['bus', 'trolleybus'].includes(line.transportType),
      `${line.id}: invalid transport type`,
    );
  }

  for (const route of routes) {
    assert.ok(linesById.has(route.lineId), `${route.id}: missing line ${route.lineId}`);

    for (const stopId of route.stopIds) {
      assert.ok(stopsById.has(stopId), `${route.id}: missing stop ${stopId}`);
    }
  }

  for (const { routeId, stopId } of schedules) {
    const key = `${routeId} / ${stopId}`;
    assert.ok(
      routesById.get(routeId)?.stopIds.includes(stopId),
      `${key}: stop is not on the route`,
    );
    assert.ok(!scheduleKeys.has(key), `${key}: duplicate schedule`);
    scheduleKeys.add(key);
  }
});

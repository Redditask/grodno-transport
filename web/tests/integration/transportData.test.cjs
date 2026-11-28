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

  for (const { routeId, stopId, departures } of schedules) {
    const key = `${routeId} / ${stopId}`;
    assert.ok(
      routesById.get(routeId)?.stopIds.includes(stopId),
      `${key}: stop is not on the route`,
    );
    assert.ok(!scheduleKeys.has(key), `${key}: duplicate schedule`);
    scheduleKeys.add(key);

    for (const [dayType, times] of Object.entries(departures)) {
      for (const { time, serviceMinutes } of times) {
        const label = `${key} / ${dayType} / ${time}`;
        assert.ok(
          Number.isInteger(serviceMinutes) && serviceMinutes >= 0,
          `${label}: invalid serviceMinutes ${serviceMinutes}`,
        );

        const hours = String(Math.floor(serviceMinutes / 60) % 24).padStart(2, '0');
        const minutes = String(serviceMinutes % 60).padStart(2, '0');
        assert.equal(time, `${hours}:${minutes}`, `${label}: time does not match serviceMinutes`);
      }
    }
  }
});

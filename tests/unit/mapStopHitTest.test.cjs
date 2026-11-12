const assert = require('node:assert/strict');
const { test } = require('node:test');

const pointFeature = (stopId, coordinates) => ({
  properties: { stopId },
  geometry: { type: 'Point', coordinates },
});

const map = {
  project: ([longitude, latitude]) => [longitude * 10, latitude * 10],
};
const cursor = {
  dist: ([x, y]) => Math.hypot(50 - x, 50 - y),
};

test('hit testing chooses the closest valid stop in screen coordinates', async () => {
  const { getNearestStopId } = await import('@/components/CityMap/layers/getNearestStopId');
  // В области курсора есть несколько объектов; выбираем ближайшую действительную метку.
  const features = [
    pointFeature('farther', [7, 7]),
    pointFeature(42, [5, 5]),
    { properties: { stopId: 'line' }, geometry: { type: 'LineString', coordinates: [] } },
    pointFeature('nearer', [5.2, 5.1]),
  ];

  assert.equal(getNearestStopId(map, cursor, features), 'nearer');
});

test('hit testing returns no stop when none of the features is a valid marker', async () => {
  const { getNearestStopId } = await import('@/components/CityMap/layers/getNearestStopId');

  // Без ID объект не может открыть карточку остановки.
  assert.equal(getNearestStopId(map, cursor, [pointFeature(undefined, [5, 5])]), undefined);
});

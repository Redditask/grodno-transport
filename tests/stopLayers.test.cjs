const assert = require('node:assert/strict');
const { test } = require('node:test');

test('map markers follow the selected direction and reset when leaving it', async () => {
  const { selectRouteOnMap } = await import('@/components/CityMap/layers/stopLayers');
  const routes = require('../src/data/routes.json');
  const stops = require('../src/data/stops.json');
  const stopFilters = [];
  const map = {
    setFilter(layerId, filter) {
      assert.equal(layerId, 'transport-stop-points');
      stopFilters.push(filter);
    },
  };

  const directions = ['bus-1-direction-0', 'bus-1-direction-1'].map((id) =>
    routes.find((route) => route.id === id),
  );
  for (const direction of directions) {
    const firstStop = stops.find(({ id }) => id === direction.stopIds[0]);
    assert.ok(firstStop.coordinates);
    assert.deepEqual(selectRouteOnMap(map, direction.id), firstStop.coordinates);
  }
  assert.equal(selectRouteOnMap(map), undefined);

  assert.deepEqual(stopFilters, [
    ...directions.map(({ stopIds }) => ['in', ['get', 'stopId'], ['literal', stopIds]]),
    null,
  ]);
});

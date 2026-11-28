const assert = require('node:assert/strict');
const { test } = require('node:test');

test('map markers follow the selected direction and reset when leaving it', async () => {
  const { selectRouteOnMap } = await import('@/components/CityMap/layers/routeLayer');
  const routes = require('../../src/data/routes.json');

  // Подменяем карту объектом, который записывает переданные ему фильтры.
  const stopFilters = [];
  const map = {
    getSource: () => undefined,
    setFilter(layerId, filter) {
      assert.equal(layerId, 'transport-stop-points');
      stopFilters.push(filter);
    },
  };

  const directions = ['trolleybus-12-direction-1', 'bus-1-direction-1'].map((id) =>
    routes.find((route) => route.id === id),
  );

  for (const direction of directions) {
    selectRouteOnMap(map, direction.id);
  }
  selectRouteOnMap(map);

  // После смены направления список ID обновляется, после отмены фильтр сбрасывается.
  assert.deepEqual(stopFilters, [
    ...directions.map(({ stopIds }) => ['in', ['get', 'stopId'], ['literal', stopIds]]),
    null,
  ]);
});

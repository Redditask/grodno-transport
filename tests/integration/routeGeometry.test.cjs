const assert = require('node:assert/strict');
const { test } = require('node:test');

const routes = require('../../src/data/routes.json');
const stops = require('../../src/data/stops.json');

const mappedRouteIds = Object.keys(require('../../src/data/routeGeometry.json'));

const distanceToStop = ([longitude, latitude], stop) =>
  Math.hypot(
    (longitude - stop.longitude) * 111_320 * Math.cos((stop.latitude * Math.PI) / 180),
    (latitude - stop.latitude) * 111_320,
  );

test('stored route lines pass near their stops in the stored direction', async () => {
  const { getRouteGeometry } = await import('@/data/routeGeometry');

  assert.deepEqual(new Set(mappedRouteIds), new Set(routes.map(({ id }) => id)));

  for (const routeId of mappedRouteIds) {
    const route = routes.find(({ id }) => id === routeId);
    const points = getRouteGeometry(routeId);

    // Проверяем порядок остановок и допускаем смещение платформы от оси дороги.
    let previousPointIndex = 0;
    for (const stopId of route.stopIds) {
      const { coordinates } = stops.find(({ id }) => id === stopId);
      const pointIndex = points.findIndex(
        (point, index) => index >= previousPointIndex && distanceToStop(point, coordinates) <= 55,
      );
      assert.notEqual(
        pointIndex,
        -1,
        `${routeId}: line misses ${stopId} or passes it out of order`,
      );
      previousPointIndex = pointIndex;
    }
  }
});

test('stored routes do not repeat the reported detours', async () => {
  const { getRouteGeometry } = await import('@/data/routeGeometry');

  const sections = [
    ['bus-1-direction-0', 'stop-315', 'stop-1094', 1000],
    ['bus-1-direction-1', 'stop-333', 'stop-1686', 950],
    ['bus-1-direction-1', 'stop-319', 'stop-316', 1050],
    ['trolleybus-12-direction-0', 'stop-570', 'stop-1063', 850],
    ['trolleybus-8-direction-1', 'stop-537', 'stop-534', 550],
    ['trolleybus-23-direction-0', 'stop-711', 'stop-1030', 1200],
    ['trolleybus-23-direction-1', 'stop-1620', 'stop-1555', 800],
    ['trolleybus-25-direction-0', 'stop-1727', 'stop-557', 400],
    ['bus-15-direction-1', 'stop-466', 'stop-528', 850],
    ['bus-46-direction-1', 'stop-466', 'stop-528', 850],
    ['bus-50-direction-1', 'stop-1122', 'stop-1044', 600],
    ['bus-14-direction-0', 'stop-605', 'stop-454', 900],
    ['bus-14-direction-1', 'stop-1568', 'stop-606', 1100],
    ['bus-24-direction-0', 'stop-465', 'stop-468', 500],
  ];

  for (const [routeId, fromId, toId, maxMeters] of sections) {
    const points = getRouteGeometry(routeId);
    const nearestIndex = (stopId) => {
      const { coordinates } = stops.find(({ id }) => id === stopId);

      return points.reduce(
        (nearest, point, index) =>
          distanceToStop(point, coordinates) < distanceToStop(points[nearest], coordinates)
            ? index
            : nearest,
        0,
      );
    };

    // Дворовой крюк увеличивает длину участка между двумя соседними опорными остановками.
    const from = nearestIndex(fromId);
    const to = nearestIndex(toId);
    assert.ok(from < to);

    let distance = 0;
    for (let index = from; index < to; index++) {
      const [longitude, latitude] = points[index];
      distance += distanceToStop(points[index + 1], { longitude, latitude });
    }

    assert.ok(
      distance <= maxMeters,
      `${routeId}: ${fromId} → ${toId} is ${Math.round(distance)} m`,
    );
  }
});

test('trolleybus 8 serves the right-hand platforms in both directions', async () => {
  const { getRouteGeometry } = await import('@/data/routeGeometry');
  const platforms = [
    ['trolleybus-8-direction-0', ['stop-420', 'stop-419', 'stop-533']],
    ['trolleybus-8-direction-1', ['stop-532', 'stop-385', 'stop-421']],
  ];

  for (const [routeId, stopIds] of platforms) {
    const route = routes.find(({ id }) => id === routeId);
    const points = getRouteGeometry(routeId);

    // Проверяем площадку и знак поперечного смещения от ближайшего отрезка по ходу движения.
    for (const stopId of stopIds) {
      assert.ok(route.stopIds.includes(stopId), routeId + ': missing ' + stopId);

      const { coordinates } = stops.find(({ id }) => id === stopId);
      let nearest = { distance: Infinity, side: 0 };
      for (let index = 1; index < points.length; index++) {
        const [longitude, latitude] = points[index - 1];
        const [nextLongitude, nextLatitude] = points[index];
        const dx = (nextLongitude - longitude) * 66_000;
        const dy = (nextLatitude - latitude) * 111_320;
        const x = (coordinates.longitude - longitude) * 66_000;
        const y = (coordinates.latitude - latitude) * 111_320;
        const length = Math.hypot(dx, dy);
        const position = Math.max(0, Math.min(1, (x * dx + y * dy) / length ** 2));
        const distance = Math.hypot(x - dx * position, y - dy * position);

        if (distance < nearest.distance) {
          nearest = { distance, side: (dx * y - dy * x) / length };
        }
      }

      assert.ok(nearest.side < 0, routeId + ': wrong side for ' + stopId);
    }
  }
});

test('trolleybus 23 crosses Olshanka and uses the intended Odelskaya platforms', async () => {
  const { getRouteGeometry } = await import('@/data/routeGeometry');
  const outbound = routes.find(({ id }) => id === 'trolleybus-23-direction-0');
  const inbound = routes.find(({ id }) => id === 'trolleybus-23-direction-1');

  // К Глухова отправляемся с южной площадки, на обратном пути проезжаем обе по порядку.
  assert.equal(outbound.stopIds[0], 'stop-1555');
  assert.deepEqual(inbound.stopIds.slice(-2), ['stop-1620', 'stop-1555']);

  // Линия пересекает Ольшанку по улице Огинского.
  const oginskogo = { longitude: 23.8157048, latitude: 53.6175628 };
  assert.ok(getRouteGeometry(inbound.id).some((point) => distanceToStop(point, oginskogo) < 30));
});

test('bus 27 serves the other TEC-2 platform and takes the M6 interchange towards Repina', async () => {
  const { getRouteGeometry } = await import('@/data/routeGeometry');
  const outbound = routes.find(({ id }) => id === 'bus-27-direction-0');
  const inbound = routes.find(({ id }) => id === 'bus-27-direction-1');
  assert.equal(outbound.stopIds.at(-1), 'stop-1434');

  // После Белвторполимера автобус проходит восточную развязку и едет по М6 на запад.
  const checkpoints = [
    { longitude: 23.9547354, latitude: 53.6605714 },
    { longitude: 23.9614621, latitude: 53.6575082 },
    { longitude: 23.9065118, latitude: 53.6615647 },
  ];
  const points = getRouteGeometry(inbound.id);
  let previousIndex = -1;
  for (const checkpoint of checkpoints) {
    const index = points.findIndex(
      (point, pointIndex) => pointIndex > previousIndex && distanceToStop(point, checkpoint) < 30,
    );
    assert.notEqual(index, -1);
    previousIndex = index;
  }
});

test('the map switches pilot lines and clears the source for other selections', async () => {
  const { selectRouteOnMap } = await import('@/components/CityMap/layers/routeLayer');
  const updates = [];
  const source = { type: 'geojson', setData: (data) => updates.push(data) };
  const map = { getSource: () => source, setFilter: () => {} };

  // Смена направления подставляет новую линию. Отмена выбора очищает источник.
  const firstBounds = selectRouteOnMap(map, 'bus-1-direction-0');
  const reverseBounds = selectRouteOnMap(map, 'bus-1-direction-1');
  assert.notDeepEqual(updates[0], updates[1]);
  for (const bounds of [firstBounds, reverseBounds]) {
    const [west, south, east, north] = bounds;
    assert.ok(west < east && south < north);
  }

  const emptySource = { type: 'FeatureCollection', features: [] };
  assert.equal(selectRouteOnMap(map, 'unknown-route'), undefined);
  assert.deepEqual(updates.at(-1), emptySource);

  // При смене вида транспорта линия получает его цвет из общей палитры.
  assert.equal(updates[0].properties.transportType, 'bus');
  selectRouteOnMap(map, 'trolleybus-12-direction-0');
  assert.equal(updates.at(-1).properties.transportType, 'trolleybus');
  assert.equal(selectRouteOnMap(map), undefined);
  assert.deepEqual(updates.at(-1), emptySource);
});

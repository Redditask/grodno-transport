const assert = require('node:assert/strict');
const { test } = require('node:test');

const modules = import('@/components/CityMap/vehicles/vehicleTrips');

const departure = (serviceMinutes) => ({ serviceMinutes });

test('a trip follows the bends in the road and reaches each stop at its scheduled time', async () => {
  const { buildVehicleTrips, getVehiclePosition, measureRoute, projectStops } = await modules;

  // Первый перегон идёт через угол. Проверяем дорогу и время, а не прямую между площадками.
  const route = measureRoute([
    [0, 0],
    [0.001, 0],
    [0.001, 0.001],
    [0.002, 0.001],
  ]);
  const distances = projectStops(route, [
    [0, 0],
    [0.001, 0.001],
    [0.002, 0.001],
  ]);
  const [trip] = buildVehicleTrips([[departure(10)], [departure(14)], [departure(16)]], distances);

  assert.equal(getVehiclePosition(route, distances, trip, 9.99), undefined);
  assert.deepEqual(getVehiclePosition(route, distances, trip, 12), [0.001, 0]);
  assert.deepEqual(getVehiclePosition(route, distances, trip, 14), [0.001, 0.001]);
  assert.equal(getVehiclePosition(route, distances, trip, 16), undefined);
});

test('stop projection checks the remaining stops before choosing a pass through a loop', async () => {
  const { measureRoute, projectStops } = await modules;

  // Первые две остановки ближе к позднему проезду. Третья доступна только на раннем.
  const route = measureRoute([
    [0, 0.0002],
    [0.002, 0.0002],
    [0.003, 0.0002],
    [0.003, -0.001],
    [0, -0.001],
    [0, 0],
    [0.002, 0],
    [0.002, -0.001],
  ]);
  const stops = [
    [0.001, 0],
    [0.0017, 0],
    [0.0028, 0.0002],
  ];

  const distances = projectStops(route, stops);

  assert.ok(distances);
  assert.ok(distances[0] < distances[1]);
  assert.ok(distances[1] < route[1].distance);
  assert.ok(distances[2] > route[1].distance && distances[2] < route[2].distance);
  assert.equal(projectStops(route, [stops[2], ...stops]), undefined);
});

test('incomplete and implausible schedules do not produce guessed trips', async () => {
  const { buildVehicleTrips } = await modules;

  // Пропущенное время сдвигает пары, а одна минута на 5 км даёт скачок на карте.
  assert.deepEqual(
    buildVehicleTrips([[departure(10), departure(20)], [departure(14)]], [0, 500]),
    [],
  );
  assert.deepEqual(buildVehicleTrips([[departure(10)], [departure(11)]], [0, 5000]), []);
});

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

test('incomplete and implausible schedules do not produce guessed trips', async () => {
  const { buildVehicleTrips } = await modules;

  // Пропущенное время сдвигает пары, а одна минута на 5 км даёт скачок на карте.
  assert.deepEqual(
    buildVehicleTrips([[departure(10), departure(20)], [departure(14)]], [0, 500]),
    [],
  );
  assert.deepEqual(buildVehicleTrips([[departure(10)], [departure(11)]], [0, 5000]), []);
});

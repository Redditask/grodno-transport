const assert = require('node:assert/strict');
const { test } = require('node:test');

const modulePromise = import('@/data/utils/getOppositeStop');

const makeStop = (id, name, directionHint) => ({
  id,
  name,
  directionHint,
  coordinates: { latitude: 0, longitude: 0 },
});

test('a pair switches both ways, normalizes names and preserves source data', async () => {
  const { getOppositeStop } = await modulePromise;

  const outbound = makeStop('stop-2', ' Улица Белые Росы ', 'К Лапенковской');
  const inbound = makeStop('stop-10', 'улица белые росы', 'К Брикеля');
  const unrelated = makeStop('stop-3', 'Улица Белая', 'К Боброва');
  const stops = [inbound, unrelated, outbound];
  const before = JSON.stringify(stops);

  assert.equal(getOppositeStop(stops, outbound), inbound);
  assert.equal(getOppositeStop(stops, inbound), outbound);
  assert.equal(JSON.stringify(stops), before);

  const first = makeStop('stop-4', 'Румлёво', 'К Клецкова');
  const second = makeStop('stop-5', 'РУМЛЕВО', 'К Румлёвскому');

  assert.equal(getOppositeStop([first, second], first), second);
});

test('three same-name stops form a stable cycle regardless of source order', async () => {
  const { getOppositeStop } = await modulePromise;

  const first = makeStop('stop-2', 'Гродно Азот', 'К Карского');
  const second = makeStop('stop-10', 'Гродно Азот', 'К Грандичам');
  const third = makeStop('stop-20', 'Гродно Азот', 'К Аульсу');

  for (const stops of [
    [third, first, second],
    [second, third, first],
  ]) {
    assert.equal(getOppositeStop(stops, first), second);
    assert.equal(getOppositeStop(stops, second), third);
    assert.equal(getOppositeStop(stops, third), first);
  }
});

test('unique stops and groups with missing hints have no switch target', async () => {
  const { getOppositeStop } = await modulePromise;

  const first = makeStop('stop-1', 'Улица Мирная');
  const second = makeStop('stop-2', 'Улица Мирная');
  const labeled = makeStop('stop-3', 'Улица Мирная', 'К Обрембского');
  const unique = makeStop('stop-4', 'Зоопарк');

  assert.equal(getOppositeStop([unique], unique), undefined);
  assert.equal(getOppositeStop([first, second], first), undefined);
  assert.equal(getOppositeStop([first, labeled], labeled), undefined);
});

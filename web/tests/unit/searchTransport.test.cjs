const assert = require('node:assert/strict');
const { test } = require('node:test');

const data = require('../fixtures/searchData.cjs');

const searchModule = import('@/data/utils/searchTransport');

test('empty and whitespace-only queries have no results', async () => {
  const { searchTransport } = await searchModule;

  // Пустая строка и одни пробелы должны давать одинаковый результат.
  for (const query of ['', '   '])
    assert.deepEqual(searchTransport(query, data), { routes: [], stops: [] });
});

test('number search ranks exact matches first, keeps all directions and excludes substring matches', async () => {
  const { searchTransport } = await searchModule;

  // Сравниваем точный номер 2, префикс 20 и название остановки с цифрой.
  const result = searchTransport('2', data);

  assert.deepEqual(
    result.routes.map((item) => item.line.number),
    ['2', '2', '2', '2', '20'],
  );
  assert.equal(result.routes.filter((item) => item.line.id === 'bus-2').length, 3);
  assert.equal(result.stops[0].name, 'Школа №2');
});

test('transport qualifiers restrict the type and support the number sign', async () => {
  const { searchTransport } = await searchModule;

  // Уточнение вида транспорта оставляет только нужный тип, символ № не мешает.
  const buses = searchTransport('  Автобус №2 ', data);

  assert.ok(buses.routes.length > 0);
  assert.ok(buses.routes.every((item) => item.line.transportType === 'bus'));
  assert.deepEqual(buses.stops, []);

  assert.equal(searchTransport('троллейбус 2', data).routes.length, 1);
  assert.equal(searchTransport('автобус', data).routes.length, 5);
});

test('stop search ignores case and ё, prioritizes prefixes and preserves distinct stop identities', async () => {
  const { searchTransport } = await searchModule;

  // У одноимённых остановок разные ID, а совпадение внутри названия должно идти после префикса.
  const fixture = {
    ...data,
    stops: [
      ...data.stops,
      { ...data.stops[0], id: 'duplicate-name' },
      { ...data.stops[0], id: 'inside-name', name: 'Улица Центр' },
    ],
  };

  const result = searchTransport(' ЦЕНТР ', fixture);

  assert.equal(result.stops.length, 4);
  assert.equal(result.stops.at(-1).id, 'inside-name');
  assert.equal(searchTransport('елочная', fixture).stops[0].id, 'stop-4');
});

test('unmatched queries return no results and search never changes its inputs', async () => {
  const { searchTransport } = await searchModule;

  // Сохраняем снимок входа и сравниваем его после пустого и успешного поиска.
  const before = JSON.stringify(data);

  const result = searchTransport('несуществующая', data);

  assert.equal(result.stops.length + result.routes.length, 0);

  searchTransport('2', data);
  assert.equal(JSON.stringify(data), before);
});

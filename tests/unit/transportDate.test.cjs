const assert = require('node:assert/strict');
const { test } = require('node:test');

test('header date and time cross midnight together in Minsk', async () => {
  const { formatTransportDate, formatTransportTime } = await import('@/utils/transportTime');
  // В Минске год сменяется в 21:00 UTC. Проверяем, что время и дата меняются вместе.
  const beforeMidnight = new Date('2026-12-31T20:59:00Z');
  const afterMidnight = new Date('2026-12-31T21:00:00Z');

  assert.equal(formatTransportDate(beforeMidnight), 'четверг, 31 декабря');
  assert.equal(formatTransportTime(beforeMidnight), '23:59');
  assert.equal(formatTransportDate(afterMidnight), 'пятница, 1 января');
  assert.equal(formatTransportTime(afterMidnight), '00:00');
});

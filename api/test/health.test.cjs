const assert = require('node:assert/strict');
const { test } = require('node:test');

const { createApp } = require('../dist/create-app.js');

test('GET /api/health returns the API status', async (t) => {
  const app = await createApp();
  t.after(() => app.close());

  await app.listen(0, '127.0.0.1');
  const response = await fetch(`${await app.getUrl()}/api/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

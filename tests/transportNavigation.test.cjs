const assert = require('node:assert/strict');
const { test } = require('node:test');

const navigation = import('@/hooks/useTransportNavigation/utils');
const position = { scrollTop: 240, focusId: 'stop-7' };

test('back from a schedule restores the previous screen and its focus position', async () => {
  const { initialSearchHistory, updateSearchHistory, getActiveSearchEntry, getSelectedStopId } =
    await navigation;
  const route = { kind: 'routeStops', routeId: 'bus-1-out' };
  const schedule = { kind: 'schedule', routeId: route.routeId, stopId: 'stop-7' };

  const routeHistory = updateSearchHistory(initialSearchHistory, {
    kind: 'open',
    screen: route,
    from: position,
  });
  const scheduleHistory = updateSearchHistory(routeHistory, {
    kind: 'open',
    screen: schedule,
    from: position,
  });

  assert.equal(getSelectedStopId(scheduleHistory), 'stop-7');
  for (const action of [{ kind: 'back' }, { kind: 'back', until: 'unselected' }]) {
    const restored = updateSearchHistory(scheduleHistory, action);
    assert.deepEqual(getActiveSearchEntry(restored), { screen: route, ...position });
    assert.equal(getSelectedStopId(restored), undefined);
  }
});

test('clearing a stop selected from a route keeps the route until it is dismissed', async () => {
  const { initialSearchHistory, updateSearchHistory, getActiveSearchEntry, getSelectedStopId } =
    await navigation;
  const route = { kind: 'routeStops', routeId: 'bus-1-out' };
  const fromSearch = updateSearchHistory(initialSearchHistory, {
    kind: 'open',
    screen: route,
    from: position,
  });
  const mapSelection = updateSearchHistory(fromSearch, {
    kind: 'open',
    screen: { kind: 'stopRoutes', stopId: 'stop-7' },
    from: 'map',
  });
  const nextStop = updateSearchHistory(mapSelection, {
    kind: 'replace',
    screen: { kind: 'stopRoutes', stopId: 'stop-8' },
  });

  assert.equal(getSelectedStopId(nextStop), 'stop-8');
  const clearedStop = updateSearchHistory(nextStop, { kind: 'back', until: 'unselected' });
  assert.deepEqual(clearedStop, fromSearch);
  assert.equal(getSelectedStopId(clearedStop), undefined);

  const clearedRoute = updateSearchHistory(clearedStop, { kind: 'back' });
  assert.deepEqual(getActiveSearchEntry(clearedRoute), {
    screen: { kind: 'results' },
    ...position,
  });
});

test('back returns to the selected stop while clearing the map returns to results', async () => {
  const { initialSearchHistory, updateSearchHistory, getActiveSearchEntry, getSelectedStopId } =
    await navigation;
  const stop = updateSearchHistory(initialSearchHistory, {
    kind: 'open',
    screen: { kind: 'stopRoutes', stopId: 'stop-7' },
    from: 'map',
  });
  const schedule = updateSearchHistory(stop, {
    kind: 'open',
    screen: { kind: 'schedule', routeId: 'bus-1-out', stopId: 'stop-7' },
    from: position,
  });

  const back = updateSearchHistory(schedule, { kind: 'back' });
  assert.equal(getSelectedStopId(back), 'stop-7');
  assert.deepEqual(getActiveSearchEntry(back), {
    screen: { kind: 'stopRoutes', stopId: 'stop-7' },
    ...position,
  });

  const cleared = updateSearchHistory(schedule, { kind: 'back', until: 'unselected' });
  assert.equal(getSelectedStopId(cleared), undefined);
  assert.equal(getActiveSearchEntry(cleared).screen.kind, 'results');
});

test('clicking the selected map marker keeps the timetable and its return history', async () => {
  const { initialSearchHistory, updateSearchHistory } = await navigation;
  const routeId = 'bus-1-out';
  const stopId = 'stop-7';
  const route = updateSearchHistory(initialSearchHistory, {
    kind: 'open',
    screen: { kind: 'routeStops', routeId },
    from: position,
  });
  const timetable = updateSearchHistory(route, {
    kind: 'open',
    screen: { kind: 'schedule', routeId, stopId },
    from: position,
  });

  const repeatedClick = updateSearchHistory(timetable, {
    kind: 'open',
    screen: { kind: 'stopRoutes', stopId },
    from: 'map',
  });

  assert.equal(repeatedClick, timetable);
});

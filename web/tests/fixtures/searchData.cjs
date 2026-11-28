const lines = [
  { id: 'bus-2', number: '2', transportType: 'bus' },
  { id: 'trolley-2', number: '2', transportType: 'trolleybus' },
  { id: 'bus-20', number: '20', transportType: 'bus' },
  { id: 'bus-12', number: '12', transportType: 'bus' },
];

const stops = ['Центр', 'Рынок', 'Центральная улица', 'Школа №2', 'Улица Ёлочная'].map(
  (name, index) => ({
    id: `stop-${index}`,
    name,
    coordinates: { latitude: 0, longitude: 0 },
  }),
);

const routes = [
  { id: 'bus-20-out', lineId: 'bus-20', stopIds: ['stop-0', 'stop-1'] },
  { id: 'bus-2-out', lineId: 'bus-2', stopIds: ['stop-0', 'stop-1'] },
  { id: 'bus-2-back', lineId: 'bus-2', stopIds: ['stop-1', 'stop-0'] },
  { id: 'bus-2-branch', lineId: 'bus-2', stopIds: ['stop-0', 'stop-2'] },
  { id: 'trolley-2-out', lineId: 'trolley-2', stopIds: ['stop-0', 'stop-1'] },
  { id: 'bus-12-out', lineId: 'bus-12', stopIds: ['stop-0', 'stop-1'] },
];

module.exports = { lines, routes, stops, schedules: [] };

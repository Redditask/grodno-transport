import type { Line } from '@/domain/line';

export const formatTransportLabel = (line: Line): string =>
  `${line.transportType === 'bus' ? 'Автобус' : 'Троллейбус'} №${line.number}`;

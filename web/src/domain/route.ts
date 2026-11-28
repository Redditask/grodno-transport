import type { Line } from './line';
import type { Stop } from './stop';

export interface Route {
  id: string;
  lineId: Line['id'];
  stopIds: Stop['id'][];
}

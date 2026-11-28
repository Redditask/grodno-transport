import type { Line } from '@/domain/line';
import type { Route } from '@/domain/route';
import type { Schedule } from '@/domain/schedule';

export interface RouteSummary {
  route: Route;
  line: Line;
  origin: string;
  destination: string;
}

export interface StopRouteItem extends RouteSummary {
  schedule: Schedule | undefined;
}

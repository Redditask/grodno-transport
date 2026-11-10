import { createTransportCatalog } from '@/data/utils/createTransportCatalog';
import type { Line } from '@/domain/line';
import type { Route } from '@/domain/route';
import type { Schedule } from '@/domain/schedule';
import type { Stop } from '@/domain/stop';

import lines from './lines.json' with { type: 'json' };
import routes from './routes.json' with { type: 'json' };
import schedules from './schedules.json' with { type: 'json' };
import stops from './stops.json' with { type: 'json' };

export interface TransportData {
  lines: Line[];
  routes: Route[];
  stops: Stop[];
  schedules: Schedule[];
}

export const transportCatalog = createTransportCatalog({
  lines: lines.map((line): Line => {
    const { id, transportType } = line;
    if (transportType !== 'bus' && transportType !== 'trolleybus') {
      throw new Error(`Invalid transport type for line ${id}: ${transportType}`);
    }

    return { ...line, transportType };
  }),
  routes,
  stops,
  schedules,
});

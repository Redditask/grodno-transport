import type { TransportData } from '@/data/transportData';
import type { Stop } from '@/domain/stop';
import type { StopRouteItem } from '@/types/route';

import { buildRouteSummary } from './buildRouteSummary';
import { findStopSchedule } from './findStopSchedule';

export const buildStopRouteItems = (stop: Stop, transportData: TransportData): StopRouteItem[] => {
  return transportData.routes
    .filter((route) => route.stopIds.includes(stop.id))
    .flatMap((route) => {
      const routeSummary = buildRouteSummary(route, transportData);
      if (!routeSummary) return [];

      const schedule = findStopSchedule(transportData.schedules, route.id, stop.id);

      return [{ ...routeSummary, schedule }];
    });
};

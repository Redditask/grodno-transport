import geometry from './routeGeometry.json' with { type: 'json' };

// Route lines follow OpenStreetMap roads. They come from matched route relations or local routing.
// For off-road platforms, use the nearby road segment when the stop order still matches.
// Bus 1 outbound uses a main-road waypoint at stop-309 (23.826940, 53.665686).
const geometryByRouteId: Record<string, number[][] | undefined> = geometry;

export const getRouteGeometry = (routeId: string) => geometryByRouteId[routeId];

import geometry from './routeGeometry.json' with { type: 'json' };

// Линии идут по дорогам OpenStreetMap. Они взяты из связей маршрутов или построены локально.
// Если площадка находится в стороне от дороги, берём ближайший участок с учётом порядка остановок.
// Для прямого направления автобуса №1 у stop-309 задана точка на основной дороге (23.826940, 53.665686).
const geometryByRouteId: Record<string, number[][] | undefined> = geometry;

export const getRouteGeometry = (routeId: string) => geometryByRouteId[routeId];

import type { Map as LibreMap } from 'maplibre-gl';
import { Marker, Popup } from 'maplibre-gl';

import { createVehicleMarker } from '../vehicles/vehicleMarkers';
import { createVehiclePositions } from '../vehicles/vehiclePositions';

// Слой хранит уже созданные кнопки по ID рейса, чтобы между обновлениями двигать ту же метку.
export const createVehicleLayer = (map: LibreMap, onSelectRoute: (routeId: string) => void) => {
  const getPositions = createVehiclePositions();
  const markersById = new Map<string, Marker>();
  const tooltip = new Popup({
    className: 'map-stop-tooltip',
    closeButton: false,
    closeOnClick: false,
    closeOnMove: true,
    focusAfterOpen: false,
    offset: 14,
  });

  // При скрытии убираем кнопки и подсказку. Подготовленные расписания пригодятся при возврате.
  const clear = () => {
    tooltip.remove();
    for (const marker of markersById.values()) marker.remove();
    markersById.clear();
  };

  const update = (selectedRouteId?: string, selectedStopId?: string) => {
    const bounds = map.getBounds();
    const west = bounds.getWest();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const north = bounds.getNorth();

    // Запас по краям убирает лишние пересоздания меток при небольших движениях карты.
    const longitudePadding = (east - west) * 0.1;
    const latitudePadding = (north - south) * 0.1;

    const positions = getPositions(new Date(), selectedRouteId, selectedStopId).filter(
      ({ coordinates: [longitude, latitude] }) =>
        longitude >= west - longitudePadding &&
        longitude <= east + longitudePadding &&
        latitude >= south - latitudePadding &&
        latitude <= north + latitudePadding,
    );
    // В списке остались только активные рейсы, которые подходят под выбор и видны на карте.
    const activeIds = new Set(positions.map(({ id }) => id));

    // Удаляем рейсы, которые закончились, вышли за границы карты или больше не подходят под фильтр.
    for (const [id, marker] of markersById) {
      if (activeIds.has(id)) continue;

      if (marker.getElement().matches(':hover, :focus')) tooltip.remove();
      marker.remove();
      markersById.delete(id);
    }

    // Создаём кнопку при первом появлении рейса. Дальше обновляем её координаты.
    for (const position of positions) {
      const marker = markersById.get(position.id);
      if (!marker) {
        markersById.set(
          position.id,
          createVehicleMarker(map, Marker, tooltip, position, onSelectRoute),
        );

        continue;
      }

      marker.setLngLat(position.coordinates);
      if (tooltip.isOpen() && marker.getElement().matches(':hover, :focus')) {
        tooltip.setLngLat(position.coordinates);
      }
    }
  };

  return { update, clear };
};

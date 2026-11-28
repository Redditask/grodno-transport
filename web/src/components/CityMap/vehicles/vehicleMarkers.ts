import type { Map, Marker, Popup } from 'maplibre-gl';

import type { createVehiclePositions } from './vehiclePositions';

import styles from './VehicleMarkers.module.scss';

type VehiclePosition = ReturnType<ReturnType<typeof createVehiclePositions>>[number];

// Кнопка показывает номер маршрута и принимает фокус и нажатия. Метка MapLibre держит её на нужных координатах.
export const createVehicleMarker = (
  map: Map,
  MarkerClass: typeof Marker,
  tooltip: Popup,
  vehicle: VehiclePosition,
  onSelectRoute: (routeId: string) => void,
) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = styles.marker;
  button.dataset.transportType = vehicle.transportType;
  button.setAttribute('aria-label', vehicle.label);
  button.textContent = vehicle.routeNumber;

  const marker = new MarkerClass({ element: button }).setLngLat(vehicle.coordinates).addTo(map);

  // Используем одну подсказку на все машины и ставим её у текущей позиции этой метки.
  const showTooltip = () => {
    tooltip.setLngLat(marker.getLngLat()).setText(vehicle.label);
    if (!tooltip.isOpen()) tooltip.addTo(map);
  };

  button.addEventListener('pointerenter', showTooltip);
  button.addEventListener('focus', showTooltip);
  button.addEventListener('pointerleave', () => tooltip.remove());
  button.addEventListener('blur', () => tooltip.remove());
  button.addEventListener('click', (event) => {
    // Клик по машине не должен заодно выбрать остановку под её меткой.
    event.stopPropagation();
    tooltip.remove();
    onSelectRoute(vehicle.routeId);
  });

  return marker;
};

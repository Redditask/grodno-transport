import type { Map, Marker, Popup } from 'maplibre-gl';

import type { createVehiclePositions } from './vehiclePositions';

import styles from './VehicleMarkers.module.scss';

type VehiclePosition = ReturnType<ReturnType<typeof createVehiclePositions>>[number];

const createIcon = (transportType: VehiclePosition['transportType']) => {
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS(namespace, 'path');
  const accessories = transportType === 'bus' ? 'M2.5 9v4m19-4v4' : 'M9 6 6 2m9 4 3-4';
  path.setAttribute(
    'd',
    'M8 6h8a3 3 0 0 1 3 3v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a3 3 0 0 1 3-3ZM5 11h14M8 19v2m8-2v2M8.5 15h.5m6 0h.5' +
      accessories,
  );
  svg.append(path);

  return svg;
};

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
  button.append(createIcon(vehicle.transportType));

  const marker = new MarkerClass({ element: button }).setLngLat(vehicle.coordinates).addTo(map);

  const showTooltip = () => {
    tooltip.setLngLat(marker.getLngLat()).setText(vehicle.label);
    if (!tooltip.isOpen()) tooltip.addTo(map);
  };

  button.addEventListener('pointerenter', showTooltip);
  button.addEventListener('focus', showTooltip);
  button.addEventListener('pointerleave', () => tooltip.remove());
  button.addEventListener('blur', () => tooltip.remove());
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    tooltip.remove();
    onSelectRoute(vehicle.routeId);
  });

  return marker;
};

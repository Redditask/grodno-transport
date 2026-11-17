import type { Map as LibreMap, Marker } from 'maplibre-gl';
import type { RefObject } from 'react';
import { useEffect, useEffectEvent } from 'react';

import { createVehicleMarker } from '@/components/CityMap/vehicles/vehicleMarkers';
import { createVehiclePositions } from '@/components/CityMap/vehicles/vehiclePositions';

interface VehicleMarkersOptions {
  mapRef: RefObject<LibreMap | null>;
  isMapReady: boolean;
  selectedRouteId?: string;
  selectedStopId?: string;
  onSelectRoute: (routeId: string) => void;
}

const minOverviewZoom = 13;
const updateInterval = 100;

export const useVehicleMarkers = ({
  mapRef,
  isMapReady,
  selectedRouteId,
  selectedStopId,
  onSelectRoute,
}: VehicleMarkersOptions) => {
  const getSelection = useEffectEvent(() => ({ selectedRouteId, selectedStopId }));

  useEffect(() => {
    const map = mapRef.current;
    if (!isMapReady || !map) return;

    let isDisposed = false;
    let animationFrame = 0;
    let removeMarkers: (() => void) | undefined;

    const start = async () => {
      const { Marker, Popup } = await import('maplibre-gl');
      if (isDisposed) return;

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
      let lastUpdate = -Infinity;

      removeMarkers = () => {
        tooltip.remove();
        for (const marker of markersById.values()) marker.remove();
      };

      const animate = (timestamp: number) => {
        animationFrame = requestAnimationFrame(animate);
        if (timestamp - lastUpdate < updateInterval) return;
        lastUpdate = timestamp;

        const { selectedRouteId, selectedStopId } = getSelection();
        const showVehicles = selectedRouteId || selectedStopId || map.getZoom() >= minOverviewZoom;
        const positions = showVehicles
          ? getPositions(new Date(), selectedRouteId, selectedStopId)
          : [];
        const activeIds = new Set(positions.map(({ id }) => id));

        for (const [id, marker] of markersById) {
          if (activeIds.has(id)) continue;

          if (marker.getElement().matches(':hover, :focus')) tooltip.remove();
          marker.remove();
          markersById.delete(id);
        }

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

      animationFrame = requestAnimationFrame(animate);
    };

    void start();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrame);
      removeMarkers?.();
    };
  }, [isMapReady, mapRef, onSelectRoute]);
};

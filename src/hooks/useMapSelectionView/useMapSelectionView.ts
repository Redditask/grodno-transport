import type { Map } from 'maplibre-gl';
import type { RefObject } from 'react';
import { useEffect } from 'react';

import { selectRouteOnMap } from '@/components/CityMap/layers/routeLayer';
import { selectStopOnMap } from '@/components/CityMap/layers/stopLayers';

import { getCenterOffset, getRoutePadding } from './utils';

interface UseMapSelectionViewOptions {
  mapRef: RefObject<Map | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  clearButtonRef: RefObject<HTMLButtonElement | null>;
  selectedStopId?: string;
  selectedRouteId?: string;
  isMapReady: boolean;
}

export const useMapSelectionView = ({
  mapRef,
  containerRef,
  overlayRef,
  clearButtonRef,
  selectedStopId,
  selectedRouteId,
  isMapReady,
}: UseMapSelectionViewOptions) => {
  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;

    if (!isMapReady || !map || !container) return;

    const routeBounds = selectRouteOnMap(map, selectedRouteId);
    const stopCoordinates = selectStopOnMap(map, selectedStopId);
    if (!stopCoordinates && !routeBounds) return;

    const overlay = overlayRef.current;
    let previousOffset: [number, number] | undefined;
    let previousPadding: ReturnType<typeof getRoutePadding> | undefined;

    const focusSelection = () => {
      if (stopCoordinates) {
        const offset = getCenterOffset(container, overlay, clearButtonRef.current);
        if (previousOffset?.[0] === offset[0] && previousOffset[1] === offset[1]) return;

        previousOffset = offset;

        map.easeTo({
          center: [stopCoordinates.longitude, stopCoordinates.latitude],
          offset,
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
        });

        return;
      }

      if (!routeBounds) return;

      const padding = getRoutePadding(container, overlay, clearButtonRef.current);
      if (
        previousPadding?.top === padding.top &&
        previousPadding.bottom === padding.bottom &&
        previousPadding.left === padding.left &&
        previousPadding.right === padding.right
      ) {
        return;
      }

      previousPadding = padding;

      map.fitBounds(routeBounds, { padding, maxZoom: 15 });
    };

    focusSelection();

    const observer = new ResizeObserver(focusSelection);
    observer.observe(container);
    if (overlay) observer.observe(overlay);

    return () => observer.disconnect();
  }, [
    clearButtonRef,
    containerRef,
    isMapReady,
    mapRef,
    overlayRef,
    selectedStopId,
    selectedRouteId,
  ]);
};

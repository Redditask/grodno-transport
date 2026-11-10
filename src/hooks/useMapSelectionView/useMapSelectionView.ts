import type { Map } from 'maplibre-gl';
import type { RefObject } from 'react';
import { useEffect } from 'react';

import { selectStopOnMap } from '@/components/CityMap/layers/stopLayers';

import { getCenterOffset } from './utils';

interface UseMapSelectionViewOptions {
  mapRef: RefObject<Map | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  clearButtonRef: RefObject<HTMLButtonElement | null>;
  selectedStopId?: string;
  isMapReady: boolean;
}

export const useMapSelectionView = ({
  mapRef,
  containerRef,
  overlayRef,
  clearButtonRef,
  selectedStopId,
  isMapReady,
}: UseMapSelectionViewOptions) => {
  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;

    if (!isMapReady || !map || !container) return;

    const coordinates = selectStopOnMap(map, selectedStopId);
    if (!coordinates) return;

    const overlay = overlayRef.current;
    let previousOffset: [number, number] | undefined;

    const centerStop = () => {
      const offset = getCenterOffset(container, overlay, clearButtonRef.current);
      if (previousOffset?.[0] === offset[0] && previousOffset[1] === offset[1]) return;

      previousOffset = offset;
      map.easeTo({
        center: [coordinates.longitude, coordinates.latitude],
        offset,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
      });
    };

    centerStop();

    const observer = new ResizeObserver(centerStop);
    observer.observe(container);
    if (overlay) observer.observe(overlay);

    return () => observer.disconnect();
  }, [clearButtonRef, containerRef, isMapReady, mapRef, overlayRef, selectedStopId]);
};

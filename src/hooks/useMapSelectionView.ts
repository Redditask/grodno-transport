import type { Map } from 'maplibre-gl';
import type { RefObject } from 'react';
import { useEffect } from 'react';

import { selectStopOnMap } from '@/components/CityMap/layers/stopLayers';
import { transportData } from '@/data/transportData';

interface UseMapSelectionViewOptions {
  mapRef: RefObject<Map | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  clearButtonRef: RefObject<HTMLButtonElement | null>;
  selectedStopId?: string;
  isMapReady: boolean;
}

const getCenterOffset = (
  container: HTMLElement,
  overlay: HTMLElement | null,
  clearButton: HTMLButtonElement | null,
): [number, number] => {
  if (!overlay) return [0, 0];

  const mapBounds = container.getBoundingClientRect();
  const overlayBounds = overlay.getBoundingClientRect();
  const coveredWidth = overlayBounds.right - mapBounds.left;
  const coveredHeight = overlayBounds.bottom - mapBounds.top;
  const markerClearance = 16;

  if (
    coveredWidth + markerClearance < mapBounds.width / 2 ||
    coveredHeight + markerClearance < mapBounds.height / 2
  ) {
    return [0, 0];
  }

  const bottomInset = clearButton ? mapBounds.bottom - clearButton.getBoundingClientRect().top : 0;
  const areaOnRight = (mapBounds.width - coveredWidth) * mapBounds.height;
  const areaBelow = (mapBounds.height - coveredHeight - bottomInset) * mapBounds.width;

  return areaOnRight > areaBelow ? [coveredWidth / 2, 0] : [0, (coveredHeight - bottomInset) / 2];
};

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

    selectStopOnMap(map, selectedStopId);

    const coordinates = transportData.stops.find(({ id }) => id === selectedStopId)?.coordinates;
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

import type { Map } from 'maplibre-gl';
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { useEffect, useRef, useState } from 'react';

import { applyBasemapColors } from '@/components/CityMap/layers/applyBasemapColors';
import { addRouteLayer } from '@/components/CityMap/layers/routeLayer';
import { addStopLayers } from '@/components/CityMap/layers/stopLayers';

type MapStatus = 'loading' | 'ready' | 'error';

export const useCityMap = (onSelectStop: (stopId: string) => void) => {
  const [status, setStatus] = useState<MapStatus>('loading');

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;

    const loadMap = async () => {
      try {
        const { Map, NavigationControl, Popup, setWorkerUrl } = await import('maplibre-gl');

        if (isDisposed) return;

        setWorkerUrl(mapWorkerUrl);

        const map = new Map({
          container,
          style: 'https://tiles.openfreemap.org/styles/positron',
          bounds: [
            [23.74, 53.615],
            [23.935, 53.735],
          ],
          fitBoundsOptions: {
            padding: { top: 78, right: 18, bottom: 28, left: 18 },
          },
          maxBounds: [
            [23.51, 53.47],
            [24.15, 53.88],
          ],
          minZoom: 9,
          maxZoom: 19,
          maxPitch: 0,
          dragRotate: false,
          touchPitch: false,
          attributionControl: { compact: false },
          locale: {
            'Map.Title': 'Карта Гродно',
            'NavigationControl.ZoomIn': 'Приблизить карту',
            'NavigationControl.ZoomOut': 'Отдалить карту',
          },
        });

        mapRef.current = map;
        map.touchZoomRotate.disableRotation();
        map.keyboard.disableRotation();
        map.addControl(new NavigationControl({ showCompass: false }), 'bottom-left');

        map.once('load', () => {
          applyBasemapColors(map);

          const stopTooltip = new Popup({
            className: 'map-stop-tooltip',
            closeButton: false,
            closeOnClick: false,
            closeOnMove: true,
            focusAfterOpen: false,
            offset: 12,
          });

          addRouteLayer(map);
          addStopLayers(map, onSelectStop, stopTooltip);

          setStatus('ready');
        });
        map.on('error', () => setStatus((current) => (current === 'loading' ? 'error' : current)));
      } catch {
        if (!isDisposed) setStatus('error');
      }
    };

    void loadMap();

    return () => {
      isDisposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onSelectStop]);

  return { containerRef, mapRef, status };
};

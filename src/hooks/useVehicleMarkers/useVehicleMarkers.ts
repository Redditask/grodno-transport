import type { Map as LibreMap } from 'maplibre-gl';
import type { RefObject } from 'react';
import { useEffect, useEffectEvent, useRef } from 'react';

import type { createVehicleLayer } from '@/components/CityMap/layers/vehicleLayer';

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
  // Выбор может поменяться, пока карта работает. Через ref проверяем видимость без пересоздания слоя.
  const syncVisibilityRef = useRef<(() => void) | undefined>(undefined);
  const getSelection = useEffectEvent(() => ({ selectedRouteId, selectedStopId }));

  useEffect(() => {
    const map = mapRef.current;
    if (!isMapReady || !map) return;

    let isDisposed = false;
    let isLoading = false;
    let wasVisible = false;
    let animationFrame: number | undefined;
    let lastUpdate = -Infinity;
    let layer: ReturnType<typeof createVehicleLayer> | undefined;

    // Просим браузер вызвать нас в следующем кадре, но пересчитываем метки примерно раз в 100 мс.
    const animate = (timestamp: number) => {
      animationFrame = requestAnimationFrame(animate);
      if (timestamp - lastUpdate < updateInterval) return;

      lastUpdate = timestamp;
      const { selectedRouteId, selectedStopId } = getSelection();
      layer?.update(selectedRouteId, selectedStopId);
    };

    const stopAnimation = () => {
      if (animationFrame === undefined) return;

      cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
      lastUpdate = -Infinity;
      layer?.clear();
    };

    const syncVisibility = () => {
      const { selectedRouteId, selectedStopId } = getSelection();
      const isVisible =
        !document.hidden &&
        Boolean(selectedRouteId || selectedStopId || map.getZoom() >= minOverviewZoom);

      // События масштаба приходят часто. Запускаем или останавливаем цикл только при смене видимости.
      if (isVisible === wasVisible) return;
      wasVisible = isVisible;

      if (!isVisible) {
        stopAnimation();
        return;
      }

      if (layer) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      if (isLoading) return;
      isLoading = true;

      // Подготовка расписаний начинается только тогда, когда транспорт нужен на экране.
      void import('@/components/CityMap/layers/vehicleLayer')
        .then(({ createVehicleLayer }) => {
          // Пока импорт загружался, карту могли закрыть, а метки могли стать не нужны.
          if (isDisposed) return;

          layer = createVehicleLayer(map, onSelectRoute);
          if (wasVisible) animationFrame = requestAnimationFrame(animate);
        })
        .catch((error: unknown) => {
          console.error('Не удалось загрузить движение транспорта.', error);
        })
        .finally(() => {
          isLoading = false;
        });
    };

    syncVisibilityRef.current = syncVisibility;
    map.on('zoom', syncVisibility);
    document.addEventListener('visibilitychange', syncVisibility);
    syncVisibility();

    // Снимаем подписки и отменяем кадр, когда карта или эффект завершают работу.
    return () => {
      isDisposed = true;
      syncVisibilityRef.current = undefined;
      document.removeEventListener('visibilitychange', syncVisibility);
      map.off('zoom', syncVisibility);
      stopAnimation();
    };
  }, [isMapReady, mapRef, onSelectRoute]);

  useEffect(() => {
    syncVisibilityRef.current?.();
  }, [selectedRouteId, selectedStopId]);
};

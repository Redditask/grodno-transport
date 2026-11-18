import type { Map } from 'maplibre-gl';

// Идентификаторы слоёв из стиля Positron сервиса OpenFreeMap.
const basemapColors = [
  { layerId: 'water', property: 'fill-color', color: '#78bde0' },
  { layerId: 'waterway', property: 'line-color', color: '#78bde0' },
  { layerId: 'park', property: 'fill-color', color: '#cee5b4' },
  { layerId: 'landcover_wood', property: 'fill-color', color: '#bdd8a7' },
] as const;

export const applyBasemapColors = (map: Map) => {
  for (const { layerId, property, color } of basemapColors) {
    if (map.getLayer(layerId)) map.setPaintProperty(layerId, property, color);
  }
};

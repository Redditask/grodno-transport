import type { Page } from '@playwright/test';

const basemapStyle = 'https://tiles.openfreemap.org/styles/positron';

export const stubBasemap = (page: Page) =>
  // Оставляем настоящие слои и события MapLibre, убираем только сетевую подложку.
  page.route(basemapStyle, (route) =>
    route.fulfill({
      headers: { 'access-control-allow-origin': '*' },
      json: { version: 8, sources: {}, layers: [] },
    }),
  );

export const failBasemap = (page: Page) => page.route(basemapStyle, (route) => route.abort());

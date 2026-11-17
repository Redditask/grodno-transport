import { expect, test } from '@playwright/test';

import { stubBasemap } from './basemap';

test('vehicles move on the map, follow selection, and open their direction', async ({ page }) => {
  const now = new Date('2026-11-11T06:58:00+03:00');

  await page.clock.setFixedTime(now);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 850 });
  await stubBasemap(page);
  await page.goto('/');

  const map = page.getByRole('region', { name: 'Карта Гродно' });
  const search = page.getByRole('region', { name: 'Поиск транспорта и остановок' });
  const outbound = map.getByRole('button', {
    name: 'Автобус №17 · Средняя школа №3 → Грандичи-24',
    exact: true,
  });
  const inbound = map.getByRole('button', {
    name: 'Автобус №17 · Грандичи-24 → Средняя школа №3',
    exact: true,
  });
  const trolleybuses = map.getByRole('button', { name: /^Троллейбус №1 ·/ });

  // Выбираем направление и видим сразу все пять активных автобусов.
  await search.getByRole('searchbox').fill('17');
  await search
    .getByRole('button', { name: 'Автобус №17 Средняя школа №3 → Грандичи-24', exact: true })
    .click();

  await expect(outbound).toHaveCount(5);
  await expect(inbound).toHaveCount(0);
  await expect(trolleybuses).toHaveCount(0);
  await expect(outbound.first()).toBeInViewport();

  // Через 30 секунд та же метка смещается вдоль дороги.
  const routeHeading = search.getByRole('heading', { name: 'Средняя школа №3 → Грандичи-24' });

  await expect(routeHeading).toBeVisible();

  const firstMarker = outbound.first();
  const start = await firstMarker.boundingBox();
  await page.clock.setFixedTime(new Date(now.getTime() + 30_000));

  await expect
    .poll(async () => {
      const current = await firstMarker.boundingBox();
      if (!current || !start) return 0;
      return Math.hypot(current.x - start.x, current.y - start.y);
    })
    .toBeGreaterThan(1);

  await search.getByRole('button', { name: 'Сменить направление' }).click();

  await expect(outbound).toHaveCount(0);
  await expect(inbound).toHaveCount(2);

  // Троллейбус можно открыть с карты после приближения общего вида.
  await map.getByRole('button', { name: 'Отменить выбор' }).click();
  const zoomIn = map.getByRole('button', { name: 'Приблизить карту' });
  for (let step = 0; step < 3; step++) {
    await zoomIn.click();
  }

  await expect(trolleybuses).toHaveCount(2);

  const visibleTrolleybus = trolleybuses.first();
  await visibleTrolleybus.focus();

  await expect(
    map.getByText('Троллейбус №1 · Фолюш → Улица Победоносная', { exact: true }),
  ).toBeVisible();

  await visibleTrolleybus.press('Enter');

  await expect(search.getByRole('heading', { name: 'Фолюш → Улица Победоносная' })).toBeVisible();
  await expect(trolleybuses).toHaveCount(2);
  await expect(inbound).toHaveCount(0);
});

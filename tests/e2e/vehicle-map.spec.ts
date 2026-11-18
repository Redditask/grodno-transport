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

  // После приближения можно открыть направление машины прямо с карты.
  await map.getByRole('button', { name: 'Отменить выбор' }).click();
  const vehicles = map.getByRole('button', { name: /^(Автобус|Троллейбус) №.+ · / });
  const zoomIn = map.getByRole('button', { name: 'Приблизить карту' });
  for (let step = 0; step < 3; step++) {
    await zoomIn.click();
  }

  const vehicle = vehicles.first();
  await expect(vehicle).toBeAttached();
  const label = await vehicle.getAttribute('aria-label');
  if (!label) throw new Error('Vehicle label is missing');

  await vehicle.focus();
  await expect(map.getByText(label, { exact: true })).toBeVisible();

  await vehicle.press('Enter');

  const direction = label.split(' · ')[1];
  await expect(search.getByRole('heading', { name: direction, exact: true })).toBeVisible();
  await expect
    .poll(async () => [
      ...new Set(
        await vehicles.evaluateAll((buttons) =>
          buttons.map((button) => button.getAttribute('aria-label')),
        ),
      ),
    ])
    .toEqual([label]);
});

test('loads the vehicle layer on demand and shows routes outside the original pilot', async ({
  page,
}) => {
  const layerRequests: string[] = [];
  page.on('request', (request) => {
    if (/\/vehicleLayer(?:-[^/]+)?\.(?:js|ts)$/.test(new URL(request.url()).pathname)) {
      layerRequests.push(request.url());
    }
  });

  await page.clock.setFixedTime(new Date('2026-11-11T07:54:00+03:00'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await stubBasemap(page);
  await page.goto('/');

  const map = page.getByRole('region', { name: 'Карта Гродно' });
  const search = page.getByRole('region', { name: 'Поиск транспорта и остановок' });
  const buses = map.getByRole('button', {
    name: 'Автобус №34 · Вишневец → Гроднозеленстрой',
    exact: true,
  });

  // Общий план и поиск доступны до загрузки кода движения.
  await expect(map.getByRole('status')).toBeHidden();
  await search.getByRole('searchbox').fill('34');
  const route = search.getByRole('button', {
    name: 'Автобус №34 Вишневец → Гроднозеленстрой',
    exact: true,
  });
  await expect(route).toBeVisible();
  expect(layerRequests).toHaveLength(0);

  // Открываем направление, которого не было в пилоте, и видим движение на карте.
  await route.click();
  await expect(buses.first()).toBeInViewport();
  expect(layerRequests).toHaveLength(1);

  // Возвращаемся к общему плану ниже заданного масштаба, где машины скрыты.
  await map.getByRole('button', { name: 'Отменить выбор' }).click();
  await expect(map.getByRole('button', { name: /^(Автобус|Троллейбус) №.+ · / })).toHaveCount(0);
});

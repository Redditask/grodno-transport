import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { failBasemap, stubBasemap } from './basemap';

const readStopMarker = async (page: Page, startY: number) => {
  const screenshot = await page.screenshot();

  return page.evaluate(
    async ({ imageUrl, startY }) => {
      // Метки нарисованы в WebGL и не имеют DOM-узлов. Ищем их по цвету на снимке.
      const image = new Image();
      image.src = imageUrl;
      await image.decode();

      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Unable to read the map screenshot');

      context.drawImage(image, 0, 0);
      const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-stop')
        .trim();
      const rgb = [1, 3, 5].map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16));

      const isMarkerPixel = (x: number, y: number) => {
        const pixel = (y * width + x) * 4;
        return rgb.every((channel, index) => Math.abs(channel - data[pixel + index]) <= 3);
      };

      // Берём точку внутри кружка, справа от панели поиска.
      for (let y = startY; y < height - 90; y++) {
        for (let x = Math.floor(width / 2) + 1; x < width - 8; x++) {
          if (
            isMarkerPixel(x, y) &&
            isMarkerPixel(x - 2, y) &&
            isMarkerPixel(x + 2, y) &&
            isMarkerPixel(x, y - 2) &&
            isMarkerPixel(x, y + 2)
          ) {
            return { x, y };
          }
        }
      }
    },
    { imageUrl: `data:image/png;base64,${screenshot.toString('base64')}`, startY },
  );
};

test('opens another map stop after clearing the selection', async ({ page }) => {
  // Проверяем мышь на широком экране, где панель не перекрывает выбранную точку.
  await page.setViewportSize({ width: 1100, height: 760 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-11-22T02:00:00+03:00'));
  await stubBasemap(page);
  await page.goto('/');

  const map = page.getByRole('region', { name: 'Карта Гродно' });
  const search = page.getByRole('region', { name: 'Поиск транспорта и остановок' });
  const tooltip = map.locator('.map-stop-tooltip');
  const clearSelection = map.getByRole('button', { name: 'Отменить выбор' });

  const openStop = async (startY: number) => {
    let point: Awaited<ReturnType<typeof readStopMarker>>;
    await expect(async () => {
      point = await readStopMarker(page, startY);
      expect(point).toBeDefined();
    }).toPass({ timeout: 10_000 });

    if (!point) throw new Error('No clickable map marker was found');

    await page.mouse.move(point.x, point.y);
    await expect(tooltip).toBeVisible();
    const name = (await tooltip.innerText()).trim();
    expect(name).not.toBe('');

    await page.mouse.click(point.x, point.y);
    const heading = search.getByRole('heading', { name, exact: true });
    await expect(heading).toBeVisible();
    return { heading, name };
  };

  const firstStop = await openStop(80);
  await expect(clearSelection).toBeVisible();

  await clearSelection.click();
  await expect(firstStop.heading).toBeHidden();
  await expect(clearSelection).toBeHidden();

  const zoomOut = map.getByRole('button', { name: 'Отдалить карту' });
  await zoomOut.click();
  await zoomOut.click();

  // После приближения первая остановка в центре. Ищем следующую в нижней части карты.
  const secondStop = await openStop(480);
  expect(secondStop.name).not.toBe(firstStop.name);
});

test('a basemap load failure is reported without disabling transport search', async ({ page }) => {
  // Имитируем недоступность сервера карты и ждём понятного сообщения об ошибке.
  await failBasemap(page);
  await page.goto('/');

  const map = page.getByRole('region', { name: 'Карта Гродно' });
  await expect(map.getByRole('status')).toHaveText('Не удалось загрузить карту.');

  // Поиск питается локальными данными и продолжает работать без карты.
  const search = page.getByRole('region', { name: 'Поиск транспорта и остановок' });
  await search.getByRole('searchbox').fill('1');
  await expect(
    search.getByRole('button', { name: 'Автобус №1 Механический завод → Вишневец', exact: true }),
  ).toBeVisible();
});

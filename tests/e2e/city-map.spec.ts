import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { failBasemap, stubBasemap } from './basemap';

const readStopMarkers = async (page: Page) => {
  const screenshot = await page.screenshot();

  return page.evaluate(
    async (imageUrl) => {
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

      let pixels = 0;
      let point: { x: number; y: number } | undefined;

      // Считаем площадь меток и выбираем точку внутри кружка, справа от панели поиска.
      for (let y = 80; y < height - 90; y++) {
        for (let x = 8; x < width - 8; x++) {
          if (!isMarkerPixel(x, y)) continue;

          pixels++;
          if (
            !point &&
            x > width / 2 &&
            isMarkerPixel(x - 2, y) &&
            isMarkerPixel(x + 2, y) &&
            isMarkerPixel(x, y - 2) &&
            isMarkerPixel(x, y + 2)
          ) {
            point = { x, y };
          }
        }
      }

      return { pixels, point };
    },
    `data:image/png;base64,${screenshot.toString('base64')}`,
  );
};

test('hovering and clicking a map marker opens the stop, and clearing restores markers', async ({
  page,
}) => {
  // Проверяем мышь на широком экране, где панель не перекрывает выбранную точку.
  await page.setViewportSize({ width: 1100, height: 760 });
  await stubBasemap(page);
  await page.goto('/');

  const map = page.getByRole('region', { name: 'Карта Гродно' });
  const search = page.getByRole('region', { name: 'Поиск транспорта и остановок' });
  const tooltip = map.locator('.maplibregl-popup-content');
  const clearSelection = map.getByRole('button', { name: 'Отменить выбор' });

  let initialMarkers: Awaited<ReturnType<typeof readStopMarkers>> | undefined;
  await expect(async () => {
    initialMarkers = await readStopMarkers(page);
    expect(initialMarkers.point).toBeDefined();
  }).toPass({ timeout: 10_000 });

  const { point, pixels: initialPixels } = initialMarkers!;
  if (!point) throw new Error('No clickable map marker was found');

  // Наводим курсор на кружок и проверяем, что клик открывает ту же остановку.
  await page.mouse.move(point.x, point.y);
  await expect(tooltip).toBeVisible();
  const stopName = (await tooltip.innerText()).trim();
  expect(stopName).not.toBe('');

  await page.mouse.click(point.x, point.y);
  const stopHeading = search.getByRole('heading', { name: stopName, exact: true });
  await expect(stopHeading).toBeVisible();
  await expect(clearSelection).toBeVisible();

  // После выбора остаётся одна метка, после отмены снова видно много меток.
  await expect
    .poll(async () => (await readStopMarkers(page)).pixels)
    .toBeLessThan(initialPixels / 4);

  await clearSelection.click();
  await expect(stopHeading).toBeHidden();
  await expect(clearSelection).toBeHidden();
  await expect
    .poll(async () => (await readStopMarkers(page)).pixels)
    .toBeGreaterThan(initialPixels / 4);
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

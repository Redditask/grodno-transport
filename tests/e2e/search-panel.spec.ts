import { expect, test } from '@playwright/test';

import { stubBasemap } from './basemap';

test.beforeEach(async ({ page }) => {
  // Изолируем сценарии панели от загрузки внешней карты.
  await stubBasemap(page);
  await page.goto('/');
});

test('expands more results and keeps them when the mobile panel is collapsed', async ({ page }) => {
  const panel = page.getByRole('region', { name: 'Поиск транспорта и остановок' });
  const searchbox = panel.getByRole('searchbox');

  // Запрос даёт больше первой порции результатов, поэтому можно проверить дозагрузку списка.
  await searchbox.fill('улица');
  const stops = panel.getByRole('region', { name: 'Остановки' });
  const results = stops.getByRole('listitem');
  await expect(results).toHaveCount(10);

  await stops.getByRole('button', { name: 'Показать ещё остановки' }).click();
  await expect(results).toHaveCount(20);

  // Сворачивание скрывает результаты, но сохраняет запрос и уже открытые строки.
  await panel.getByRole('button', { name: 'Свернуть панель поиска', expanded: true }).click();
  await expect(stops).toBeHidden();
  await expect(searchbox).toHaveValue('улица');

  await panel.getByRole('button', { name: 'Развернуть панель поиска', expanded: false }).click();
  await expect(stops).toBeVisible();
  await expect(results).toHaveCount(20);
});

test('distinguishes an empty search from a query without matches', async ({ page }) => {
  const panel = page.getByRole('region', { name: 'Поиск транспорта и остановок' });
  const searchbox = panel.getByRole('searchbox');

  // До ввода панель показывает только поле поиска. Сообщение появляется после запроса.
  await expect(searchbox).toHaveValue('');
  await expect(panel.getByRole('status')).toHaveCount(0);

  await searchbox.fill('несуществующая остановка');
  await expect(panel.getByRole('status')).toHaveText(
    'Ничего не найдено. Попробуйте другое название или номер.',
  );
  await expect(panel.getByRole('list')).toHaveCount(0);

  // Очистка возвращает начальное состояние и фокус для нового запроса.
  await panel.getByRole('button', { name: 'Очистить поиск' }).click();
  await expect(searchbox).toHaveValue('');
  await expect(searchbox).toBeFocused();
  await expect(panel.getByRole('status')).toHaveCount(0);
});

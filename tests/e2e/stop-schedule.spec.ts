import { expect, test } from '@playwright/test';

import { stubBasemap } from './basemap';

const stopName = 'Улица Якубовского';
const towardsLane = 'В сторону «пер. Фолюш»';
const towardsStreet = 'В сторону «улица Фолюш»';

test.beforeEach(async ({ page }) => {
  // Фиксируем будний день и минское время для всех проверок отправлений.
  await page.clock.setFixedTime(new Date('2026-11-11T06:00:00+03:00'));

  // Убираем внешнюю подложку карты, чтобы тесты не зависели от сети.
  await stubBasemap(page);

  await page.goto('/');
});

test('opens a stop schedule, switches to weekends and restores route focus', async ({ page }) => {
  const panel = page.getByRole('region', { name: 'Поиск транспорта и остановок' });
  await panel.getByRole('searchbox').fill(stopName);
  await panel
    .getByRole('button', { name: `Остановка ${stopName} ${towardsLane}`, exact: true })
    .click();

  // Открываем расписание выбранного автобуса через остановку.
  const bus = panel.getByRole('button', { name: /^Автобус №3\b/ });
  await bus.click();

  await expect(panel.getByRole('heading', { name: 'Все отправления' })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Будни', pressed: true })).toBeVisible();
  await expect(panel.locator('time[datetime="06:01"]')).toBeVisible();

  // Из расписания остановки открываем то же направление и возвращаемся обратно.
  const openRoute = panel.getByRole('button', { name: 'К маршруту' });
  await openRoute.click();
  await expect(
    panel.getByRole('heading', { name: 'Улица Фолюш → Железнодорожный вокзал', exact: true }),
  ).toBeVisible();
  await expect(panel.getByRole('button', { name: /^Улица Якубовского/ })).toBeVisible();

  await panel.getByRole('button', { name: 'К расписанию' }).click();
  await expect(panel.locator('time[datetime="06:01"]')).toBeVisible();
  await expect(openRoute).toBeFocused();

  // Переключаем день и убеждаемся, что время из буднего расписания исчезло.
  await panel.getByRole('button', { name: 'Выходные' }).click();
  await expect(panel.getByRole('button', { name: 'Выходные', pressed: true })).toBeVisible();
  await expect(panel.locator('time[datetime="05:26"]')).toBeVisible();
  await expect(panel.locator('time[datetime="06:01"]')).toHaveCount(0);

  // Escape в панели возвращает на остановку и восстанавливает фокус на строке автобуса.
  await page.keyboard.press('Escape');
  await expect(bus).toBeFocused();

  // Номер в компактном списке открывает то же расписание и получает фокус при возврате.
  const shortcut = panel
    .getByRole('list', { name: 'Автобусы' })
    .getByRole('button', { name: /^Расписание\. Автобус №3\b/ });
  await shortcut.click();
  await expect(panel.locator('time[datetime="06:01"]')).toBeVisible();

  const map = page.getByRole('region', { name: 'Карта Гродно' });
  const clearSelection = map.getByRole('button', { name: 'Отменить выбор' });

  // При фокусе на карте первый Escape закрывает расписание, второй отменяет выбор.
  await clearSelection.press('Escape');
  await expect(shortcut).toBeFocused();
  await expect(clearSelection).toBeVisible();

  await clearSelection.press('Escape');
  await expect(clearSelection).toBeHidden();
  await expect(
    panel.getByRole('button', { name: `Остановка ${stopName} ${towardsLane}`, exact: true }),
  ).toBeVisible();
});

test('switches to the opposite platform and returns directly to search results', async ({
  page,
}) => {
  const panel = page.getByRole('region', { name: 'Поиск транспорта и остановок' });
  await panel.getByRole('searchbox').fill(stopName);
  // Из одноимённых площадок выбираем нужную по подписи направления.
  const platform = panel.getByRole('button', {
    name: `Остановка ${stopName} ${towardsLane}`,
    exact: true,
  });
  await platform.click();

  await panel.getByRole('button', { name: 'Сменить направление' }).click();
  await expect(panel.getByText(towardsStreet, { exact: true })).toBeVisible();

  // Смена площадки заменяет экран: один шаг назад ведёт сразу к результатам.
  await panel.getByRole('button', { name: 'К результатам' }).click();
  await expect(platform).toBeVisible();
});

test('opens a timetable from a route and returns to its stop list', async ({ page }) => {
  const panel = page.getByRole('region', { name: 'Поиск транспорта и остановок' });
  // Выбираем направление автобуса по его номеру и конечным остановкам.
  const direction = 'Механический завод → Вишневец';
  await panel.getByRole('searchbox').fill('1');
  await panel.getByRole('button', { name: `Автобус №1 ${direction}`, exact: true }).click();

  await expect(panel.getByRole('heading', { name: direction, exact: true })).toBeVisible();
  const stop = panel.getByRole('button', { name: /^Улица Карского/ });
  await stop.click();

  await expect(panel.getByRole('heading', { name: 'Улица Карского', exact: true })).toBeVisible();
  await expect(panel.getByRole('heading', { name: direction, exact: true })).toBeVisible();
  // Сверяем конкретное время, чтобы поймать расписание от другого направления.
  await expect(panel.locator('time[datetime="07:10"]')).toBeVisible();

  // Из расписания маршрута открываем площадку с её списком транспорта.
  const openStop = panel.getByRole('button', { name: 'К остановке' });
  await openStop.click();
  await expect(panel.getByRole('heading', { name: 'Улица Карского', exact: true })).toBeVisible();
  await expect(panel.getByRole('button', { name: /^Автобус №1\b/ })).toBeVisible();

  await panel.getByRole('button', { name: 'К расписанию' }).click();
  await expect(panel.locator('time[datetime="07:10"]')).toBeVisible();
  await expect(openStop).toBeFocused();

  // Возвращаемся на ту же остановку списка и проверяем обратное направление.
  await page.keyboard.press('Escape');
  await expect(stop).toBeFocused();

  await panel.getByRole('button', { name: 'Сменить направление' }).click();
  await expect(
    panel.getByRole('heading', { name: 'Вишневец → Механический завод', exact: true }),
  ).toBeVisible();

  await stop.click();
  const clearSelection = page
    .getByRole('region', { name: 'Карта Гродно' })
    .getByRole('button', { name: 'Отменить выбор' });
  await clearSelection.click();
  await expect(clearSelection).toBeHidden();
  await expect(
    panel.getByRole('button', { name: `Автобус №1 ${direction}`, exact: true }),
  ).toBeVisible();
});

test('shows an empty weekend timetable for a weekday-only route', async ({ page }) => {
  const panel = page.getByRole('region', { name: 'Поиск транспорта и остановок' });

  // У этого направления автобуса №12 есть отправления в будни, но нет в выходные.
  await panel.getByRole('searchbox').fill('автобус 12');
  await panel
    .getByRole('button', { name: 'Автобус №12 Улица Молодежная → Улица Одельская', exact: true })
    .click();
  await panel.getByRole('button', { name: /^Улица Молодежная/ }).click();
  await expect(panel.locator('time').first()).toBeVisible();

  // При смене вкладки прежние времена исчезают, а панель объясняет, почему список пуст.
  await panel.getByRole('button', { name: 'Выходные' }).click();
  await expect(panel.getByText('В выбранный день рейсов нет.')).toBeVisible();
  await expect(panel.locator('time')).toHaveCount(0);
});

test('opens either direction of a repeated route number', async ({ page }) => {
  const panel = page.getByRole('region', { name: 'Поиск транспорта и остановок' });
  await panel.getByRole('searchbox').fill('Областная филармония');
  await panel.getByRole('button', { name: 'Остановка Областная филармония', exact: true }).click();

  // Компактные кнопки связаны с конечными в подписи под номерами.
  const shortcuts = panel
    .getByRole('list', { name: 'Автобусы' })
    .getByRole('button', { name: /^Расписание\. Автобус №39\b/ });
  await expect(shortcuts).toHaveText(['391', '392']);
  const directions = panel.getByRole('list', { name: 'Направления', exact: true });
  await expect(directions).toBeHidden();
  await panel.getByText('Направления', { exact: true }).click();
  await expect(directions).toBeVisible();
  await expect(directions.getByRole('listitem')).toHaveText([
    '391 → Рынок Южный',
    '392 → Областная филармония',
  ]);

  // Проверяем, что обе кнопки ведут в расписания разных направлений.
  await shortcuts.nth(0).click();
  await expect(
    panel.getByRole('heading', { name: 'Областная филармония → Рынок Южный', exact: true }),
  ).toBeVisible();
  await panel.getByRole('button', { name: 'К другим маршрутам' }).click();
  await expect(shortcuts.nth(0)).toBeFocused();

  await shortcuts.nth(1).click();
  await expect(
    panel.getByRole('heading', { name: 'Рынок Южный → Областная филармония', exact: true }),
  ).toBeVisible();
});

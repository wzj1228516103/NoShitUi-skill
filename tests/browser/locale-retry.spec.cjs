const { test, expect, noOverflow } = require('./fixtures.cjs');
const chinese = require('../../ui-atlas-demo/locales/zh-CN.json').ui;

const localeRequest = (request, locale) => new URL(request.url()).pathname.endsWith(`/locales/${locale}.json`);
const realBundle = (page, locale) => page.waitForResponse(response => localeRequest(response.request(), locale) && response.status() === 200);

async function view(page, { language = 'en', q = 'workflow', category = 'creative' } = {}) {
  await expect(page.locator('html')).toHaveAttribute('data-locale', language);
  await expect(page.locator('#language-select')).toHaveValue(language);
  await expect(page.locator('#project-search')).toHaveValue(q);
  await expect(page.locator(`[data-filter="${category}"]`)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#project-grid .card:not([hidden])')).toHaveCount(1);
  await expect(page.locator('#project-grid .card:not([hidden])')).toHaveAttribute('data-project', 'node');
  const url = new URL(page.url());
  expect(url.searchParams.get('lang')).toBe(language);
  expect(url.searchParams.get('q')).toBe(q);
  expect(url.searchParams.get('category')).toBe(category === 'all' ? null : category);
  expect(url.searchParams.get('ref')).toBe('retry');
  expect(url.hash).toBe('#examples');
}

async function holdLocale(page, locale) {
  let release;
  let enter;
  const held = new Promise(resolve => { release = resolve; });
  const requested = new Promise(resolve => { enter = resolve; });
  const pattern = `**/locales/${locale}.json?*`;
  let requests = 0;
  const handler = async route => {
    requests++;
    enter();
    await held;
    await route.continue(); // Resume the real local JSON, including after cancellation.
  };
  await page.route(pattern, handler);
  return { requested, release, count: () => requests, remove: () => page.unroute(pattern, handler) };
}

test('locale retry: initial English failure retries the same language without reload and preserves keyboard focus', async ({ page }) => {
  const pattern = '**/locales/en.json?*';
  const fail = route => route.abort('failed');
  let requests = 0;
  page.on('request', request => { if (localeRequest(request, 'en')) requests++; });
  await page.route(pattern, fail);
  await page.goto('/showcase.html?lang=en&q=workflow&category=creative&ref=retry#examples');
  const retry = page.locator('#retry-language');
  await expect(page.locator('#language-status')).toBeVisible();
  await expect(retry).toHaveText('Retry English');
  await expect(retry).toBeEnabled();
  await expect(page.locator('#language-select')).toHaveValue('en');
  await retry.focus();
  await retry.press('Enter'); // A second failure keeps the direct retry path usable.
  await expect.poll(() => requests).toBe(2);
  await expect(retry).toBeEnabled();
  await expect(retry).toBeFocused();
  await page.unroute(pattern, fail);
  const restored = realBundle(page, 'en');
  await retry.press('Enter');
  await restored;
  await view(page);
  await expect(retry).toBeHidden();
  await expect(page.locator('#language-status')).toBeHidden();
  await expect(page.locator('#language-select')).toBeFocused();
  expect(requests).toBe(3);
  expect(await page.evaluate(() => localStorage.getItem('noshitui-language'))).toBe('en');
  await noOverflow(page);
});

test('locale retry: Japanese failure survives a successful English fallback and retries real Japanese JSON', async ({ page }) => {
  const pattern = '**/locales/ja.json?*';
  const fail = route => route.abort('failed');
  await page.route(pattern, fail);
  await page.goto('/showcase.html?lang=ja&q=workflow&category=creative&ref=retry#examples');
  await view(page);
  const retry = page.locator('#retry-language');
  await expect(retry).toHaveText('Retry 日本語');
  await expect(page.locator('#language-status')).toBeVisible();
  await page.unroute(pattern, fail);
  const slow = await holdLocale(page, 'ja');
  const restored = realBundle(page, 'ja');
  try {
    await retry.click();
    await slow.requested;
    await expect(retry).toBeDisabled();
    await expect(retry).toHaveText('Loading 日本語…');
    await page.evaluate(() => document.getElementById('retry-language').click());
    expect(slow.count()).toBe(1); // Native disabled semantics prevent another attempt.
    await page.locator('#project-search').fill('node');
    await expect(page.locator('#project-search')).toBeFocused();
  } finally {
    slow.release();
  }
  await restored;
  await view(page, { language: 'ja', q: 'node' });
  await expect(page.locator('#project-search')).toBeFocused();
  await expect(retry).toBeHidden();
  await expect(page.locator('#language-status')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('noshitui-language'))).toBe('ja');
  await slow.remove();
  await noOverflow(page);
});

test('locale retry: when the preferred locale and English fallback fail, English can recover directly', async ({ page }) => {
  const fail = route => route.abort('failed');
  await page.route('**/locales/ja.json?*', fail);
  await page.route('**/locales/en.json?*', fail);
  await page.goto('/showcase.html?lang=ja&q=workflow&category=creative&ref=retry#examples');
  const retry = page.locator('#retry-language');
  await expect(retry).toHaveText('Retry English');
  await expect(page.locator('#language-status')).toBeVisible();
  await page.unroute('**/locales/en.json?*', fail);
  const restored = realBundle(page, 'en');
  await retry.click();
  await restored;
  await view(page);
  await expect(retry).toBeHidden();
  await expect(page.locator('#language-status')).toBeHidden();
});

test('locale retry: a newer language choice cancels a localized slow retry without stealing focus', async ({ page }) => {
  const pattern = '**/locales/ja.json?*';
  const fail = route => route.abort('failed');
  await page.goto('/showcase.html?lang=zh-CN&q=workflow&category=creative&ref=retry#examples', { waitUntil: 'domcontentloaded' });
  await view(page, { language: 'zh-CN' });
  await page.route(pattern, fail);
  const picker = page.locator('#language-select');
  await picker.selectOption('ja');
  const retry = page.locator('#retry-language');
  await expect(retry).toHaveText(chinese.retryLanguage.replace('{language}', '日本語'));
  await page.unroute(pattern, fail);
  const slow = await holdLocale(page, 'ja');
  const aborted = page.waitForEvent('requestfailed', { predicate: request => localeRequest(request, 'ja') });
  try {
    await retry.click();
    await slow.requested;
    await expect(retry).toBeDisabled();
    await expect(retry).toHaveText(chinese.loadingLanguage.replace('{language}', '日本語'));
    await picker.focus();
    // Returning to the currently displayed language must also cancel retry.
    await picker.selectOption('zh-CN');
    await view(page, { language: 'zh-CN' });
    await expect(picker).toBeFocused();
    await expect(retry).toBeHidden();
  } finally {
    slow.release();
  }
  expect((await aborted).failure().errorText).toMatch(/abort/i);
  await slow.remove();
  await view(page, { language: 'zh-CN' });
  await expect(page.locator('#language-status')).toBeHidden();
  await expect(retry).toBeHidden();
  await expect(picker).toBeFocused();
  expect(await page.evaluate(() => localStorage.getItem('noshitui-language'))).toBe('zh-CN');
  await noOverflow(page);
});

test('locale retry: Back cancels a slow retry and restores the previous filters without a stale language write', async ({ page }) => {
  await page.goto('/showcase.html?lang=en&q=workflow&ref=retry#examples');
  await view(page, { category: 'all' });
  await page.locator('[data-filter="creative"]').click();
  await page.locator('#project-search').fill('node');
  const pattern = '**/locales/ja.json?*';
  const fail = route => route.abort('failed');
  await page.route(pattern, fail);
  await page.locator('#language-select').selectOption('ja');
  const retry = page.locator('#retry-language');
  await expect(retry).toHaveText('Retry 日本語');
  await page.unroute(pattern, fail);
  const slow = await holdLocale(page, 'ja');
  const aborted = page.waitForEvent('requestfailed', { predicate: request => localeRequest(request, 'ja') });
  try {
    await retry.click();
    await slow.requested;
    await expect(retry).toBeDisabled();
    await page.locator('#project-search').focus();
    await page.goBack();
    await view(page, { category: 'all' });
    // Native fragment history may move focus itself; the app must not send it
    // to the picker. A newer focus choice must also survive the stale response.
    await expect(page.locator('#language-select')).not.toBeFocused();
    await expect(retry).toBeHidden();
    await page.locator('#project-search').focus();
  } finally {
    slow.release();
  }
  expect((await aborted).failure().errorText).toMatch(/abort/i);
  await slow.remove();
  await view(page, { category: 'all' });
  await expect(page.locator('#language-status')).toBeHidden();
  await expect(retry).toBeHidden();
  await expect(page.locator('#project-search')).toBeFocused();
  expect(await page.evaluate(() => localStorage.getItem('noshitui-language'))).toBeNull();
  await noOverflow(page);
});

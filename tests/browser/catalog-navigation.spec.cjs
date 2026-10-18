const { test, expect, noOverflow } = require('./fixtures.cjs');

const visibleCards = page => page.locator('#project-grid .card:not([hidden])');
const filter = (page, category) => page.locator(`[data-filter="${category}"]`);

async function catalog(page, { q = '', category = 'all', ids, language = 'en' }) {
  await expect(page.locator('html')).toHaveAttribute('data-locale', language);
  await expect(page.locator('#language-select')).toHaveValue(language);
  await expect(page.locator('#project-search')).toHaveValue(q);
  await expect(filter(page, category)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-filter][aria-pressed="true"]')).toHaveCount(1);
  if (ids) {
    await expect.poll(() => visibleCards(page).evaluateAll(cards => cards.map(card => card.dataset.project))).toEqual(ids);
    if (ids.length) await expect(page.locator('#empty-state')).toBeHidden();
    else await expect(page.locator('#empty-state')).toBeVisible();
  }
}

function address(page, { q = null, category = null, language = 'en', ref = 'shared', hash = '#examples' } = {}) {
  const url = new URL(page.url());
  expect(url.searchParams.get('q')).toBe(q);
  expect(url.searchParams.get('category')).toBe(category);
  expect(url.searchParams.get('lang')).toBe(language);
  expect(url.searchParams.get('ref')).toBe(ref);
  expect(url.hash).toBe(hash);
}

async function holdLocale(page, locale) {
  let release;
  let entered;
  const held = new Promise(resolve => { release = resolve; });
  const requested = new Promise(resolve => { entered = resolve; });
  const pattern = `**/locales/${locale}.json?*`;
  const handler = async route => {
    entered();
    await held;
    await route.continue(); // Continue the actual local JSON; never fabricate a bundle.
  };
  await page.route(pattern, handler);
  return { requested, release, remove: () => page.unroute(pattern, handler) };
}

test('catalog URL: direct links, refresh, invalid categories, and literal query text', async ({ page }) => {
  await page.goto('/showcase.html?lang=zh-CN&q=workflow&category=creative&ref=shared#examples');
  await catalog(page, { q: 'workflow', category: 'creative', ids: ['node'], language: 'zh-CN' });
  address(page, { q: 'workflow', category: 'creative', language: 'zh-CN' });
  await page.reload();
  await catalog(page, { q: 'workflow', category: 'creative', ids: ['node'], language: 'zh-CN' });

  await page.goto('/showcase.html?lang=en&q=Three.js&category=3d&ref=shared#examples');
  await catalog(page, { q: 'Three.js', category: '3d', ids: ['object', 'botanical', 'drift', 'mission'] });
  const literal = '<img src=x onerror="window.catalogInjected=true">';
  const params = new URLSearchParams({ lang: 'en', q: literal, category: 'not-a-category', ref: 'shared' });
  await page.goto(`/showcase.html?${params}#examples`);
  await catalog(page, { q: literal, ids: [] });
  expect(await page.evaluate(() => window.catalogInjected)).toBeUndefined();
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
  await noOverflow(page);
});

test('catalog history: search replaces, categories and clearing push, Back and Forward restore', async ({ page }) => {
  await page.goto('/showcase.html?lang=en&ref=shared#examples');
  await catalog(page, {});
  await page.evaluate(() => history.replaceState({ host: 'preserve-me' }, '', location.href));
  const start = await page.evaluate(() => history.length);
  const search = page.locator('#project-search');
  for (const query of ['n', 'no', 'node']) await search.fill(query);
  await catalog(page, { q: 'node', ids: ['node'] });
  expect(await page.evaluate(() => history.length)).toBe(start);

  await filter(page, 'creative').click();
  await filter(page, 'creative').click();
  expect(await page.evaluate(() => history.length)).toBe(start + 1);
  await search.fill('poster');
  await catalog(page, { q: 'poster', category: 'creative', ids: ['frame'] });
  expect(await page.evaluate(() => history.length)).toBe(start + 1);
  await filter(page, 'product').click();
  await catalog(page, { q: 'poster', category: 'product', ids: [] });
  address(page, { q: 'poster', category: 'product' });
  await page.locator('#clear-filters').click();
  await catalog(page, {});
  await expect(visibleCards(page)).toHaveCount(20);
  await expect(search).toBeFocused();
  expect(await page.evaluate(() => history.length)).toBe(start + 3);
  address(page);

  for (const state of [
    { q: 'poster', category: 'product', ids: [] },
    { q: 'poster', category: 'creative', ids: ['frame'] },
    { q: 'node', category: 'all', ids: ['node'] },
  ]) {
    await page.goBack();
    await catalog(page, state);
    address(page, { q: state.q, category: state.category === 'all' ? null : state.category });
  }
  for (const state of [
    { q: 'poster', category: 'creative', ids: ['frame'] },
    { q: 'poster', category: 'product', ids: [] },
    { q: '', category: 'all' },
  ]) {
    await page.goForward();
    await catalog(page, state);
    address(page, { q: state.q || null, category: state.category === 'all' ? null : state.category });
  }
  await expect(visibleCards(page)).toHaveCount(20);
  expect(await page.evaluate(() => history.state)).toEqual({ host: 'preserve-me' });
  await noOverflow(page);
});

test('catalog languages: history and refresh work with blocked storage and a deterministic search index', async ({ page, context }) => {
  await context.addInitScript(() => Object.defineProperty(window, 'localStorage', {
    get() { throw new DOMException('Storage blocked for regression test', 'SecurityError'); },
  }));
  await page.goto('/showcase.html?lang=en&q=poster&category=creative&ref=shared#examples');
  await catalog(page, { q: 'poster', category: 'creative', ids: ['frame'] });
  await page.locator('#language-select').selectOption('ja');
  await catalog(page, { q: 'poster', category: 'creative', ids: ['frame'], language: 'ja' });
  await filter(page, 'product').click();
  await page.locator('#language-select').selectOption('zh-CN');
  await catalog(page, { q: 'poster', category: 'product', ids: [], language: 'zh-CN' });
  await page.goBack();
  await catalog(page, { q: 'poster', category: 'creative', ids: ['frame'], language: 'ja' });
  address(page, { q: 'poster', category: 'creative', language: 'ja' });
  await page.goForward();
  await catalog(page, { q: 'poster', category: 'product', ids: [], language: 'zh-CN' });
  await page.locator('#project-search').fill('学习');
  await catalog(page, { q: '学习', category: 'product', ids: ['loop'], language: 'zh-CN' });
  await page.locator('#language-select').selectOption('en');
  await catalog(page, { q: '学习', category: 'product', ids: [] });
  address(page, { q: '学习', category: 'product' });
  await page.reload();
  await catalog(page, { q: '学习', category: 'product', ids: [] });
  await noOverflow(page);
});

test('catalog sharing: a saved language becomes explicit even when filters change during initial loading', async ({ page, context }) => {
  await context.addInitScript(() => {
    if (!sessionStorage.getItem('catalog-preference-seeded')) {
      localStorage.setItem('noshitui-language', 'zh-CN');
      sessionStorage.setItem('catalog-preference-seeded', 'true');
    }
  });
  const slow = await holdLocale(page, 'zh-CN');
  try {
    await page.goto('/showcase.html?ref=shared#examples', { waitUntil: 'domcontentloaded' });
    await slow.requested;
    await page.locator('#project-search').fill('学习');
    await filter(page, 'product').click();
    // Both entries precede the initial locale response. Back must still make
    // the eventual language explicit when it supersedes the initial loader.
    await page.goBack();
    await expect(filter(page, 'all')).toHaveAttribute('aria-pressed', 'true');
  } finally {
    slow.release();
  }
  await catalog(page, { q: '学习', ids: ['loop'], language: 'zh-CN' });
  address(page, { q: '学习', language: 'zh-CN' });
  await page.goForward();
  await catalog(page, { q: '学习', category: 'product', ids: ['loop'], language: 'zh-CN' });
  address(page, { q: '学习', category: 'product', language: 'zh-CN' });
  await slow.remove();
  // Reload the shared URL with no saved language and this fixture's English browser.
  expect(await page.evaluate(() => navigator.language)).toBe('en-US');
  await page.evaluate(() => localStorage.removeItem('noshitui-language'));
  await page.reload();
  await catalog(page, { q: '学习', category: 'product', ids: ['loop'], language: 'zh-CN' });
  address(page, { q: '学习', category: 'product', language: 'zh-CN' });
});

test('catalog language failures: selection and initial fallback expose failure and can retry real JSON', async ({ page }) => {
  const pattern = '**/locales/ja.json?*';
  const fail = route => route.abort('failed');
  await page.route(pattern, fail);
  await page.goto('/showcase.html?lang=en&q=orders&category=product&ref=shared#examples');
  await catalog(page, { q: 'orders', category: 'product', ids: ['shadcn'] });
  await page.locator('#language-select').selectOption('ja');
  await expect(page.locator('#language-status')).toBeVisible();
  await expect(page.locator('#language-status')).toContainText('could not load');
  await catalog(page, { q: 'orders', category: 'product', ids: ['shadcn'] });
  address(page, { q: 'orders', category: 'product' });
  expect(await page.evaluate(() => localStorage.getItem('noshitui-language'))).toBeNull();

  await page.goto('/showcase.html?lang=ja&q=orders&category=product&ref=shared#examples');
  await catalog(page, { q: 'orders', category: 'product', ids: ['shadcn'] });
  await expect(page.locator('#language-status')).toBeVisible();
  address(page, { q: 'orders', category: 'product' });
  await page.unroute(pattern, fail);
  await page.locator('#language-select').selectOption('ja');
  await catalog(page, { q: 'orders', category: 'product', ids: ['shadcn'], language: 'ja' });
  await expect(page.locator('#language-status')).toBeHidden();
  address(page, { q: 'orders', category: 'product', language: 'ja' });
  expect(await page.evaluate(() => localStorage.getItem('noshitui-language'))).toBe('ja');
});

test('catalog language failure on Back keeps URL and displayed language consistent', async ({ page }) => {
  await page.goto('/showcase.html?lang=ja&q=poster&category=creative&ref=shared#examples');
  await catalog(page, { q: 'poster', category: 'creative', ids: ['frame'], language: 'ja' });
  await filter(page, 'product').click();
  await page.locator('#language-select').selectOption('en');
  await catalog(page, { q: 'poster', category: 'product', ids: [] });
  await page.reload(); // The previous Japanese bundle must no longer be cached in memory.
  await catalog(page, { q: 'poster', category: 'product', ids: [] });
  await page.route('**/locales/ja.json?*', route => route.abort('failed'));
  await page.goBack();
  await expect(page.locator('#language-status')).toBeVisible();
  await catalog(page, { q: 'poster', category: 'creative', ids: ['frame'] });
  address(page, { q: 'poster', category: 'creative' });
});

test('catalog slow languages: Back cancels stale loading and successful loading preserves newer filters', async ({ page }) => {
  await page.goto('/showcase.html?lang=en&q=frame&ref=shared#examples');
  await catalog(page, { q: 'frame', ids: ['frame'] });
  await filter(page, 'creative').click();
  const slow = await holdLocale(page, 'ja');
  const aborted = page.waitForEvent('requestfailed', {
    predicate: request => new URL(request.url()).pathname.endsWith('/locales/ja.json'),
  });
  try {
    await page.locator('#language-select').selectOption('ja');
    await slow.requested;
    await expect(page.locator('.language-control')).toHaveAttribute('aria-busy', 'true');
    await page.locator('#project-search').fill('node');
    await page.goBack();
    await catalog(page, { q: 'frame', ids: ['frame'] });
    address(page, { q: 'frame' });
  } finally {
    slow.release();
  }
  const failed = await aborted;
  expect(failed.failure().errorText).toMatch(/abort/i);
  await slow.remove();
  await expect(page.locator('.language-control')).not.toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#language-status')).toBeHidden();
  address(page, { q: 'frame' });

  const retry = await holdLocale(page, 'ja');
  try {
    await page.locator('#language-select').selectOption('ja');
    await retry.requested;
    await page.locator('#project-search').fill('node');
    await filter(page, 'creative').click();
  } finally {
    retry.release();
  }
  await catalog(page, { q: 'node', category: 'creative', ids: ['node'], language: 'ja' });
  address(page, { q: 'node', category: 'creative', language: 'ja' });
  await retry.remove();
  await page.goBack();
  await catalog(page, { q: 'node', ids: ['node'] });
  address(page, { q: 'node' });
  await page.goForward();
  await catalog(page, { q: 'node', category: 'creative', ids: ['node'], language: 'ja' });
  await noOverflow(page);
});

test('catalog blocked History API keeps native filtering and language controls usable', async ({ page, context }) => {
  await context.addInitScript(() => {
    for (const method of ['pushState', 'replaceState']) history[method] = () => {
      throw new DOMException('History blocked for regression test', 'SecurityError');
    };
  });
  await page.goto('/showcase.html?lang=en&ref=shared#examples');
  await catalog(page, {});
  await page.locator('#project-search').fill('poster');
  await filter(page, 'product').click();
  await catalog(page, { q: 'poster', category: 'product', ids: [] });
  await page.locator('#language-select').selectOption('ja');
  await catalog(page, { q: 'poster', category: 'product', ids: [], language: 'ja' });
  await page.locator('#clear-filters').click();
  await catalog(page, { language: 'ja' });
  await expect(visibleCards(page)).toHaveCount(20);
});

test.describe('catalog without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('all twenty original project links remain accessible', async ({ page }) => {
    await page.goto('/showcase.html?lang=ja&q=missing&category=creative#examples');
    await expect(visibleCards(page)).toHaveCount(20);
    await expect(page.locator('#catalog-tools')).toBeHidden();
    await expect(page.locator('.language-control')).toBeHidden();
    await expect(page.locator('#project-grid [data-project="node"]')).toHaveAttribute('href', 'node.html');
    await noOverflow(page);
  });
});

const { test, expect, noOverflow } = require('./fixtures.cjs');

const cards = page => page.locator('#resourceGrid .resource-card');
const bookmark = (page, name) => page.getByRole('button', { name: `${name.saved ? 'Remove' : 'Save'} ${name.value}`, exact: true });
const category = (page, name) => page.locator(`#categoryList [data-category="${name}"]`);
const namesInView = page => cards(page).locator('.card-title').allTextContents();

async function ready(page) {
  await expect(cards(page)).toHaveCount(12);
  await expect(page.locator('#resultsCount')).toHaveText('12 results');
}

async function notice(page) {
  await expect(page.locator('#storageStatus')).toBeVisible();
  await expect(page.locator('#storageStatus')).toHaveAttribute('role', 'status');
  await expect(page.locator('#storageStatus')).toContainText('only for this visit');
}

async function observeNotice(page) {
  await page.evaluate(() => {
    window.atlasNoticeChanges = 0;
    new MutationObserver(records => { window.atlasNoticeChanges += records.length; })
      .observe(document.getElementById('storageStatus'), { subtree: true, childList: true, characterData: true, attributes: true });
  });
}

test('ATLAS recovery: malformed and untrusted saved data never block the real resource catalog', async ({ page }) => {
  await page.goto('/resources.html');
  await ready(page);
  const names = await namesInView(page);
  const [first, second] = [names[0], names[3]];
  const cases = [
    ['{broken', []],
    ['null', []],
    [JSON.stringify({ resource: first }), []],
    [JSON.stringify(first), []],
    ['42', []],
    [JSON.stringify([second, first, first, 'Unknown resource', 42, null, {}, '<img src=x onerror=alert(1)>']), [first, second]],
  ];
  for (const [raw, expected] of cases) {
    await test.step(raw, async () => {
      await page.evaluate(value => {
        localStorage.setItem('ui-atlas-saved', value);
        localStorage.setItem('ui-atlas-style', 'unrecognized-style');
      }, raw);
      await page.reload();
      await ready(page);
      await expect(page.locator('body')).toHaveAttribute('data-style', 'neon');
      await expect(page.locator('#storageStatus')).toBeHidden();
      await page.locator('#savedTop').click();
      await expect(cards(page)).toHaveCount(expected.length);
      expect(await namesInView(page)).toEqual(expected);
      await page.locator('#savedTop').click();
      const wasSaved = expected.includes(first);
      await bookmark(page, { value: first, saved: wasSaved }).press('Enter');
      await expect(bookmark(page, { value: first, saved: !wasSaved })).toBeFocused();
      const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem('ui-atlas-saved')));
      expect(persisted).toEqual(wasSaved ? [second] : [first]);
    });
  }
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
  await noOverflow(page);
});

for (const blocked of ['access', 'read']) {
  test(`ATLAS blocked storage ${blocked}: session actions work and the persistent notice is announced once`, async ({ page, context }) => {
    await context.addInitScript(mode => {
      if (mode === 'access') Object.defineProperty(window, 'localStorage', {
        get() { throw new DOMException('Storage access blocked for regression test', 'SecurityError'); },
      });
      else Storage.prototype.getItem = () => { throw new DOMException('Storage read blocked for regression test', 'SecurityError'); };
    }, blocked);
    await page.goto('/resources.html');
    await ready(page);
    await notice(page);
    await observeNotice(page);
    const [name] = await namesInView(page);
    await bookmark(page, { value: name }).press('Enter');
    await expect(bookmark(page, { value: name, saved: true })).toBeFocused();
    await expect(bookmark(page, { value: name, saved: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#toast')).toContainText('saved for this visit');
    await page.locator('[data-style-choice="paper"]').click();
    await expect(page.locator('body')).toHaveAttribute('data-style', 'paper');
    await expect(page.locator('[data-style-choice="paper"]')).toHaveAttribute('aria-pressed', 'true');
    await category(page, 'Components').click();
    await expect(cards(page)).toHaveCount(4);
    await page.locator('#searchInput').fill('shadcn');
    await expect(cards(page)).toHaveCount(1);
    await page.locator('#listView').click();
    await expect(page.locator('#listView')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#savedTop').click();
    await expect(cards(page)).toHaveCount(1);
    expect(await namesInView(page)).toEqual([name]);
    await expect(category(page, 'All')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#searchInput')).toHaveValue('');
    await bookmark(page, { value: name, saved: true }).press('Enter');
    await expect(page.locator('#savedTop')).toBeFocused();
    await expect(cards(page)).toHaveCount(0);
    await expect(page.locator('#emptyState')).toBeVisible();
    expect(await page.evaluate(() => window.atlasNoticeChanges)).toBe(0);
    await noOverflow(page);
    await page.reload();
    await ready(page);
    await expect(page.locator('body')).toHaveAttribute('data-style', 'neon');
    await page.locator('#savedTop').click();
    await expect(cards(page)).toHaveCount(0);
  });
}

test('ATLAS write failure: readable saved favorites survive while new changes stay in memory', async ({ page, context }) => {
  await page.goto('/resources.html');
  await ready(page);
  const [first, second] = await namesInView(page);
  await page.evaluate(name => {
    localStorage.setItem('ui-atlas-saved', JSON.stringify([name]));
    localStorage.setItem('ui-atlas-style', 'paper');
  }, first);
  await context.addInitScript(() => {
    window.atlasBlockedWrites = 0;
    Storage.prototype.setItem = () => {
      window.atlasBlockedWrites++;
      throw new DOMException('Storage quota exhausted for regression test', 'QuotaExceededError');
    };
  });
  await page.reload();
  await ready(page);
  await expect(page.locator('body')).toHaveAttribute('data-style', 'paper');
  await expect(bookmark(page, { value: first, saved: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#storageStatus')).toBeHidden();
  await bookmark(page, { value: second }).press('Enter');
  await notice(page);
  await expect(bookmark(page, { value: second, saved: true })).toBeFocused();
  await expect(page.locator('#toast')).toContainText('saved for this visit');
  await observeNotice(page);
  await page.locator('[data-style-choice="candy"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-style', 'candy');
  await expect(page.locator('#toast')).toContainText('selected for this visit');
  await page.locator('#savedTop').click();
  expect(await namesInView(page)).toEqual([first, second]);
  await bookmark(page, { value: first, saved: true }).press('Enter');
  await expect(bookmark(page, { value: second, saved: true })).toBeFocused();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ui-atlas-saved')))).toEqual([first]);
  expect(await page.evaluate(() => localStorage.getItem('ui-atlas-style'))).toBe('paper');
  expect(await page.evaluate(() => window.atlasBlockedWrites)).toBe(1);
  expect(await page.evaluate(() => window.atlasNoticeChanges)).toBe(0);
  await noOverflow(page);
  await page.reload();
  await ready(page);
  await expect(page.locator('body')).toHaveAttribute('data-style', 'paper');
  await page.locator('#savedTop').click();
  expect(await namesInView(page)).toEqual([first]);
});

test('ATLAS normal persistence: bookmarks, themes, and real toggle states remain coherent', async ({ page }) => {
  await page.goto('/resources.html');
  await ready(page);
  const [first] = await namesInView(page);
  await expect(page.locator('#storageStatus')).toBeHidden();
  await expect(page.locator('#savedTop')).toHaveAttribute('aria-pressed', 'false');
  await expect(category(page, 'All')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#licenseFilter')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#gridView')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#listView')).toHaveAttribute('aria-pressed', 'false');
  await bookmark(page, { value: first }).press('Enter');
  await expect(bookmark(page, { value: first, saved: true })).toBeFocused();
  await expect(bookmark(page, { value: first, saved: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#toast')).toHaveText(`${first} saved`);
  await page.locator('[data-style-choice="paper"]').click();
  await category(page, 'Components').press('Enter');
  await expect(category(page, 'Components')).toHaveAttribute('aria-pressed', 'true');
  await expect(category(page, 'All')).toHaveAttribute('aria-pressed', 'false');
  await expect(cards(page)).toHaveCount(4);
  await page.locator('#licenseFilter').press('Enter');
  await expect(page.locator('#licenseFilter')).toHaveAttribute('aria-pressed', 'true');
  await expect(cards(page)).toHaveCount(1);
  await expect(cards(page).locator('.license-dot.reference')).toHaveCount(0);
  await page.locator('#listView').press('Enter');
  await expect(page.locator('#listView')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#gridView')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#resourceGrid')).toHaveClass(/list-view/);
  await page.locator('#savedTop').press('Enter');
  await expect(page.locator('#savedTop')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#licenseFilter')).toHaveAttribute('aria-pressed', 'false');
  await expect(category(page, 'All')).toHaveAttribute('aria-pressed', 'true');
  expect(await namesInView(page)).toEqual([first]);
  await page.locator('#gridView').press('Enter');
  await expect(page.locator('#gridView')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#listView')).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await ready(page);
  await expect(page.locator('body')).toHaveAttribute('data-style', 'paper');
  await expect(bookmark(page, { value: first, saved: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#storageStatus')).toBeHidden();
  await noOverflow(page);
});

test('ATLAS Saved-only keyboard removal focuses adjacent resources and then the Saved toolbar', async ({ page }) => {
  await page.goto('/resources.html');
  await ready(page);
  const [first, second, third] = await namesInView(page);
  for (const name of [first, second, third]) {
    await bookmark(page, { value: name }).press('Enter');
    await expect(bookmark(page, { value: name, saved: true })).toBeFocused();
  }
  await page.locator('#savedTop').press('Enter');
  await expect(cards(page)).toHaveCount(3);
  await bookmark(page, { value: third, saved: true }).press('Space');
  await expect(bookmark(page, { value: second, saved: true })).toBeFocused();
  expect(await namesInView(page)).toEqual([first, second]);
  await bookmark(page, { value: first, saved: true }).press('Enter');
  await expect(bookmark(page, { value: second, saved: true })).toBeFocused();
  expect(await namesInView(page)).toEqual([second]);
  await bookmark(page, { value: second, saved: true }).press('Space');
  await expect(page.locator('#savedTop')).toBeFocused();
  await expect(page.locator('#savedTop')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#emptyState')).toBeVisible();
  await expect(cards(page)).toHaveCount(0);
  await page.locator('#savedTop').press('Enter');
  await ready(page);
  await expect(page.locator('#savedTop')).toHaveAttribute('aria-pressed', 'false');
  await noOverflow(page);
});

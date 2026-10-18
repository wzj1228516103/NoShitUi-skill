const { test, expect, noOverflow } = require('./fixtures.cjs');

test('stored-data recovery: all eight apps reject corrupted drafts', async ({ page, context }) => {
  await context.addInitScript(() => {
    for (const key of ['tempo-listening-room-v1', 'noshitui.frame.draft.v1',
      'ui-atlas-stay-draft-v1', 'ui-atlas-stay-bookings-v1', 'node-flow-studio-v1',
      'noshitui.loop.progress.v1', 'noshitui.source.preferences.v1',
      'noshitui.archive.exhibition.v1', 'ui-atlas-plate-v1']) localStorage.setItem(key, '{broken');
  });
  const initialStates = [
    ['tempo', '#savedCount', '00'],
    ['frame', '#templateList button', 3],
    ['stay', '#booking-count', '0'],
    ['node', '.node-card', 4],
    ['loop', '#completedStat', '0'],
    ['source', '#documentHeading', 'Quickstart'],
    ['archive', '.art-card', 5],
    ['plate', '.dish-open', 10],
  ];
  for (const [name, selector, initial] of initialStates) {
    await test.step(name, async () => {
      await page.goto(`/${name}.html`);
      if (typeof initial === 'number') await expect(page.locator(selector)).toHaveCount(initial);
      else await expect(page.locator(selector)).toHaveText(initial);
      await noOverflow(page);
    });
  }
});

test('blocked storage: workflow and curation still work for the session', async ({ page, context }) => {
  await context.addInitScript(() => Object.defineProperty(window, 'localStorage', {
    get() { throw new DOMException('Storage blocked for regression test', 'SecurityError'); },
  }));
  await page.goto('/node.html');
  await page.locator('#saveButton').click();
  await expect(page.locator('#saveState')).toHaveText('Storage unavailable');
  await page.locator('#runButton').click();
  await expect(page.locator('#runStatus')).toHaveText('COMPLETED');
  await page.goto('/archive.html');
  await expect(page.locator('.art-card')).toHaveCount(5);
  await page.locator('[data-save-id="436535"]').click();
  await expect(page.locator('#saved-count')).toHaveText('1');
  await expect(page.locator('.exhibition-help')).toContainText('visit only');
  await noOverflow(page);
});

test('ARCHIVE: failed data fetch has a working retry', async ({ page }) => {
  const fail = route => route.abort('failed');
  await page.route('**/assets/archive/collection.json', fail);
  await page.goto('/archive.html');
  await expect(page.locator('#load-error')).toBeVisible();
  await page.unroute('**/assets/archive/collection.json', fail);
  await page.locator('#retry-collection').click();
  await expect(page.locator('.art-card')).toHaveCount(5);
});

test('ARCHIVE: slow loading preserves an existing exhibition and its notes', async ({ page, context }) => {
  await context.addInitScript(() => localStorage.setItem('noshitui.archive.exhibition.v1', JSON.stringify({
    saved: [436535], notes: { 436535: 'Keep the existing note' }, title: 'Already curated',
  })));
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  await page.route('**/assets/archive/collection.json', async route => {
    await pending;
    await route.continue();
  });
  try {
    await page.goto('/archive.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#exhibition-name')).toBeDisabled();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('noshitui.archive.exhibition.v1')).saved)).toEqual([436535]);
  } finally {
    release();
  }
  await expect(page.locator('.saved-item')).toHaveCount(1);
  await expect(page.locator('.personal-note textarea')).toHaveValue('Keep the existing note');
  await page.locator('.saved-art-open').click();
  await page.locator('#save-art').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.saved-item')).toHaveCount(0);
  expect(await page.evaluate(() => document.activeElement.tagName)).not.toBe('BODY');
});

test('NODE: keyboard movement and cycle rejection', async ({ page }) => {
  await page.goto('/node.html');
  const grip = page.locator('.node-grip').first();
  const before = await grip.evaluate(element => parseFloat(element.closest('.node-card').style.left));
  await grip.press('ArrowRight');
  expect(await grip.evaluate(element => parseFloat(element.closest('.node-card').style.left))).toBeGreaterThan(before);
  await page.getByRole('button', { name: 'Choose output from Make it a digest', exact: true }).press('Enter');
  await page.getByRole('button', { name: 'Connect input of Keep the good parts', exact: true }).press('Enter');
  await page.locator('#validateButton').click();
  await expect(page.locator('#logList')).toContainText(/cycle/i);
  await page.locator('#resetButton').click();
  await page.locator('#validateButton').click();
  await expect(page.locator('#runStatus')).toHaveText('VALIDATED');
});

test('SOURCE: navigation, mobile dialog focus, and deep-link restore', async ({ page, isMobile }) => {
  await page.goto('/source.html');
  if (isMobile) {
    await page.locator('#menuButton').click();
    await page.locator('#mobileNav [data-document="messages"]').click();
    await expect(page.locator('#navDialog')).not.toBeVisible();
    await expect(page.locator('#documentHeading')).toBeFocused();
  } else {
    await page.locator('#desktopNav [data-document="messages"]').click();
  }
  await expect(page.locator('#documentHeading')).toHaveText('Create a message');
  await page.locator('#articleContent .heading-anchor').first().click();
  const fragment = new URL(page.url()).hash;
  expect(fragment).toContain('messages--');
  await page.reload();
  await expect(page.locator('#documentHeading')).toHaveText('Create a message');
  expect(new URL(page.url()).hash).toBe(fragment);
  await noOverflow(page);
});

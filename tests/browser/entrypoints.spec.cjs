const fs = require('node:fs');
const path = require('node:path');
const { test, expect, noOverflow } = require('./fixtures.cjs');
const projects = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../docs/screenshots/concepts/showcase-slides.json'), 'utf8'));

for (const project of projects) {
  test(`${project.id}: entry point renders and fits the viewport`, async ({ page }) => {
    const response = await page.goto(`/${project.href}`, { waitUntil: 'load' });
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(/\S/);
    await expect(page.locator('body')).toBeVisible();
    await noOverflow(page);
    const broken = await page.locator('img').evaluateAll(images => images
      .filter(img => img.getAttribute('src') && img.complete && new URL(img.currentSrc || img.src).origin === location.origin && img.naturalWidth === 0)
      .map(img => img.getAttribute('src')));
    expect(broken, 'Loaded local images must decode successfully').toEqual([]);
  });
}

test('studio: fallback typography fits narrow and intermediate widths', async ({ page }, testInfo) => {
  await page.goto('/studio.html');
  // Linux runners may have neither the remote Anton face nor Windows Impact.
  // Exercise the non-condensed fallback explicitly on every developer's machine.
  await page.addStyleTag({ content: 'h1 { font-family: sans-serif !important; }' });
  const widths = testInfo.project.name === 'mobile' ? [320, 390] : [768, 1024];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('GOOD DESIGN.BAD MANNERS.');
  }
});

test('collection: filters, empty recovery, and language persistence', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('#project-grid .card:visible');
  await expect(cards).toHaveCount(projects.length);
  await page.locator('[data-filter="3d"]').click();
  await expect(cards).toHaveCount(projects.filter(project => project.threeD).length);
  await page.locator('[data-filter="all"]').click();
  await page.locator('#project-search').fill('workflow');
  await expect(cards).toHaveCount(1);
  await expect(cards).toHaveAttribute('href', 'node.html');
  await page.locator('#project-search').fill('unmatched-zzzz');
  await expect(page.locator('#empty-state')).toBeVisible();
  await page.locator('#clear-filters').click();
  await expect(cards).toHaveCount(projects.length);
  await page.locator('#language-select').selectOption('zh-CN');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await page.reload();
  await expect(page.locator('#language-select')).toHaveValue('zh-CN');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await noOverflow(page);
});

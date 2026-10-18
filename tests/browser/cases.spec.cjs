const fs = require('node:fs');
const path = require('node:path');
const { test, expect, noOverflow } = require('./fixtures.cjs');

test('case studies: discoverable index, local previews, and canonical evidence links', async ({ page }) => {
  await page.goto('/');
  await page.locator('#case-entry-link').click();
  await expect(page).toHaveURL(/\/case-studies\.html$/);
  await expect(page.locator('.case-card')).toHaveCount(3);
  for (const name of ['shadcn-ops', 'node-native', 'object-threejs']) {
    const file = `docs/case-studies/${name}.md`;
    expect(fs.existsSync(path.resolve(__dirname, '../..', file))).toBe(true);
    await expect(page.locator(`a[href="https://github.com/wzj1228516103/NoShitUi-skill/blob/showcase-source/${file}"]`)).toBeVisible();
  }
  for (const target of ['shadcn-demo/', 'node.html', 'object.html']) {
    await expect(page.locator(`.case-links a[href="${target}"]`)).toBeVisible();
  }
  await noOverflow(page);
});

test('SHADCN/OPS: combined filtering, Radix editing, and session-only data', async ({ page }) => {
  await page.goto('/shadcn-demo/');
  await page.getByRole('textbox', { name: 'Search orders', exact: true }).fill('Maya');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.locator('.table-toolbar').getByRole('combobox').click();
  await page.getByRole('option', { name: 'Processing', exact: true }).click();
  await expect(page.locator('tbody')).toContainText('No orders match those filters.');
  await page.locator('.table-toolbar').getByRole('combobox').click();
  await page.getByRole('option', { name: 'All status', exact: true }).click();
  const opener = page.getByRole('button', { name: 'Edit ORD-1048', exact: true });
  await opener.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Customer', exact: true }).fill('Maya Revised');
  await dialog.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('ORD-1048 updated');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('tbody')).toContainText('Maya Revised');
  await expect(opener).toBeFocused();
  await page.reload();
  await expect(page.locator('tbody')).toContainText('Maya Chen');
  await expect(page.locator('tbody')).not.toContainText('Maya Revised');
  await noOverflow(page);
});

test('OBJECT: configuration remains useful without WebGL', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /^webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
  await page.goto('/object.html');
  await expect(page.locator('#webglOff')).toBeVisible();
  await page.locator('[data-model="table"]').click();
  await page.locator('[data-material="rose"]').click();
  await expect(page.locator('#summaryModel')).toHaveText('Classic / table');
  await expect(page.locator('#summaryMaterial')).toHaveText('Rose / ceramic');
  await page.locator('#brightness').press('Home');
  await expect(page.locator('#summaryBrightness')).toHaveText('10%');
  await page.locator('#reset').click();
  await expect(page.locator('#summaryModel')).toHaveText('Balance / task');
  await expect(page.locator('#summaryMaterial')).toHaveText('Silver / satin');
  await noOverflow(page);
});

test('UI ATLAS: CDN failure preserves search, filtering, saved resources, and layout controls', async ({ page }) => {
  await page.goto('/resources.html');
  await expect(page.locator('.resource-card')).toHaveCount(12);
  await page.locator('#searchInput').fill('shadcn');
  await expect(page.locator('.resource-card')).toHaveCount(1);
  await page.locator('[data-save]').click();
  await page.locator('#searchInput').fill('');
  await page.locator('#savedTop').click();
  await expect(page.locator('.resource-card')).toHaveCount(1);
  await page.reload();
  await page.locator('#savedTop').click();
  await expect(page.locator('.resource-card')).toHaveCount(1);
  await page.locator('#savedTop').click();
  await page.locator('[data-category="Components"]').click();
  await expect(page.locator('.resource-card')).toHaveCount(4);
  await page.locator('#listView').click();
  await expect(page.locator('.resource-grid')).toHaveClass(/list-view/);
  await page.locator('#gridView').click();
  await expect(page.locator('.resource-grid')).not.toHaveClass(/list-view/);
  await noOverflow(page);
});

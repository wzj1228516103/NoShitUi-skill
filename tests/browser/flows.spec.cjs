const fs = require('node:fs/promises');
const { test, expect, noOverflow } = require('./fixtures.cjs');

const futureDate = days => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

test('TEMPO: real playback, preferences, and keyboard focus return', async ({ page }) => {
  await page.goto('/tempo.html');
  const audio = page.locator('#audio');
  await expect.poll(() => audio.evaluate(element => element.readyState)).toBeGreaterThanOrEqual(2);
  await page.locator('#playButton').click();
  await expect.poll(() => audio.evaluate(element => element.currentTime)).toBeGreaterThan(0.1);
  await page.locator('#playButton').click();
  await expect.poll(() => audio.evaluate(element => element.paused)).toBe(true);
  await page.locator('#volume').focus();
  await page.locator('#volume').press('Home');
  await expect.poll(() => audio.evaluate(element => element.volume)).toBe(0);
  await page.locator('#favoriteButton').click();
  await expect(page.locator('#savedCount')).toHaveText('01');
  await page.reload();
  await expect(page.locator('#savedCount')).toHaveText('01');
  await expect.poll(() => audio.evaluate(element => element.volume)).toBe(0);
  await expect.poll(() => audio.evaluate(element => element.paused)).toBe(true);
  await page.locator('#helpButton').click();
  await expect(page.locator('#shortcutsDialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#helpButton')).toBeFocused();
  await noOverflow(page);
});

test('FRAME: edit, history, draft restore, and actual image export', async ({ page, isMobile }, info) => {
  await page.goto('/frame.html');
  if (isMobile) await page.locator('.mobile-tools [data-panel="edit"]').click();
  const input = page.locator('#textInput');
  const original = await input.inputValue();
  await input.fill('KEEP <GOOD> & "MORE"');
  await input.press('Tab');
  await page.locator('#undoButton').click();
  await expect(input).toHaveValue(original);
  await page.locator('#redoButton').click();
  await expect(input).toHaveValue('KEEP <GOOD> & "MORE"');
  await page.locator('#saveButton').click();
  await page.reload();
  if (isMobile) await page.locator('.mobile-tools [data-panel="edit"]').click();
  await expect(input).toHaveValue('KEEP <GOOD> & "MORE"');
  if (!isMobile) {
    const downloaded = page.waitForEvent('download');
    await page.locator('#exportSVG').click();
    const download = await downloaded;
    const file = info.outputPath('poster.svg');
    await download.saveAs(file);
    const xml = await fs.readFile(file, 'utf8');
    expect(xml).toContain('&lt;GOOD&gt;');
    expect(xml).toContain('&amp;');
    expect(xml).not.toContain('selection-overlay');
    expect(await page.evaluate(source => new DOMParser().parseFromString(source, 'image/svg+xml').querySelectorAll('parsererror').length, xml)).toBe(0);
  }
  const downloaded = page.waitForEvent('download');
  await page.locator('#exportPNG').click();
  const download = await downloaded;
  const file = info.outputPath('poster.png');
  await download.saveAs(file);
  const bytes = await fs.readFile(file);
  expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([1200, 1560]);
  await noOverflow(page);
});

test('STAY: validation, confirmation, restore, and cancellation', async ({ page }) => {
  await page.goto('/stay.html');
  await page.locator('[data-room="terrace"]').click();
  await page.locator('#arrival').fill(futureDate(15));
  await page.locator('#departure').fill(futureDate(17));
  await page.locator('#guests').selectOption('4');
  await page.locator('#stay-form button[type="submit"]').click();
  expect(await page.locator('#guests').evaluate(element => element.checkValidity())).toBe(false);
  await expect(page.locator('#step-1')).toBeVisible();
  await page.locator('#guests').selectOption('2');
  await page.locator('#stay-form button[type="submit"]').click();
  await page.locator('#guest-name').fill('Regression Guest');
  await page.locator('#guest-email').fill('invalid-email');
  await page.locator('#details-form button[type="submit"]').click();
  expect(await page.locator('#guest-email').evaluate(element => element.checkValidity())).toBe(false);
  await page.locator('#guest-email').fill('guest@example.test');
  await page.locator('#details-form button[type="submit"]').click();
  await expect(page.locator('#step-3')).toBeVisible();
  await page.locator('#confirm-booking').click();
  await expect(page.locator('#review-error')).toBeVisible();
  await page.locator('#demo-consent').check();
  await page.locator('#confirm-booking').click();
  await expect(page.locator('#step-4')).toBeVisible();
  await page.locator('#view-stays').click();
  await expect(page.locator('#booking-count')).toHaveText('1');
  await page.reload();
  await expect(page.locator('#booking-count')).toHaveText('1');
  await page.locator('#reservations-list button').click();
  await page.locator('#action-confirm').click();
  await expect(page.locator('#booking-count')).toHaveText('0');
  await expect(page.locator('#reservations-list')).toContainText('CANCELLED');
  await noOverflow(page);
});

test('NODE: simulation, cancellation, saved graph, and JSON export', async ({ page }, info) => {
  await page.goto('/node.html');
  await expect(page.locator('.node-card')).toHaveCount(4);
  await page.locator('#workflowName').fill('A reproducible flow');
  await page.locator('#saveButton').click();
  await page.reload();
  await expect(page.locator('#workflowName')).toHaveValue('A reproducible flow');
  await page.locator('#runButton').click();
  await expect(page.locator('#runStatus')).toHaveText('COMPLETED');
  await expect(page.locator('#outputText')).toContainText('THE WEEKLY DIGEST');
  await page.locator('#runButton').click();
  await page.locator('#cancelRunButton').click();
  await expect(page.locator('#runStatus')).toHaveText('CANCELLED');
  const downloaded = page.waitForEvent('download');
  await page.locator('#exportButton').click();
  const download = await downloaded;
  const file = info.outputPath('workflow.json');
  await download.saveAs(file);
  const workflow = JSON.parse(await fs.readFile(file, 'utf8'));
  expect(workflow.version).toBe(1);
  expect(workflow.simulation).toBe(true);
  expect(workflow.graph.nodes).toHaveLength(4);
  await noOverflow(page);
});

test('LOOP: incorrect answer retry, unit unlock, and progress restore', async ({ page }) => {
  await page.goto('/loop.html');
  await expect(page.locator('[data-unit="1"]')).toBeDisabled();
  await page.locator('[data-unit="0"]').click();
  await page.locator('#lessonAction').click();
  await expect(page.locator('#lessonAction')).toBeDisabled();
  await page.locator('input[name="answer"][value="0"]').check();
  await page.locator('#lessonAction').click();
  await expect(page.locator('.feedback.error')).toBeVisible();
  await page.locator('#lessonAction').click();
  for (const answer of [1, 0, 2]) {
    await page.locator(`input[name="answer"][value="${answer}"]`).check();
    await page.locator('#lessonAction').click();
    await expect(page.locator('.feedback:not(.error)')).toBeVisible();
    await page.locator('#lessonAction').click();
  }
  await expect(page.locator('.completion')).toBeVisible();
  await page.locator('#lessonAction').click();
  await expect(page.locator('[data-unit="1"]')).toBeEnabled();
  await page.reload();
  await expect(page.locator('#completedStat')).toHaveText('1');
  await expect(page.locator('#coursePercent')).toContainText('33');
  await noOverflow(page);
});

test('SOURCE: real in-memory create/retrieve, errors, and cancellation', async ({ page }) => {
  await page.goto('/source.html');
  for (const [scenario, code] of [['bad-body', '400'], ['bad-token', '401']]) {
    await page.locator(`[data-scenario="${scenario}"]`).click();
    await page.locator('#runRequest').click();
    await expect(page.locator('#responseStatus')).toContainText(code);
  }
  await page.locator('[data-scenario="success"]').click();
  await page.locator('#messageInput').fill('A locally created regression message');
  await page.locator('#runRequest').click();
  await expect(page.locator('#responseStatus')).toContainText('201');
  const record = JSON.parse(await page.locator('#responseCode').textContent());
  await page.locator('#endpointInput').selectOption('retrieve');
  await page.locator('#messageIdInput').fill(record.id);
  await page.locator('#runRequest').click();
  await expect(page.locator('#responseStatus')).toContainText('200');
  expect(JSON.parse(await page.locator('#responseCode').textContent()).body).toBe('A locally created regression message');
  await page.locator('#runRequest').click();
  await page.locator('#cancelRequest').click();
  await expect(page.locator('#responseStatus')).toHaveText('CANCELLED');
  await noOverflow(page);
});

test('ARCHIVE: curation, focus return, standalone export, and restore', async ({ page }, info) => {
  await page.goto('/archive.html');
  await expect(page.locator('.art-card')).toHaveCount(5);
  await page.locator('#hero-art-button').click();
  await page.locator('#zoom-in').click();
  await expect(page.locator('#zoom-value')).toHaveText('125%');
  await page.locator('#save-art').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#hero-art-button')).toBeFocused();
  await expect(page.locator('.saved-item')).toHaveCount(1);
  await page.locator('#exhibition-name').fill('A <quiet> exhibition');
  await page.locator('.personal-note textarea').fill('Keep <script> as text & preserve this note.');
  const downloaded = page.waitForEvent('download');
  await page.locator('#export-exhibition').click();
  const download = await downloaded;
  const file = info.outputPath('exhibition.html');
  await download.saveAs(file);
  const html = await fs.readFile(file, 'utf8');
  expect(html).toContain('&lt;quiet&gt;');
  expect(html).toContain('data:image/webp;base64,');
  expect(html).not.toContain('<script>');
  await page.reload();
  await expect(page.locator('.saved-item')).toHaveCount(1);
  await expect(page.locator('.personal-note textarea')).toHaveValue('Keep <script> as text & preserve this note.');
  await noOverflow(page);
});

test('PLATE: configured price, bag, confirmation, restore, and cancel', async ({ page }) => {
  await page.goto('/plate.html');
  await page.getByRole('button', { name: 'Choose Rigatoni pomodoro, from €16', exact: true }).click();
  await page.locator('input[name="dish-size"][value="large"]').check();
  await page.locator('input[name="dish-extra"][value="parmesan"]').check();
  await expect(page.locator('#dish-total')).toHaveText('€23');
  await page.locator('#dish-add-button').click();
  await page.locator('[data-open-bag]').filter({ visible: true }).first().click();
  await expect(page.locator('#checkout-total')).toHaveText('€23');
  await page.locator('#pickup-name').fill('Regression Diner');
  await page.locator('#checkout-form button[type="submit"]').click();
  await expect(page.locator('#bag-step-2')).toBeVisible();
  await page.locator('#confirm-order').click();
  await expect(page.locator('#review-error')).toBeVisible();
  await page.locator('#demo-consent').check();
  await page.locator('#confirm-order').click();
  await expect(page.locator('#bag-step-3')).toBeVisible();
  await page.locator('#view-orders').click();
  await page.reload();
  await expect(page.locator('#order-list article')).toHaveCount(1);
  await page.locator('#order-list article button').click();
  await page.locator('#action-confirm').click();
  await expect(page.locator('#order-list')).toContainText('CANCELLED');
  await noOverflow(page);
});

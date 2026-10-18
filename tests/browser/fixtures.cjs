const { test: base, expect } = require('@playwright/test');

// Keep local flows reproducible when remote fonts, photographs, or CDNs are
// unavailable. Remote resources are aborted, never replaced with fake app data.
// Pages must keep their native fallback and local controls usable.
const test = base.extend({
  browserHealth: [async ({ page, context, baseURL }, use) => {
    const errors = [];
    const missing = [];
    const origin = new URL(baseURL).origin;
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (new URL(response.url()).origin === origin && response.status() >= 400) {
        missing.push(`${response.status()} ${response.url()}`);
      }
    });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      return /^https?:$/.test(url.protocol) && url.origin !== origin
        ? route.abort('internetdisconnected') : route.continue();
    });
    await use();
    expect(errors, 'Uncaught browser exceptions').toEqual([]);
    expect(missing, 'HTTP errors from local application resources').toEqual([]);
  }, { auto: true }],
});

async function noOverflow(page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    { message: 'Document must fit the viewport; internal canvases can scroll separately' }).toBeLessThanOrEqual(1);
  // Mobile Chromium can silently enlarge its layout viewport around an escaped
  // element. Comparing scrollWidth with innerWidth alone would miss that bug.
  await expect.poll(() => page.evaluate(() => innerWidth),
    { message: 'The page must not enlarge the configured mobile layout viewport' }).toBeLessThanOrEqual(page.viewportSize().width + 1);
}

module.exports = { test, expect, noOverflow };

# Browser regression checks

The checked-in suite runs all 20 project entry points at 1360×900 and 390×844,
then exercises the collection, the eight newer application flows, the three-case
index, React order editing, native product controls without WebGL, and the resource
atlas without its icon CDN. It checks
uncaught exceptions, local HTTP errors, document overflow, exports, recovery,
and the browser state visible to a user. STUDIO's fallback typography is also
checked at 320, 390, 768, and 1024 pixels without condensed system fonts.
Lamp geometry has a separate numeric
regression in `scripts/check-lamp-assembly.mjs`.

From the repository root:

```sh
npm ci --prefix shadcn-demo
npm run build --prefix shadcn-demo
npm ci --prefix tests/browser
cd tests/browser
npx playwright install chromium
npm test
```

The test runner starts and stops its own preview server on port 4183. Override
`SHOWCASE_TEST_PORT` if needed. It does not use the interactive preview on 4173.
GitHub jobs use the verified `ubuntu-24.04` runner rather than a moving OS label.
For a local Windows run with an installed Microsoft Edge, set
`$env:PLAYWRIGHT_CHANNEL = 'msedge'` in PowerShell before `npm test`; no browser
download is then required. CI uses the pinned Playwright Chromium build.

Reports are under `tests/browser/playwright-report`; failed runs retain screenshots
and traces under `tests/browser/test-results`. Open the report with `npm run report`
from this directory. These generated artifacts are ignored by Git.

Remote font, photograph, and CDN requests are deliberately blocked. The suite
requires local application resources and core controls to work with their actual
fallbacks; it does not stub successful application responses or replace museum,
audio, or booking data. This makes CI independent of remote asset availability.
It does not certify external assets, visual fidelity, cross-browser compatibility,
or complete accessibility conformance. The two viewport projects use Chromium.
Entry-point smoke checks do not certify every control in the older concept pages.

The reusable `.github/workflows/check-showcase.yml` runs on relevant pull requests
and is a required dependency of the Pages workflow. It builds the React example,
runs translation and lamp-assembly checks, installs the pinned browser, and
retains reports for seven days. A failing quality job prevents Pages deployment.

Collection links accept `q` (search text), `category` (`3d`, `product`, `creative`,
`brand`, or `motion`; omitted or unknown means all), and the existing `lang`.
For example, `/?category=creative&q=poster&lang=en#examples` opens FRAME's view.
Category changes and clearing an empty view create history entries; typing
updates the current entry. Reload and Back/Forward restore controls and results,
while unrelated query parameters and fragments survive. Searches use the
original English metadata plus the active translation, so a shared link does
not depend on languages loaded during a previous visit.
Language failures expose feedback and keep the URL aligned with the displayed
fallback; retries use the real local bundles. Tests also cover stale-request
cancellation, disabled storage/History APIs, and the twenty static links with
JavaScript disabled. If a browser blocks History updates, controls remain usable
but the address cannot track the selected view.

The language error includes a direct, localized retry button, including when
the initial English bundle fails. The resource atlas also supports session-only
saved items and themes when storage fails, recovers malformed stored data, and
preserves useful keyboard focus when a saved resource disappears from a view.

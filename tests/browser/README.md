# Browser regression checks

The checked-in suite runs all 20 project entry points at 1360×900 and 390×844,
then exercises the collection, the eight newer application flows, the three-case
index, React order editing, native product controls without WebGL, and the resource
atlas without its icon CDN. It checks
uncaught exceptions, local HTTP errors, document overflow, exports, recovery,
and the browser state visible to a user. Lamp geometry has a separate numeric
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

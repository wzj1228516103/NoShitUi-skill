# Eight new experiences — selection and implementation

## Constraints and shared choice

The `showcase-source` branch deploys static HTML and local assets to GitHub Pages. Its existing `shadcn-demo` is an independently built React 19 / Vite example. All eight new pages follow the established static concept-page structure, with original CSS and native semantic controls as the primary UI strategy. They add no packages, providers, global resets shared with other pages, third-party component source, or backend dependencies.

This keeps each visual direction independent and makes every new page usable without a CDN. Complex editing, media, and booking behavior are limited to the core task described below. Larger production versions could justify the candidate libraries, but the showcase's smaller scope can be verified directly with browser APIs.

| Page | Considered specialist | Adopted source and reason |
| --- | --- | --- |
| TEMPO | WaveSurfer for audio waveform rendering | `tempo.html`, `tempo.css`, `tempo.js`; HTMLAudioElement controls actual playback and progress. A local waveform/track model supports the small fixed music collection. |
| FRAME | Fabric.js for a general canvas object system | `frame.html`, `frame.css`, `frame.js`; a small original SVG document model supports three controlled templates, layers, text, transforms, undo, and export. System fonts avoid remote font export problems. |
| STAY | A React calendar/form system | `stay.html`, `stay.css`, `stay.js`; native date inputs, form fields, and dialog semantics support a bounded multi-step booking flow with browser locale behavior. |
| NODE | React Flow for a general graph editor | `node.html/css/js`; the bounded six-node-type model uses original DOM cards and SVG connections. Clickable port buttons provide keyboard/touch connections as well as dragging node positions. |
| LOOP | A mobile application toolkit | `loop.html/css/js`; semantic lesson dialogs, native answer fields, an original path model, and device-local progress support three short units without a framework runtime. |
| SOURCE | A full documentation framework | `source.html/css/js`; six static document models share original rendering, search, anchors, language examples, and a deterministic in-memory API simulator. |
| ARCHIVE | A general image viewer and CMS | `archive.html/css/js`; pinned museum metadata, local public-domain paintings, native dialogs, bounded pan/zoom, and a self-contained exhibition download. |
| PLATE | A hosted commerce/order system | `plate.html/css/js`; a fixed ten-dish menu, semantic controls, integer-cent prices, local bag state, and an explicit demonstration checkout. |

The tradeoff is that the project owns these interaction implementations. They are demonstration flows rather than general editing or reservation frameworks.

## Core tasks

- TEMPO: start an original track, pause, seek, change volume or track, save favorites, and revisit the collection. Reload restores preferences without automatically starting playback.
- FRAME: choose a poster template, edit its text and transforms, move a layer, undo/redo, save a local draft, and download a real SVG or PNG.
- STAY: choose a room and future dates, enter contact details, review an itemized total, confirm a device-local demonstration reservation, and cancel it with confirmation.
- NODE: add and move steps, connect ports, edit parameters, validate topology, run/cancel a deterministic simulation, and save/export the graph. Three runnable templates exercise 4/4/5 steps.
- LOOP: read three lessons, answer nine questions with explanations and retries, unlock the next unit, review statistics, bookmark field notes, and recover/reset progress.
- SOURCE: browse six documents, search and navigate highlighted results/anchors, switch/copy JavaScript/Python/cURL examples, and try local 200/201/400/401/404 responses and cancellation.
- ARCHIVE: discover five open-access paintings, zoom/pan details, save/reorder works, write personal notes, and export a self-contained HTML exhibition guide with embedded images.
- PLATE: filter ten dishes, choose size/extras/quantity, edit a bag, validate collection/dine-in and timing details, confirm a local order, and revisit/cancel it.

Reservations, orders, drafts, and progress are stored on the current browser/device. Disabled storage retains usable session state and explains how to export when available. SOURCE keeps simulated messages in memory and does not persist the token field. No new page submits payments, reservations, orders, or messages to a server. Source notes for photography, paintings, and music accompany the local assets; see also the repository's `THIRD-PARTY-NOTICES.md`.

## Local preview and deployment

From the repository root run:

```sh
node scripts/serve-showcase.cjs
```

Open `http://127.0.0.1:4173/`. The server maps the collection to `/` and the original atlas to `/resources.html`, matching the GitHub Pages entry points. The eight new demos are `/tempo.html`, `/frame.html`, `/stay.html`, `/node.html`, `/loop.html`, `/source.html`, `/archive.html`, and `/plate.html`. To preview the existing React workspace, first run its documented build in `shadcn-demo`.

The existing Pages workflow copies `ui-atlas-demo` and excludes its `output/` directory. The new pages need no additional build step. `docs/screenshots/concepts/showcase-slides.json` is the shared ordering for README media, with the original four 3D experiences still first.

## Verification

Verified on 2026-10-15 using Playwright with installed Microsoft Edge (Chromium). The CLI package was not cached, so the bundled Playwright runtime drove a separate headless browser. No new test dependency was installed.

- TEMPO, FRAME, and STAY render at 1360×900 and 390×844 without horizontal overflow, missing local imagery, or uncaught script errors.
- Their first-batch browser flow checks passed: collection search/categories; audio playback/seek/volume/queue/preferences; failed audio and retry; poster editing/history/drag/save/SVG/PNG; booking validation/review/inventory/cancellation; mobile booking/draft recovery; mobile editor/export; corrupted local data; and disabled browser storage. Collection counts were subsequently rechecked against all 20 projects.
- SVG downloads parse as XML with escaped user text and no selection overlay. PNG downloads have the PNG signature and 1200×1560 dimensions.
- Native dialog closing returns focus; controls support keyboard operation. CSS respects reduced-motion preferences. This is targeted verification, not a formal accessibility audit.
- `node --check` passes for the three page scripts, the waveform data, and the preview server.

### Second batch: all five remaining proposed directions

The second batch adds NODE, LOOP, SOURCE, ARCHIVE, and PLATE, bringing the collection to 20 projects and completing all eight directions proposed in this chat.

- All five render at 1360×900 and 390×844 without document overflow, missing local images, or uncaught browser errors. The collection, complete index, category counts, and media manifest share the same 20-project order.
- Sixteen browser flow groups pass: collection filtering; exhibition filtering/zoom/curation/reorder/export; artwork-data failure/retry; lesson errors/retries/unlocks/statistics/reset; mobile learning; ordering/prices/bag editing/confirmation/cancellation; mobile dining/time validation; workflow movement/parameters/templates/run/cancel/save/export; connection-cycle rejection and removal; mobile workflow panels; documentation search/anchors/languages/clipboard/preferences; API success/errors/object retrieval/cancellation; mobile docs/deep links; slow artwork-data preservation and focus fallback; corrupted storage on all five; and disabled storage on all five.
- NODE's three templates produce real deterministic local output; invalid topology and cycles are rejected. SOURCE's simulated create/retrieve model retains actual in-memory objects and makes no external requests. Six Python samples parse with Python's AST; all six JavaScript examples pass syntax parsing.
- ARCHIVE downloads are standalone HTML with embedded images, escaped titles/notes, and museum provenance. A review found and fixed early-edit overwrites during data loading, focus restoration after a saved entry is removed, image-aware pan bounds, and persistent session-only storage feedback.
- `node --check` passes for all five scripts. The media builder now generates 20 covers and a 20-frame, 44.8-second carousel. All adopted food/art images have pinned local provenance; no additional runtime package was installed for the new pages.
- The existing React workspace passed its TypeScript/Vite production build using the unchanged lockfile. All 20 project entry points return HTML successfully, and the built React workspace renders without uncaught page errors. No dependency manifest or lockfile was changed.

Captured screenshots and detailed QA reports are kept under the local ignored `ui-atlas-demo/output/playwright/` directory; desktop/mobile cover screenshots are promoted to `docs/screenshots/concepts/`. Older concept interactions were not exhaustively retested. Deployment uses the existing `showcase-source` push workflow; the corresponding GitHub Actions run is the authoritative deployment result.

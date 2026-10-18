# SHADCN/OPS: source-owned components for a bounded operations screen

[Live demo](https://wzj1228516103.github.io/NoShitUi-skill/shadcn-demo/) · [Case index](README.md) · [Pinned source](https://github.com/wzj1228516103/NoShitUi-skill/tree/8912b22/shadcn-demo)

## Reproducible task

Build an orders workspace with text/status filtering, an editable order dialog, feedback after saving, and responsive navigation. Keep the component source inside the app so the interface can be customized. Use fixed demonstration data; changes last for the current browser session. The existing new-order dialog is a UI-only draft sketch, not a completed creation flow.

This is a task for reproducing the existing example, not the original user prompt. The comparison below reconstructs fit from checked-in code and the resource catalog; it does not reconstruct an undocumented historical benchmark.

## Project constraints

- The app is an independently built React/TypeScript project, not a component framework imposed on the other static demos.
- [`vite.config.ts`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/shadcn-demo/vite.config.ts) sets a relative asset base and the `@` alias, allowing a production build to be hosted under the showcase subdirectory.
- [`components.json`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/shadcn-demo/components.json) records `new-york`, TypeScript, CSS variables, Tailwind configuration, Lucide icons, and `rsc: false`. There is no server-component requirement.
- The implemented surface is six seeded orders and a small set of controls. It does not need a server data grid, virtualized rows, or a general form engine.

## Candidates and tradeoffs

| Strategy | Fit for this task | Why it was not the adopted strategy here |
| --- | --- | --- |
| Source-owned shadcn/ui components + Radix | Local source controls visual composition while Radix supplies dialog/select behavior. React and Tailwind already form the example's stack. | Adopted. The app owns maintenance of the copied and adapted components. |
| A complete styled React system such as MUI or Ant Design | Reasonable when extensive business controls and a shared enterprise theme are the central requirements. | This bounded example instead demonstrates source ownership and local styling. No competing styled-system prototype or performance comparison is recorded. |
| Native HTML/CSS/JavaScript | A workable option for a small static screen; the collection's PRECISION example takes this route. | Would not demonstrate the requested React/source-owned component workflow. It is not rejected as generally inferior. |

The [library catalog](../../open-source-ui-resources/references/ui-libraries.md) supplies the resource categories. This case chooses one component strategy and one icon family; it does not mix complete styled systems.

## Adopted source, versions, and licenses

The source is in [`src/components/ui/`](https://github.com/wzj1228516103/NoShitUi-skill/tree/8912b22/shadcn-demo/src/components/ui): Button, Card, Badge, Input, Select, and Dialog. These are local files, not an installed `shadcn` runtime. [`THIRD-PARTY-NOTICES.md`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/THIRD-PARTY-NOTICES.md) identifies adaptation from the [shadcn/ui registry](https://github.com/shadcn-ui/ui), under its MIT license.

The initial local introduction is [`79bb0cb`](https://github.com/wzj1228516103/NoShitUi-skill/commit/79bb0cb). The exact upstream registry export/commit used for those copied files is **not recorded** in the baseline. A later catalog verification commit is not evidence of the copied source's original revision. The local pinned files are reproducible; upstream copy provenance remains a documented gap.

The following are **resolved lockfile entries**, not the `^` ranges in `package.json` and not claims about current upstream releases. The full tree, package `resolved` tarball URLs, integrity hashes, and license declarations are in [`package-lock.json`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/shadcn-demo/package-lock.json).

| Package | Locked version | License declared in lockfile |
| --- | --- | --- |
| `react`, `react-dom` | 19.3.0 | MIT |
| `@radix-ui/react-dialog` | 1.3.1 | MIT |
| `@radix-ui/react-select` | 2.4.1 | MIT |
| `@radix-ui/react-slot` | 1.5.0 | MIT |
| `lucide-react` | 0.468.0 | ISC |
| `class-variance-authority` | 0.7.1 | Apache-2.0 |
| `clsx` | 2.1.1 | MIT |
| `tailwind-merge` | 3.7.0 | MIT |
| `tailwindcss`, `@tailwindcss/vite` | 4.3.3 | MIT |
| `vite` | 6.4.4 | MIT |
| `typescript` | 5.9.3 | Apache-2.0 |

These selected entries include runtime packages and major build tools; they are not an exhaustive transitive-license inventory. Preserve applicable package and copied-source notices when redistributing. The repository's MIT license does not replace those licenses.

## Follow the implementation

- [`src/main.tsx`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/shadcn-demo/src/main.tsx): fixed orders, React state, combined text/status filtering, edit selection, save behavior, and responsive navigation.
- [`src/components/ui/dialog.tsx`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/shadcn-demo/src/components/ui/dialog.tsx) and [`select.tsx`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/shadcn-demo/src/components/ui/select.tsx): the local integration around Radix primitives.
- [`src/components/ui/button.tsx`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/shadcn-demo/src/components/ui/button.tsx): variants use class-variance-authority; compositional rendering uses Radix Slot.
- [`src/index.css`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/shadcn-demo/src/index.css) and [`src/lib/utils.ts`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/shadcn-demo/src/lib/utils.ts): theme/layout and class composition.

## Reproduce and verify

From the repository root, with Node.js 22 and npm available:

```sh
npm ci --prefix shadcn-demo
npm run build --prefix shadcn-demo
node scripts/serve-showcase.cjs
```

Open `http://127.0.0.1:4173/shadcn-demo/`. Installation needs access to the locked npm packages, or a populated package cache. `npm ci` deliberately uses the checked-in lockfile rather than selecting fresh versions.

1. Search `Maya`, change the status filter, and confirm that both conditions affect the list. Use an unmatched search to inspect the empty state, then clear it.
2. Open an order, change its customer or status, save, and confirm the table and notice update. Reload: the session data returns to its seeded state.
3. Open the new-order dialog, inspect the fields, and close it. Its Create draft button shows a notice but does not append an order. The Export control also shows a notice rather than downloading a report; do not count either as a complete data flow.
4. Repeat at 1360×900 and 390×844. Navigate the dialog and Select with the keyboard; check visible focus, Escape, and the focus return after closing.

The build command runs `tsc -b` before Vite. The [existing implementation record](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/IMPLEMENTATION-NOTES.md) reports a successful TypeScript/Vite build and browser render at the baseline. The baseline Pages workflow also builds this example; it does not itself provide all of the manual interaction checks above.

## Limits and when to reconsider

The demonstrated data flow is filtering and editing existing session orders. New-order creation, report export, and advanced-filter controls are interface sketches with notices, not complete implementations. The example has no backend persistence, authorization, real order fulfillment, virtualized data grid, or exhaustive accessibility audit. Local ownership makes customization straightforward but makes copied-component fixes and updates the application's responsibility. Reconsider a fuller business system or specialist data table when the required component coverage, dataset, or organization-wide design constraints justify it. No comparative bundle-size, speed, or conversion result is asserted here.

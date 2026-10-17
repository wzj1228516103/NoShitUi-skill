# Library verification notes

Each dated snapshot below records official repository license files and npm registry metadata. Use [the library catalog](ui-libraries.md) for fit and tradeoffs, and [the website catalog](ui-websites.md) for source-available visual resources. Read this record when checking version constraints, API generations, or license provenance for these entries.

## 2026-10-16: Motion, primitives, and specialist interfaces

### Package snapshots

The versions below were the registry's `latest` tags at verification time. Publication dates are UTC, taken from each package's [npm registry metadata](https://registry.npmjs.org/). They are evidence of releases, not an instruction to upgrade an existing project. The linked version manifests contain the full peer dependency and engine declarations.

| Resource | Package / verified version | Published (UTC) | Compatibility observed in the manifest |
| --- | --- | --- | --- |
| Motion | [`motion` 14.3.0](https://registry.npmjs.org/motion/14.3.0) | 2026-10-15 | React adapter peers: React / React DOM 18 or 19; distinguish vanilla JavaScript APIs from `motion/react` |
| Reka UI | [`reka-ui` 2.11.0](https://registry.npmjs.org/reka-ui/2.11.0) | 2026-10-05 | Vue >=3.4.0 |
| Bits UI | [`bits-ui` 2.19.5](https://registry.npmjs.org/bits-ui/2.19.5) | 2026-10-03 | Svelte ^5.33.0; @internationalized/date ^3.8.1; Node.js >=20 |
| assistant-ui | [`@assistant-ui/react` 0.15.29](https://registry.npmjs.org/@assistant-ui/react/0.15.29) | 2026-10-15 | React / React DOM 18 or 19; matching type packages; select a compatible backend adapter separately |
| React Flow | [`@xyflow/react` 12.12.0](https://registry.npmjs.org/@xyflow/react/12.12.0) | 2026-09-24 | React / React DOM and their type packages >=17 |
| Svelte Flow | [`@xyflow/svelte` 1.7.0](https://registry.npmjs.org/@xyflow/svelte/1.7.0) | 2026-09-24 | Svelte ^5.25.0 |
| TanStack Table (React adapter) | [`@tanstack/react-table` 9.3.1](https://registry.npmjs.org/@tanstack/react-table/9.3.1) | 2026-10-12 | React >=18; Node.js >=20; inspect other framework adapters separately |

Recheck current releases, required browser/SSR behavior, and the components actually used before adoption. In particular, an existing TanStack Table v8 project needs version-matched documentation; this v9 snapshot does not justify a migration.

### License evidence

These commit identifiers pin the repository files inspected on the verification date. They are separate from the npm package release snapshots above; they do not imply that a repository HEAD and a published tarball are identical. All seven package manifests above declare MIT, and the corresponding repositories below have MIT core licenses.

| Resource | Repository commit inspected | License file |
| --- | --- | --- |
| Motion | `2d27b041114f5f1cffc1f6d3ad522929ce0cc41f` | [MIT](https://github.com/motiondivision/motion/blob/2d27b041114f5f1cffc1f6d3ad522929ce0cc41f/LICENSE.md) |
| Reka UI | `076a157bee3d510bfcdd3b8886fe3442865cfdf0` | [MIT](https://github.com/unovue/reka-ui/blob/076a157bee3d510bfcdd3b8886fe3442865cfdf0/LICENSE) |
| Bits UI | `fd10616a873a8e6e3652e31dcc88c5c2f155a9e2` | [MIT](https://github.com/huntabyte/bits-ui/blob/fd10616a873a8e6e3652e31dcc88c5c2f155a9e2/LICENSE) |
| assistant-ui | `ab3454dbee73ef652ea81db6d0b71189ad2e0e78` | [MIT](https://github.com/assistant-ui/assistant-ui/blob/ab3454dbee73ef652ea81db6d0b71189ad2e0e78/LICENSE) |
| React Flow / Svelte Flow | `654ba5a5e04f3404bc4db2eee88bfa15866d203d` | [MIT](https://github.com/xyflow/xyflow/blob/654ba5a5e04f3404bc4db2eee88bfa15866d203d/LICENSE) |
| TanStack Table | `95c4768496c07b45b1e65d8e33c3291ac66eae9b` | [MIT](https://github.com/TanStack/table/blob/95c4768496c07b45b1e65d8e33c3291ac66eae9b/LICENSE) |
| React Bits | `7381f14b15e8f9e00b01ce5b6ac4416f7ee360c4` | [MIT + Commons Clause License Condition v1.0](https://github.com/DavidHDev/react-bits/blob/7381f14b15e8f9e00b01ce5b6ac4416f7ee360c4/LICENSE.md) |
| Animate UI | `efeb96ffd7a3b7a4868667e4ac3c346620fb3044` | [MIT + Commons Clause License Condition](https://github.com/imskyleen/animate-ui/blob/efeb96ffd7a3b7a4868667e4ac3c346620fb3044/LICENSE.md) |

Preserve applicable MIT copyright/license notices when copying core code. Motion+, React Flow Pro examples, Assistant Cloud, and third-party assets have separate terms; the core repository license does not establish their reuse rights.

### Restricted visual resources

React Bits and Animate UI provide source, but their additional conditions mean they must not be labeled unrestricted MIT or treated as standard open-source dependencies. Their inspected license files permit use as part of an application, website, or product, including commercial use, subject to the stated conditions and notices:

- **React Bits:** the file prohibits selling, sublicensing, or redistributing the components themselves, whether alone, bundled, or ported.
- **Animate UI:** the file prohibits selling or redistributing the components themselves in their original form, whether alone or bundled. Its README's MIT badge/summary omits this extra condition; use the actual LICENSE.

The catalog links to these resources; it does not bundle their code. Check the exact component, dependency/asset terms, and intended distribution before copying. No npm version is asserted for these source-distribution entries; the commits above identify the license snapshots.

## 2026-10-17: Editors, forms, and interaction tools

### Package snapshots

The following packages were checked against their npm registry `latest` tags on this date. Publication dates are UTC. Each linked version manifest contains the complete peer, optional-peer, and engine declarations; this table summarizes the constraints relevant to selection.

| Resource | Package / verified version | Published (UTC) | Compatibility observed in the manifest |
| --- | --- | --- | --- |
| Tiptap core | [`@tiptap/core` 3.32.0](https://registry.npmjs.org/@tiptap/core/3.32.0) | 2026-10-13 | Requires the same `@tiptap/pm` version |
| Tiptap React adapter | [`@tiptap/react` 3.32.0](https://registry.npmjs.org/@tiptap/react/3.32.0) | 2026-10-13 | React / React DOM and their type packages 17, 18, or 19; core and pm 3.32.0 |
| Tiptap Vue adapter | [`@tiptap/vue-3` 3.32.0](https://registry.npmjs.org/@tiptap/vue-3/3.32.0) | 2026-10-13 | Vue ^3.0.0; @floating-ui/dom ^1.0.0; core and pm 3.32.0 |
| Lexical core | [`lexical` 0.52.0](https://registry.npmjs.org/lexical/0.52.0) | 2026-09-28 | Optional TypeScript peer >=5.2 |
| Lexical React adapter | [`@lexical/react` 0.52.0](https://registry.npmjs.org/@lexical/react/0.52.0) | 2026-09-28 | React / React DOM >=18.x; optional Yjs >=13.5.37 and TypeScript >=5.2 peers |
| dnd-kit current React adapter | [`@dnd-kit/react` 0.5.1](https://registry.npmjs.org/@dnd-kit/react/0.5.1) | 2026-10-15 | React / React DOM 18 or 19; uses the new package family |
| dnd-kit legacy React core | [`@dnd-kit/core` 6.3.1](https://registry.npmjs.org/@dnd-kit/core/6.3.1) | 2024-12-05 | React / React DOM >=16.8; separate legacy API, retained here to identify existing integrations |
| React Hook Form | [`react-hook-form` 7.90.0](https://registry.npmjs.org/react-hook-form/7.90.0) | 2026-10-11 | React ^16.8.0, 17, 18, or 19; @types/react peer; Node.js >=18.0.0 |
| TanStack Virtual (React adapter) | [`@tanstack/react-virtual` 3.14.21](https://registry.npmjs.org/@tanstack/react-virtual/3.14.21) | 2026-10-16 | React / React DOM ^16.8.0, ^17.0.0, ^18.0.0, or ^19.0.0; depends on virtual-core 3.19.6 |
| React DayPicker | [`@daypicker/react` 10.0.2](https://registry.npmjs.org/@daypicker/react/10.0.2) | 2026-09-30 | React >=16.8.0; optional @types/react >=16.8.0; Node.js >=18 |
| DayPicker compatibility package | [`react-day-picker` 10.0.2](https://registry.npmjs.org/react-day-picker/10.0.2) | 2026-09-30 | Same React, optional types, and Node.js constraints; includes date-fns ^4.1.0 and @date-fns/tz ^1.4.1 |

No Node.js engine range is declared in the inspected Tiptap, Lexical, dnd-kit, or TanStack Virtual manifests. That does not establish compatibility with every build runtime; inspect the target app and transitive packages before installation.

### License evidence

All package manifests in this batch declare MIT. The fixed repository commits below contain MIT licenses for the corresponding core projects. Repository HEAD snapshots and published package tarballs remain distinct evidence sources.

| Resource | Repository commit inspected | License file |
| --- | --- | --- |
| Tiptap | `93c377ca97ed2f783c05a7d45e1e99d339f8ac60` | [MIT core](https://github.com/ueberdosis/tiptap/blob/93c377ca97ed2f783c05a7d45e1e99d339f8ac60/LICENSE.md) |
| Lexical | `36189b5fccf5e6058fa18d47da67064eb54cef8f` | [MIT](https://github.com/facebook/lexical/blob/36189b5fccf5e6058fa18d47da67064eb54cef8f/LICENSE) |
| dnd-kit | `01bc678e93477e56a78aa2244c69b08a96cb0da6` | [MIT](https://github.com/clauderic/dnd-kit/blob/01bc678e93477e56a78aa2244c69b08a96cb0da6/LICENSE) |
| React Hook Form | `a5691d4e079403d36187fa81e38347e64cdaf55c` | [MIT](https://github.com/react-hook-form/react-hook-form/blob/a5691d4e079403d36187fa81e38347e64cdaf55c/LICENSE) |
| TanStack Virtual | `28ff2cab7a970f4e0908229d65a0da8803903900` | [MIT](https://github.com/TanStack/virtual/blob/28ff2cab7a970f4e0908229d65a0da8803903900/LICENSE) |
| React DayPicker | `1bfd4f0776d66f2242b6b32a1f084ab94e2702da` | [MIT](https://github.com/gpbl/react-day-picker/blob/1bfd4f0776d66f2242b6b32a1f084ab94e2702da/LICENSE) |

### Integration boundaries that affect selection

- **Tiptap:** the open-source editor and [`@tiptap/extension-collaboration` 3.32.0](https://registry.npmjs.org/@tiptap/extension-collaboration/3.32.0) are MIT. The collaboration extension requires Yjs ^13, @tiptap/y-tiptap ^3.0.7, and matching core/pm packages. The [official editor introduction](https://tiptap.dev/docs/editor/introduction) distinguishes open-source and paid extensions; the [repository README](https://github.com/ueberdosis/tiptap/blob/93c377ca97ed2f783c05a7d45e1e99d339f8ac60/README.md) identifies Hocuspocus as an open-source, self-hostable collaboration backend. Pro extensions, hosted Collaboration/Cloud, and commercial AI services have separate terms. Do not equate all collaboration with a paid service.
- **Lexical:** the [official introduction](https://lexical.dev/docs/intro) describes an editor framework whose layout, toolbars, menus, styling, and storage come from the application. Keep core, adapter, and feature packages version-aligned; use the optional Yjs peer when the selected collaboration features require it.
- **dnd-kit:** the [current React quickstart](https://dndkit.com/react/quickstart) uses `@dnd-kit/react` and identifies `@dnd-kit/core` / `@dnd-kit/sortable` as legacy APIs with a separate migration path. Use documentation matching the installed package family; the current adapter snapshot is 0.x, so assess API changes before standardizing. An existing core/sortable project does not need an automatic migration.
- **React Hook Form:** [the official guide](https://react-hook-form.com/get-started) covers registering native inputs and integrating controlled components. Retain the existing UI strategy, wire validation messages and focus behavior, and inspect optional resolver/schema-library packages separately. Server validation and persistence remain application responsibilities.
- **TanStack Virtual:** [the introduction](https://tanstack.com/virtual/latest/docs/introduction) describes headless virtualization. It limits rendered items; it supplies no complete list/table visual system or table sorting/filtering. Integrate measurement, item identity, focus handling, and SSR behavior, and measure the actual product before making performance claims.
- **DayPicker:** [the v10 upgrade guide](https://daypicker.dev/upgrading) and [getting-started guide](https://daypicker.dev/start) prefer `@daypicker/react` for new projects while retaining `react-day-picker` for compatibility. Removed v9 aliases/component slots and copied shadcn Calendar class mappings need review during an explicit upgrade. Non-Gregorian calendar add-ons have separate packages; inspect their manifests and terms independently. Date selection still needs application-specific text inputs, popovers, time controls, and booking rules where required.

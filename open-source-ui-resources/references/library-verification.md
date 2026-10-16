# Library verification notes

Verified on **2026-10-16** against the official repositories' license files and npm registry metadata. Use [the library catalog](ui-libraries.md) for fit and tradeoffs, and [the website catalog](ui-websites.md) for source-available visual resources. Read this record when checking version constraints or license provenance for these entries.

## Package snapshots

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

## License evidence

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

## Restricted visual resources

React Bits and Animate UI provide source, but their additional conditions mean they must not be labeled unrestricted MIT or treated as standard open-source dependencies. Their inspected license files permit use as part of an application, website, or product, including commercial use, subject to the stated conditions and notices:

- **React Bits:** the file prohibits selling, sublicensing, or redistributing the components themselves, whether alone, bundled, or ported.
- **Animate UI:** the file prohibits selling or redistributing the components themselves in their original form, whether alone or bundled. Its README's MIT badge/summary omits this extra condition; use the actual LICENSE.

The catalog links to these resources; it does not bundle their code. Check the exact component, dependency/asset terms, and intended distribution before copying. No npm version is asserted for these source-distribution entries; the commits above identify the license snapshots.

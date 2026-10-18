# Selection case studies

Three working examples show three different resource decisions: adopting source-owned components, keeping a bounded interaction native, and adding a specialist renderer.

| Case | Main choice | Reproducible task |
| --- | --- | --- |
| [SHADCN/OPS](shadcn-ops.md) | React + locally owned shadcn/ui components, Radix behavior, Tailwind styling | Filter an order, edit it in a dialog, and see the updated session record. |
| [NODE](node-native.md) | Original DOM/SVG editor and browser APIs; no added runtime package | Edit a small text-processing graph, validate it, run/cancel it, and export its structure. |
| [OBJECT](object-threejs.md) | Locally vendored Three.js r170 and two separately licensed CC0 models | Configure a lamp, inspect it in 3D, recover a failed preview, and verify the assembly correction. |

[Browse the public case index](https://wzj1228516103.github.io/NoShitUi-skill/case-studies.html) · [Explore all 20 demos](https://wzj1228516103.github.io/NoShitUi-skill/)

## How to read the evidence

- The source baseline is repository commit [`8912b22`](https://github.com/wzj1228516103/NoShitUi-skill/tree/8912b22). Detailed cases link to that immutable source; these new case documents use the `showcase-source` branch.
- Each task is written now to reproduce the existing result. It is **not** presented as the original user prompt or a transcript of the original selection process.
- Candidate tables are retrospective, source-based fit comparisons. They do not claim that every candidate was installed, measured, or tested against the adopted implementation.
- A lockfile version, a vendored revision, a copied component's source commit, and a catalog verification date are different kinds of evidence. Missing provenance is identified rather than filled in with a convenient upstream snapshot.
- Existing browser checks are reported as recorded local QA, with their scope and limits. Commands and manual steps describe how to repeat the checks; they are not a claim that every check runs in CI.

The canonical detailed writeups are the three Markdown files in this directory. The website intentionally keeps only summaries and links, so the rationale does not need to be maintained twice.

# NODE: a native editor for a deliberately small graph

[Live demo](https://wzj1228516103.github.io/NoShitUi-skill/node.html) · [Case index](README.md) · [Pinned implementation](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/node.js)

## Reproducible task

Create a visual text-processing workspace: load one of three examples, move nodes, edit parameters, connect output/input ports, validate the graph, run or cancel a local simulation, inspect the output, and save/export the graph. Keep the page deployable as independent static HTML with no build requirement.

This task reproduces the checked-in behavior. It is not the original prompt. The selection comparison is retrospective; no unrecorded framework migration or library benchmark is implied.

## Project constraints

- The surrounding showcase already uses independent static pages. NODE is not an existing React application that needs a graph component.
- There are six known node types: text source, clean up, summarize, read the tone, format text, and output.
- The stored graph is bounded to 30 nodes and 60 connections. Each input accepts one connection; source nodes cannot receive input, and output nodes cannot feed other nodes.
- All execution is deterministic JavaScript in this browser. “Summarize” selects the first complete sentences; tone uses a visible word-list rule. There is no model API, job server, or external service.
- A keyboard/touch alternative to pointer dragging is important: port buttons connect nodes, and focused nodes can be moved using arrow keys.

These constraints are visible in [`node.js`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/node.js), including `TYPES`, `TEMPLATES`, `sanitizePayload`, `validateGraph`, and `processNode`.

## Candidates and tradeoffs

| Strategy | Fit for this task | Decision and cost |
| --- | --- | --- |
| Original DOM cards + SVG connections + native controls | Fits the existing static runtime, fixed node model, and small graph. The implementation can focus on one complete, inspectable task. | Adopted. This project owns graph validation, interaction, rendering, focus, and storage behavior. “No added package” does not mean “no maintenance.” |
| React Flow (`@xyflow/react`) | A strong candidate when a React product needs a reusable, extensible node editor and a broader interaction model. | Not installed here. Introducing a framework and a general graph system is unnecessary for this bounded example; this is a fit judgment, not a measured bundle comparison. |
| A general diagram/canvas framework | Worth evaluating for diagram authoring, custom drawing, or much richer object manipulation. | Not adopted because this task is a six-type text pipeline rather than a general diagram editor. |

The [existing implementation notes](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/IMPLEMENTATION-NOTES.md) explicitly record React Flow as a considered specialist and the native implementation as the adopted source. The catalog's [dated verification record](../../open-source-ui-resources/references/library-verification.md) separately records a React Flow package/license snapshot. That record does not make React Flow an installed dependency of NODE.

## Adopted source and licenses

- [`node.html`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/node.html), [`node.css`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/node.css), and [`node.js`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/node.js) are original repository source, covered by the [repository MIT license](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/LICENSE).
- The initial implementation is included in [`f7b3308`](https://github.com/wzj1228516103/NoShitUi-skill/commit/f7b3308). The pinned baseline identifies the exact source to reproduce.
- No React Flow, Mantine, general canvas package, copied third-party graph code, or remote runtime resource is adopted for this page. The names above identify alternatives, not dependencies or bundled source.
- The graph, UI artwork, and deterministic processing rules are local original code. Browser APIs do not have an npm version to record.

## Follow the implementation

| Concern | Implementation evidence |
| --- | --- |
| Three runnable examples | `TEMPLATES`: digest and reviews have four nodes each; press has five. |
| Restore only bounded, known data | `sanitizePayload`: schema, IDs, coordinates, node/edge limits, allowed parameters and ports. |
| Topology and execution order | `validateGraph`: missing inputs/outputs, empty source, disconnected paths, input count, cycle detection, and topological order. |
| Actual local output | `processNode` and `runWorkflow`; execution results feed downstream nodes and the output panel. |
| Cancellation | A run token prevents delayed steps from continuing after cancellation. |
| Save/export | A versioned JSON payload with `simulation: true`; browser storage errors retain session usability and point to export. |
| Pointer and keyboard interaction | DOM node cards and port buttons in `node.html`/`node.js`; SVG connections are drawn separately. |

The save key is `node-flow-studio-v1`. Exported JSON describes this demo's graph model; it is not a promise of compatibility with another workflow product.

## Reproduce and verify

From the repository root:

```sh
node --check ui-atlas-demo/node.js
node scripts/serve-showcase.cjs
```

Open `http://127.0.0.1:4173/node.html`. No package installation or API credential is required.

1. Load **Editorial digest**. Press Validate, then Run workflow. Confirm four steps complete and the output includes the configured heading and sentence-based formatting.
2. Load **Review signals**, run it, and inspect the explicit positive/negative word signal. Change the source text and rerun; the output must reflect the change.
3. Load **A little press note** and run its five steps. Start again and cancel during the simulated delay. The log should stop; the workflow should remain editable.
4. Select an output port, then an input port to connect or reconnect. Try a self-connection or returning connection; inspect rejection or validation feedback. Remove a required connection and confirm validation prevents a run.
5. Save, reload, and confirm the graph restores. Export JSON and inspect `version`, `simulation`, nodes, and connections. In a separate test profile, block browser storage and confirm the graph remains usable with a save failure message.
6. Repeat at 1360×900 and 390×844. Use the mobile panels, Tab through ports, move a focused node with arrow keys, and inspect reduced-motion behavior.

The [baseline implementation record](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/IMPLEMENTATION-NOTES.md) records local Edge/Playwright checks for movement, parameters, templates, execution/cancellation, graph export, topology, mobile panels, corrupted storage, and disabled storage. These are recorded local checks; the baseline does not contain an equivalent browser CI suite.

## Boundary: when native is no longer the small choice

Revisit a specialist graph library when the real product needs large graphs, grouping/subflows, richer selection, many custom ports, robust pan/zoom, minimaps, more extensive undo/history, reusable plugins, or a React integration contract. Collaboration, durable execution, secrets, permissions, and server scheduling need an application/backend architecture beyond either this native demo or a frontend graph library. No throughput, graph-size performance, or accessibility certification is claimed for NODE.

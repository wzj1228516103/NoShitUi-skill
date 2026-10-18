# OBJECT: a specialist renderer with separately licensed model assets

[Live demo](https://wzj1228516103.github.io/NoShitUi-skill/object.html) · [Case index](README.md) · [Pinned source](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/object-preview.js)

## Reproducible task

Create a lamp configuration study with two inspectable 3D models, three finishes, brightness and accessory controls, a synchronized configuration/price summary, and a copyable specification. Preserve useful configuration controls when a model or WebGL preview fails. Keep the models and renderer local to the static site.

This task reproduces the checked-in example. It is not a recovered original prompt. Candidate comparisons explain the present implementation; no unrecorded performance test or original decision transcript is asserted.

## Project constraints

- The product configuration is ordinary page state. The 3D renderer is a specialist view of that state, not the owner of the whole interface.
- The two source models use glTF/GLB. A viewer must load their geometry, manage materials and light, support orbit inspection, and dispose obsolete GPU resources.
- Material/brightness changes should affect the visible object while the text summary stays synchronized.
- Static hosting should not require a model service, runtime model CDN, server rendering, or an external decoder.
- The task-lamp source has disconnected parts. Visual reuse therefore also requires a verifiable local assembly correction rather than silently treating the downloaded asset as correct.

## Candidates and tradeoffs

| Strategy | Fit for the task | Decision and cost |
| --- | --- | --- |
| Native controls + Three.js | Separates normal configuration UI from model loading, materials, lighting, and orbit controls. Fits an existing static page. | Adopted. The repository owns renderer lifecycle, failure behavior, and model-specific corrections. |
| Static SVG/CSS or rendered product images | Useful for a lightweight configuration summary with a small number of pre-rendered views. | Would not provide free orbit inspection of the real model or dynamically relight its geometry. It remains a useful fallback direction. |
| A React renderer wrapper | Reasonable inside an existing React scene/application with component-driven 3D state. | This standalone page has no React runtime to integrate with. No wrapper prototype or runtime benchmark is recorded. |

The primary interface strategy stays native HTML/CSS/JavaScript. Three.js is added for one clear gap: interactive glTF rendering. A UI component catalog alone would not supply that capability.

## Exact renderer source and license

- The vendored core declares `REVISION = '170'`: [`vendor/three/three.module.js`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/vendor/three/three.module.js).
- Adopted add-ons are `OrbitControls.js`, `GLTFLoader.js`, `BufferGeometryUtils.js`, and `RoomEnvironment.js` in the same directory. `GLTFLoader` has one relative import adapted to this local layout.
- The recorded upstream is [Three.js r170](https://github.com/mrdoob/three.js/tree/r170). The [local MIT license](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/vendor/three/LICENSE) preserves the 2010–2024 Three.js authors' notice.
- [`object.html`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/object.html) maps `three` to the local vendored module and imports the preview after the HTML controls are connected. There is no npm lockfile for this renderer path; its exact reproducible source is the vendored tree at the pinned repository commit.

## Model assets are a separate decision

The renderer's MIT license does not license the model geometry or embedded images. The two Innerscene assets have separate CC0 1.0 declarations, recorded as verified on 2026-10-14 in [`assets/models/SOURCES.md`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/assets/models/SOURCES.md), with the [CC0 text](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/assets/models/CC0-1.0.txt).

| Adopted local file | Recorded source | Bytes / SHA-256 |
| --- | --- | --- |
| `desk-lamp.glb` | [Balance — Articulated Task Lamp](https://www.innerscene.com/tools/library/3d-parts/balance-articulated-task-lamp-07158a25) | 258212 / `488c3803d6c8438549e1d58bba80d532178937471a93437866f70f9e076acc03` |
| `table-lamp.gltf` | [Table lamp](https://www.innerscene.com/tools/library/3d-parts/table-lamp-gltf-3ade01d1) | 119121 / `a21c2d4e8146e8d7437abc82e26c902c4579e33d85da0855822a3de2984fb19f` |

The original downloaded bytes remain unchanged. Preview materials, display scale, accessories, and the task-lamp correction are applied at runtime. The task model has no animated arm rig. These are dated provenance records, not a fresh assertion about an external website's present terms.

## Follow the implementation

- [`object.html`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/object.html): model/finish/brightness controls, fictional price estimate, configuration summary, copy action, renderer boot, and failure/retry UI.
- [`object-preview.js`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/object-preview.js): GLTFLoader, lighting/environment, orbit controls, material application, asynchronous load generations, error recovery, and GPU disposal. Intersection/document visibility and reduced-motion settings gate rendering; these mechanisms are not a measured performance score.
- [`object-lamp-assembly.js`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/ui-atlas-demo/object-lamp-assembly.js): rigid alignment of the existing springs plus local connecting pins/sockets and pedestal support. The change is documented in commit [`82cf8f2`](https://github.com/wzj1228516103/NoShitUi-skill/commit/82cf8f2).
- [`scripts/check-lamp-assembly.mjs`](https://github.com/wzj1228516103/NoShitUi-skill/blob/8912b22/scripts/check-lamp-assembly.mjs): numeric checks reconstruct real glTF accessor/TRS data without WebGL and exercise original and transformed parent hierarchies.

## Reproduce and verify

From the repository root, with Node.js available:

```sh
node --check ui-atlas-demo/object-preview.js
node --check ui-atlas-demo/object-lamp-assembly.js
node scripts/check-lamp-assembly.mjs
node scripts/serve-showcase.cjs
```

Open `http://127.0.0.1:4173/object.html` in a WebGL-capable browser. No package installation or model download is required for this local preview.

1. Switch TASK/TABLE, choose each finish, change brightness and accessories, and confirm the model, estimate, and summary stay in agreement. Copy the specification and inspect its content.
2. Orbit/zoom around both models. On the task lamp, inspect spring seating, pins/sockets, and the base support from more than the default camera angle.
3. In browser developer tools, block a local model request and retry. The failure UI should provide retry/alternate-model controls while normal configuration remains available. Restore requests and retry again.
4. Repeat at 1360×900 and 390×844. Exercise keyboard focus and reduced-motion settings; test WebGL-unavailable/context-loss behavior separately where the browser allows it.
5. Run the numeric assembly command independently. It covers terminal/socket seating, rail clearance, cross-pin intersections, pedestal continuity, unchanged joints, rigid geometry preservation, and repeat initialization. It does not inspect aesthetic lighting or replace browser checks.

The baseline's model source record describes numeric and browser check scopes. These reproducible commands are distinct from CI coverage: the baseline Pages workflow does not run the assembly regression or a browser suite automatically.

## Limits and when to reconsider

Prices and accessory variations are fictional display studies. There is no manufacturing model, real stock, checkout, articulated arm animation, or guaranteed photometric accuracy. WebGL/GPU availability varies. The local assembly correction is specific to the pinned task model; replacing the asset requires measuring and validating it again. An accessibility audit, performance budget on target devices, and a production commerce/backend design would be separate work.

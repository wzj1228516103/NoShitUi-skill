# OBJECT lamp assets

Both files are hosted locally with the showcase. No model CDN or decoder is needed at runtime.

## Balance — Articulated Task Lamp

- Author: Innerscene (original model).
- File: `desk-lamp.glb` (original download filename: `anglepoise-task-lamp.glb`).
- Source: https://www.innerscene.com/tools/library/3d-parts/balance-articulated-task-lamp-07158a25
- Download: https://www.innerscene.com/api/library/balance-articulated-task-lamp-07158a25/download
- License: CC0 1.0 Universal, explicitly declared on the asset page.
- Retrieved and verified: 2026-10-14.
- Bytes: 258212.
- SHA-256: `488c3803d6c8438549e1d58bba80d532178937471a93437866f70f9e076acc03`.
- Original glTF 2.0 geometry and five embedded image resources are unmodified; the bytes and hash above still identify the original download. Preview materials, brightness, display scale, and optional accessories are applied at runtime. The static model has no animated arm rig.
- Local assembly correction (2026-10-16): `../../object-lamp-assembly.js` rigidly aligns the two existing spring meshes with the lower linkage, using their measured wire end caps and the base/elbow pivot centers. Original spring length, coil geometry, and wire thickness are preserved. Two cross-pins and four terminal sockets connect the springs to the rails; a pedestal fills the source model's gap between the base and lower pivot. The head, upper links, existing pivots, and table lamp are unchanged. The correction runs once per freshly loaded task model before preview normalization.
- Numeric regression: `node scripts/check-lamp-assembly.mjs` validates terminal/socket seating, spring-to-rail clearance, cross-pin intersections, pedestal continuity, unchanged original joints, rigid geometry preservation, and repeated initialization under both the original hierarchy and a rotated/translated parent. Browser checks separately cover model switching, materials, retry, and orbit views.

## Table lamp

- Author: Innerscene.
- File: `table-lamp.gltf`.
- Source: https://www.innerscene.com/tools/library/3d-parts/table-lamp-gltf-3ade01d1
- Download: https://www.innerscene.com/api/library/table-lamp-gltf-3ade01d1/download
- License: CC0 1.0 Universal, explicitly declared on the asset page.
- Retrieved and verified: 2026-10-14.
- Bytes: 119121.
- SHA-256: `a21c2d4e8146e8d7437abc82e26c902c4579e33d85da0855822a3de2984fb19f`.
- Original glTF 2.0 geometry is unmodified. All buffers are embedded; the model does not require textures. Preview materials, brightness, display scale, and optional accessories are applied at runtime.

CC0 text: [CC0-1.0.txt](CC0-1.0.txt), obtained from https://creativecommons.org/publicdomain/zero/1.0/legalcode.txt. Source terms: https://www.innerscene.com/tools/library/terms. These assets may be used, modified, and redistributed without attribution under their source's CC0 dedication. The attribution here is retained for provenance.

Three.js r170 and its addons are covered separately by the MIT notice in `../../vendor/three/LICENSE`.

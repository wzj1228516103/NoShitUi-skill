# ARCHIVE artwork and metadata

Five selected images and object facts were fetched from The Metropolitan Museum of Art's official Collection API on 2026-10-15. Each adopted record returned `isPublicDomain: true` and a downloadable primary image. Their exact object page, API URL, original image URLs, artist, date, dimensions, credit line, and local filename are pinned in `collection.json`.

The museum's [Open Access policy](https://www.metmuseum.org/hubs/open-access) makes eligible public-domain collection images and basic data available under [CC0](https://creativecommons.org/publicdomain/zero/1.0/). See the [official API documentation](https://metmuseum.github.io/). The pictures are optimized to WebP for local display. No live museum request is required to view or export the exhibition.

| Object ID | Artist | Title |
| --- | --- | --- |
| 437329 | Nicolas Poussin | The Abduction of the Sabine Women |
| 436121 | Edgar Degas | A Woman Seated beside a Vase of Flowers (Madame Paul Valpinçon?) |
| 435882 | Paul Cézanne | Still Life with Apples and a Pot of Primroses |
| 436524 | Vincent van Gogh | Sunflowers |
| 436535 | Vincent van Gogh | Wheat Field with Cypresses |

Original viewing prompts, layout, UI, and exhibition export code were written for this repository. They are not museum curatorial descriptions. The museum name is used for attribution only; ARCHIVE is an independent concept with no museum affiliation.

One considered Monet object (437127) did not meet the current API's public-domain/image eligibility checks and was excluded. `scripts/prepare-archive-assets.py` enforces eligibility before saving any adopted image.

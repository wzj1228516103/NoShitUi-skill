---
name: noshit-ui-skill
description: Discover, compare, and integrate open-source UI libraries, components, templates, and design references into web interfaces. Use when a user asks for UI inspiration, a reusable component strategy, a UI stack comparison, or a reference-inspired screen.
metadata:
  short-description: Discover and integrate open-source UI resources
---

# NoShit UI Skill

Use this skill to turn a UI request into a clear visual direction, a license-aware resource shortlist, and the smallest coherent implementation that proves the direction.

## Route the request

1. Identify whether the user wants discovery, project-specific recommendation, or implementation.
2. For inspiration and website discovery, read [the UI website catalog](open-source-ui-resources/references/ui-websites.md).
3. For library comparison or implementation, read [the UI library catalog](open-source-ui-resources/references/ui-libraries.md) and the relevant parts of [selection and adoption](open-source-ui-resources/references/selection-and-adoption.md).
4. Inspect the project's framework, package manager, styling system, runtime, and existing component/icon packages before choosing a stack.

For animation, AI chat, node editors, data tables, rich-text editing, forms, drag-and-drop, calendars, or large-list rendering, use the library catalog's specialist sections. For Vue or Svelte with a custom visual language, compare framework-native headless primitives before adding another styled system. Consult [the dated verification notes](open-source-ui-resources/references/library-verification.md) for package constraints, API generations, and restricted visual resources.

## Make a recommendation

- Recommend one primary component strategy and at most one supporting icon strategy.
- Choose a styled system for broad dashboards and CRUD-heavy products; choose headless or source-owned primitives when the visual language and markup need to remain distinctive.
- Treat galleries and showcase sites as inspiration. Use an official repository, package, or component source when the user asks for reusable code.
- Verify the current package version, peer dependencies, license, runtime/SSR behavior, theme and token model, accessibility behavior, and maintenance signals before adoption.
- Read the actual LICENSE for additional conditions; a README badge or package's MIT label can omit redistribution restrictions. Keep source-available resources with such restrictions distinct from unrestricted open-source libraries.
- Explain the fit, the main tradeoff, and the exact packages or source files that will be used.

## Implement and verify

- Implement only after the user asks for implementation.
- Make the smallest coherent integration that proves the direction and preserves existing project conventions.
- Verify relevant type, build, and lint checks. Inspect the rendered result at desktop and mobile sizes when a browser is available.
- Test keyboard/focus behavior and meaningful loading, empty, disabled, and error states for interactive components.
- For copied or installed resources, record the source URL, package/version or commit, license/terms status, and attribution or notice action.

## Catalog maintenance

When changing the catalog, verify official sources and run:

```bash
python open-source-ui-resources/scripts/check_catalog.py
```

Use `--check-links` when network access is available. Blocked or rate-limited links are unverified, not proof that a resource is dead.

## Scope

Do not copy a reference site's distinctive branding, text, images, fonts, icons, or complete composition. Translate useful interaction and layout patterns into the user's product and design system. Keep inspiration, code, and third-party assets as separate provenance decisions.


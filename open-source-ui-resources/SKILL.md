---
name: open-source-ui-resources
description: Discover, compare, and integrate open-source UI libraries, components, templates, and design references into web applications. Use when a user asks for UI inspiration, wants a reusable open-source component added, needs a UI stack compared, or wants an existing interface rebuilt from a reference.
metadata:
  short-description: Discover and integrate open-source UI resources
---

# Open-source UI resources

Use this skill to discover useful UI references and component resources, or to select and implement a suitable resource in the user's project. A discovery-only request should end with recommendations; it does not imply permission or intent to change project files.

## Workflow

1. Identify the request mode before inspecting a project: discovery/reference research, project-specific recommendation, or implementation.
2. For discovery/reference research, read [references/ui-websites.md](references/ui-websites.md) and give a concise categorized shortlist. Do not inspect or modify a project unless the user asks for a project-specific recommendation or implementation.
3. For project-specific recommendations or implementation, inspect the framework and version, router, styling system, package manager, SSR/build setup, existing component/icon packages, and whether a full design system or only primitives are needed. Read [references/ui-libraries.md](references/ui-libraries.md) and the relevant sections of [references/ui-websites.md](references/ui-websites.md). For a consequential library choice, also read [references/selection-and-adoption.md](references/selection-and-adoption.md).
4. Treat catalog license labels as a starting point. Verify the current official repository, package metadata, and page-specific terms before adding or copying anything.
5. Ask only for a missing product constraint that changes the recommendation. Useful constraints are framework, need for SSR/RSC, visual direction, accessibility requirements, bundle-size sensitivity, and whether copy/paste source ownership is preferred.
6. Recommend one primary component strategy and at most one supporting icon strategy. Explain the fit, the main tradeoff, and the packages or source files that will be used. Do not combine multiple CSS resets or full component systems without a concrete reason.
7. Before implementation, check peer dependencies, license compatibility, tree-shaking/SSR behavior, theme and token customization, keyboard/focus behavior, RTL/localization needs, and whether the project already has conflicting styles. Follow [references/selection-and-adoption.md](references/selection-and-adoption.md) for the decision record and verification scope.
8. Implement only when requested. Make the smallest coherent integration: install packages using the project's existing package manager, add provider/theme setup only where required, add one representative component or screen, and preserve the project's existing conventions.
9. Verify with the project's available checks. At minimum, run the type/build/lint checks relevant to the change and inspect the rendered result at desktop and mobile sizes when a browser is available. Report checks that could not be run.

## When the user provides a URL

- Identify whether the URL is an official package/repository, a component source page, a design file, a showcase, or a third-party repost.
- Use the official source for code and metadata. Do not infer that code, screenshots, fonts, images, icons, or brand assets share one license.
- For a package, inspect its manifest, peer dependencies, export/runtime constraints, and current version. For copied source, record the source URL, commit/tag or release, component name, and license in the project.
- If the license or terms cannot be verified, label the resource "terms unverified" and use it only as inspiration until the user confirms permission.

## Maintaining the catalog

- When adding or changing catalog entries, verify the official source and license/terms manually, then run `python scripts/check_catalog.py` to catch broken local references and malformed entries.
- Run `python scripts/check_catalog.py --check-links` when network access is available. Treat blocked, rate-limited, and timed-out results as unverified, not as proof that a site is dead. Link reachability does not validate license claims or maintenance quality.

## Selection rules

- Prefer a framework-native library when the project already has a clear framework.
- Choose a complete styled system for dashboards and CRUD-heavy products that need many consistent components quickly.
- Choose headless or unstyled primitives when the product needs a distinctive visual language, strict markup control, or a small CSS surface.
- Choose CSS/utility libraries when the team wants to compose most of the UI itself and accepts responsibility for component behavior and accessibility.
- Use inspiration galleries to study patterns, not as dependency sources. Mobbin, Page Flows, Dribbble, Awwwards, and similar sites may show work that is not open source or licensed for reuse.
- Prefer an official repository, package, or component source page when the user asks for code. A visual showcase alone is not evidence that its code, images, fonts, or brand assets may be copied.
- Treat "free", "copy/paste", "MIT", and "open source" as different claims. Verify the exact license and any attribution or commercial-use restriction for the resource being used.
- Do not call a catalog entry fully open source when it combines open-source code with paid templates, hosted demos, community uploads, or separately licensed assets.
- Treat accessibility as an implementation criterion, not a marketing label. Confirm keyboard navigation, focus management, screen-reader semantics, and disabled/loading/error states in the actual components used.
- A source-based/copy-paste library still carries transitive dependency and license obligations. Review every copied component and keep its provenance in the project.
- Do not claim a library is actively maintained from memory. Check recent releases, open issues, framework support, and the official documentation at the time of use.
- Separate observed facts from judgments: cite the project manifest/release/docs for version and license claims, and label subjective fit or incomplete evidence clearly.
- Do not copy a reference site's distinctive branding, text, images, or complete composition. Translate the useful interaction/layout pattern into the user's product and design system.

## Output shape

For a discovery request, group results into inspiration, open-source components/templates, and component/pattern catalogs. Include the site's purpose, whether it supplies reusable code, license/terms status, and official link. Mark resources that are inspiration-only or have per-item licensing.

For a comparison request, return a short ranked shortlist and a table with: ecosystem, styling model, strongest use case, notable tradeoff, license, and official link. End with a concrete recommendation for the user's stated project.

For an implementation request, state the selected stack and reason first, then make the smallest code change that proves it works. Summarize the relevant validation and mention any license or dependency follow-up that remains.

For every copied or installed resource, leave a concise provenance record in the response: source URL, package/version or commit when available, license/terms status, and any attribution or notice action required.


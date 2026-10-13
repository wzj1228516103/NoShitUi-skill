# UI resource selection and adoption

Use this guide when selecting a library for a real project or integrating copied/package-based components. Keep discovery-only answers lightweight.

## Eliminate poor fits first

Reject or defer a candidate when any of these is true:

- It does not support the project's framework/runtime/version, or SSR/RSC behavior is incompatible with the target app.
- Its license or the relevant component/template/asset terms cannot be verified for the intended use.
- It duplicates an existing full component system, introduces conflicting resets/global styles, or requires a migration the user did not request.
- A required product component, accessibility behavior, localization, RTL, or mobile interaction is missing and would need substantial custom reimplementation.
- It is archived, incompatible with supported framework versions, or has unresolved security/maintenance concerns that materially affect the project.

If evidence is incomplete, say so and recommend a lower-risk candidate or keep the resource as inspiration only.

## Compare surviving candidates

Use these criteria in order. Do not produce a numeric score unless the user asks for one; explain the evidence and tradeoff in plain language.

| Criterion | Evidence to inspect |
| --- | --- |
| Project fit | Framework support, version range, SSR/RSC and browser requirements, package manager compatibility |
| Required coverage | Components the product actually needs, such as data grid, date/time, upload, command menu, charts, or navigation |
| Integration cost | Peer dependencies, provider/theme setup, CSS reset/global styles, bundle impact, migration and upgrade burden |
| Product control | Token/theming support, markup control, source ownership, customization without brittle overrides |
| Accessibility and localization | Keyboard/focus behavior, semantics, screen reader support, RTL/locales, reduced motion |
| License and provenance | Package license plus separate terms for copied source, templates, fonts, images, icons, and examples |
| Maintenance evidence | Recent compatible releases, documented support policy, issue/PR activity, security advisories |

Recommend one primary system. Add a headless primitive, animation package, or icon set only when it fills a concrete gap. State why the closest alternative was not selected when the decision is consequential.

## Integration sequence

1. Confirm the exact official package or source and inspect its current version, manifest, peer dependencies, license, and runtime constraints.
2. Use the repository's current package manager and preserve its lockfile. Avoid broad dependency upgrades while adding a UI resource.
3. Integrate tokens, theme/provider, and CSS in the existing styling architecture. Do not add a second reset or global typography layer without checking its effect on the whole app.
4. Implement one representative component or user flow first. Preserve the app's routing, data contracts, naming, and component conventions.
5. If source is copied or generated into the repository, add/update a concise `THIRD_PARTY_UI.md` unless the project already has a suitable third-party notices or attribution file. Include the source URL, package/version or commit, component/template name, license/terms, modifications, and required notices. Do not add this file for inspiration-only references.
6. Check the diff for unrelated formatting, lockfile churn, duplicated styles, unused packages, copied demo content, and assets that do not have verified reuse rights.

Suggested provenance entry:

```markdown
| Resource | Source | Version/commit | License/terms | Changes | Required notice |
| --- | --- | --- | --- | --- | --- |
| Button component | https://... | vX.Y.Z or commit SHA | MIT (verified YYYY-MM-DD) | Adapted tokens and variants | Preserve LICENSE notice |
```

## Verification checklist

Run checks that match the changed surface; do not claim a check passed unless it ran.

- Static: the project's typecheck, lint, and production build where available.
- Responsive: inspect at least one narrow mobile width and one desktop width; verify no overflow, clipped menus, or unusable touch targets.
- Interaction: exercise keyboard-only navigation, visible focus, dialogs/popovers, disabled/loading/error/empty states, and form validation where relevant.
- Accessibility: check semantic names/labels, heading order, contrast in relevant themes, focus return, reduced motion, and screen-reader behavior for custom interactions.
- Visual: compare against the user's requested reference or established project tokens. Report material deviations and inspect screenshots when browser tooling is available.
- Regression: verify neighboring pages/components affected by global CSS, providers, or theme changes.

For a component-only change, run only the checks that cover that change. If visual/browser checks are unavailable, state that limitation and complete the available static checks.


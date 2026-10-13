# NoShitUi-skill

[简体中文](README.md) · English · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md)

> A Codex Skill for discovering, comparing, and integrating open-source UI resources. Understand the interface's intent first, then choose resources and implement a small, verifiable change.

**Less Shit UI, More Intentional Interfaces.**

## What the Skill does

NoShitUi-skill helps avoid rework caused by mixing component libraries, templates, and snippets without clear selection criteria. It connects the project's constraints to a coherent component strategy, interaction behavior, and source records.

Its workflow has four stages:

1. **Discover**: distinguish inspiration sites from reusable component source, UI libraries, icons, charts, and templates.
2. **Compare**: consider the framework, runtime, component coverage, accessibility, theming, bundle size, licenses, and maintenance evidence.
3. **Integrate**: choose one primary component strategy and implement a representative page or user flow with minimal changes.
4. **Verify**: check responsive layouts, keyboard focus, interaction states, builds, and the origins of third-party resources.

Define the interface's intent before choosing resources, and establish visual rules before copying components. Keep one primary component strategy; add supporting resources only for a specific gap. Check interaction and mobile behavior alongside visual appearance.

## Install

```bash
npx skills add https://github.com/wzj1228516103/NoShitUi-skill -g -a codex -y
npx skills list -g -a codex
```

The installed Skill is named `noshit-ui-skill`. Reopen Codex, then describe your interface goal in natural language or invoke it explicitly:

```text
$noshit-ui-skill
```

## Usage examples

```text
Compare MUI, Mantine, and shadcn/ui for this React admin application. Consider SSR, accessibility, bundle size, and theme customization, then implement a representative table page.
```

```text
I only need inspiration; do not change the code. Recommend UI sites for SaaS landing pages, mobile onboarding, and data dashboards, and identify which are reference material only.
```

For selection tasks, inspect the existing stack and dependencies first. For implementation, record compatibility, integration costs, theme and source control, accessibility requirements, licenses, and maintenance evidence. Resource discovery alone does not authorize installing dependencies or copying code.

## Resources

| Document | Purpose |
| --- | --- |
| [SKILL.md](SKILL.md) | Installable Skill entry point and workflow |
| [UI libraries](open-source-ui-resources/references/ui-libraries.md) | Component options organized by framework and purpose |
| [UI websites](open-source-ui-resources/references/ui-websites.md) | Inspiration, components, and interface patterns |
| [Selection and adoption](open-source-ui-resources/references/selection-and-adoption.md) | Criteria for choosing and integrating resources |

Inspiration sites help study hierarchy, flows, spacing, states, and responsive behavior. Reusable code must come from an official repository, package, or a page that explicitly provides source code. Confirm the terms for code, images, fonts, icons, and brand assets separately.

## Output previews

The Skill can turn resource choices into runnable pages with different visual directions. These examples show possible results; the project remains focused on resource discovery, selection, integration, and verification.
[Explore the examples](https://wzj1228516103.github.io/NoShitUi-skill/) · [View their source](https://github.com/wzj1228516103/NoShitUi-skill/tree/showcase-source/ui-atlas-demo)

## Validation and maintenance

After updating the catalog, run:

```bash
python open-source-ui-resources/scripts/check_catalog.py
```

Use `--check-links` when network access is available. Blocked, rate-limited, or timed-out links are **unverified**, not automatically broken. For a real integration, also run the project's typecheck, lint, and build, and check desktop/mobile layouts, focus, dialogs, loading/empty/error states, and reduced motion.

## Scope and licensing

The Skill supports inspiration research, component selection, design comparisons, prototypes, and small integrations. It does not replace a formal accessibility audit, license review, brand permission, performance testing, or release approval. If official sources, versions, or terms cannot be confirmed, keep the resource as inspiration until the evidence is available.

Original Skill content uses the [MIT License](LICENSE). Third-party projects, remote resources, and copied components retain their own licenses or site terms; “free,” “copyable,” “MIT,” and “open source” are not interchangeable. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for source notices. This project is not an official product of the listed projects and is not endorsed by them.

Issues and improvement suggestions are welcome.

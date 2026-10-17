# Curated open-source UI library catalog

This is a practical shortlist, not an exhaustive registry. Names and license labels are based on the projects' public repositories and documentation; confirm the current license, package version, peer dependencies, and maintenance status before adoption. A library's dependencies can have separate licenses.

See the [library verification record](library-verification.md) for dated version, license, dependency, and maintenance evidence for the latest additions.

## Quick selection map

| Need | Good starting points | Why |
| --- | --- | --- |
| React product with a broad, styled component set | MUI, Ant Design, Mantine, Chakra UI | Fast delivery, theming, forms/layout/data-display coverage |
| React with source ownership and a custom visual language | shadcn/ui + Radix UI, or Base UI | Components live in the app; high control over markup and CSS |
| React primitives with strong interaction/accessibility foundations | Radix UI, React Aria, Headless UI | Behavior and semantics without committing to a visual theme |
| React design-system compliance | Fluent UI, React Spectrum | Enterprise patterns, tokens, accessibility and platform guidance |
| Vue 3 enterprise/admin product | Element Plus, Naive UI, Arco Design Vue, PrimeVue | Broad business components and mature Vue integration |
| Vue 3 with a custom visual system | Reka UI | Unstyled interaction primitives without adopting an enterprise theme |
| Vue 3 Material-style product | Vuetify | Integrated Material Design system and theming |
| Vue app with a full framework/toolkit | Quasar | UI components plus app tooling and multi-platform targets |
| Svelte app | Skeleton, Bits UI, Melt UI, shadcn-svelte | Svelte-native theming, unstyled components, builders, or source-owned components |
| CSS-first or framework-agnostic markup | Bootstrap, Bulma, Pico CSS, Tailwind CSS + daisyUI | Useful when the team owns composition and markup |
| Custom motion and interaction | Motion | Animation, gestures, layout transitions, and scroll effects alongside the primary UI system |
| React AI chat or assistant interface | assistant-ui | Chat primitives and runtime integration for streaming responses, threads, and tools |
| React or Svelte node-based editor | React Flow / Svelte Flow | Interactive nodes, edges, connections, and viewport controls |
| Custom data-table UI | TanStack Table | Headless table state and row models while the app controls markup and styling |
| Rich-text or document editor | Tiptap, Lexical | Editor state and extensibility beneath an application-owned editing interface |
| Sortable lists, kanban, or custom drag interactions | dnd-kit | Input sensors, drop targets, and sorting behavior while the app owns its data model |
| React form state and validation | React Hook Form | Field registration, validation, errors, and submission state alongside the chosen controls |
| Long scrolling lists or grids | TanStack Virtual | Headless windowing while the app controls markup, measurements, and focus behavior |
| React date or date-range selection | React DayPicker | Focused calendar selection, localization, and time-zone support |
| Icons | Lucide, Heroicons, Tabler Icons, Phosphor | Keep icons consistent and avoid hand-drawn SVGs |
| Data visualization | Apache ECharts, Recharts, Nivo | Choose based on chart breadth, React integration, and output control |

## React: styled systems

| Library | Model | Strengths | Tradeoffs | License | Official source |
| --- | --- | --- | --- | --- | --- |
| MUI | Styled React component system | Very broad catalog, theming, documentation, ecosystem | Larger abstraction and CSS/runtime decisions; Material defaults can show through | MIT | https://github.com/mui/material-ui |
| Ant Design | Styled React component system | Excellent admin, table, form, date-picker, and enterprise coverage | Opinionated visual language and relatively large surface | MIT | https://github.com/ant-design/ant-design |
| Mantine | Styled React component system | Modern API, hooks, theming, forms, dates, notifications | Requires choosing Mantine conventions across the app | MIT | https://github.com/mantinedev/mantine |
| Chakra UI | Styled component system | Composable APIs, theme tokens, accessible defaults | Version-specific styling and provider migration need attention | MIT | https://github.com/chakra-ui/chakra-ui |
| PrimeReact | Styled component system | Large catalog, data-heavy controls, multiple themes | More opinionated and less minimal for small products | MIT | https://github.com/primefaces/primereact |
| Fluent UI | Microsoft design-system implementation | Fluent tokens, enterprise patterns, good React coverage | Best fit when Fluent is an intentional product direction | MIT | https://github.com/microsoft/fluentui |
| HeroUI | Styled React component system | Polished modern defaults, Tailwind-oriented customization | Smaller ecosystem and stronger dependency on its chosen stack | MIT | https://github.com/heroui-inc/heroui |

## React: headless, unstyled, or source-owned

| Library | Model | Strengths | Tradeoffs | License | Official source |
| --- | --- | --- | --- | --- | --- |
| shadcn/ui | React component source added to your app, styled with Tailwind | Full source ownership, fast customization, buttons/forms/dialogs and product UI | You own upgrades, fixes, accessibility review, and copied source provenance | MIT for the repository; review each dependency | https://github.com/shadcn-ui/ui |
| Radix UI | Unstyled React primitives | Strong primitives for dialogs, menus, popovers, navigation, and focus behavior | You must design and maintain the visual system | MIT | https://github.com/radix-ui/primitives |
| React Aria / React Spectrum | Accessibility-focused hooks and components | Interaction semantics, keyboard support, internationalization, complex widgets | More concepts and styling work when using the lower-level APIs | Apache-2.0 | https://github.com/adobe/react-spectrum |
| Headless UI | Unstyled accessible components | Small, familiar primitives with Tailwind-friendly examples | Narrower catalog and strongest fit with Tailwind | MIT | https://github.com/tailwindlabs/headlessui |
| Base UI | Unstyled accessible React components | Low-level control with production interaction behavior | Check current package maturity and API stability before standardizing | MIT | https://github.com/mui/base-ui |

### shadcn/ui adoption notes

- Official repository: https://github.com/shadcn-ui/ui ; documentation: https://ui.shadcn.com/docs .
- Verified on 2026-10-13 against [repository commit 30a58d4](https://github.com/shadcn-ui/ui/tree/30a58d4498f270af1c1e981a7d78a15cf5740841). Its [LICENSE.md](https://github.com/shadcn-ui/ui/blob/30a58d4498f270af1c1e981a7d78a15cf5740841/LICENSE.md) is MIT; preserve the copyright and license notice when copying source.
- The [shadcn CLI manifest](https://github.com/shadcn-ui/ui/blob/30a58d4498f270af1c1e981a7d78a15cf5740841/packages/shadcn/package.json) declares version `4.21.4` and Node.js `>=20.18.1`. This is the CLI version, not a shared version for every copied component; recheck before installation.
- Inspect the target React framework, Tailwind setup, aliases and existing components before initializing. Use its package manager and add only the requested components; the generated source becomes part of the app.
- Check each component's actual dependencies and client/server boundary, then verify theme tokens, keyboard/focus behavior and the production build. Record copied component paths and the source version in the target project's notices.

## Vue

| Library | Model | Strengths | Tradeoffs | License | Official source |
| --- | --- | --- | --- | --- | --- |
| Element Plus | Styled Vue 3 system | Admin forms, tables, dialogs, and Chinese-language ecosystem | Opinionated Element visual language and heavier global CSS | MIT | https://github.com/element-plus/element-plus |
| Naive UI | Styled Vue 3 system | TypeScript-friendly API, themes, broad catalog | Smaller ecosystem than Element Plus or Vuetify | MIT | https://github.com/tusen-ai/naive-ui |
| Vuetify | Material Design Vue system | Extensive components, layout, and theme support | Material conventions and upgrade surface are significant | MIT | https://github.com/vuetifyjs/vuetify |
| Quasar | Vue framework and component system | SPA/SSR/PWA/mobile/desktop targets and rich components | Adopts a wider framework model than a component-only library | MIT | https://github.com/quasarframework/quasar |
| PrimeVue | Styled Vue 3 system | Broad enterprise controls, tables, themes, and accessibility work | Large API surface and theme choices need governance | MIT | https://github.com/primefaces/primevue |
| Arco Design Vue | Styled Vue 3 system | Enterprise admin patterns and polished data components | Design language is intentionally Arco-specific | MIT | https://github.com/arco-design/arco-design-vue |
| Reka UI | Unstyled Vue 3 component primitives | Dialogs, menus, popovers, and other interaction foundations for a custom design system | You own styling and composition; check the Vue peer version and verify focus, portals, and SSR behavior in the target app | MIT | [Repository](https://github.com/unovue/reka-ui) · [Documentation](https://reka-ui.com/docs/overview/introduction) |

## Svelte and framework-agnostic options

| Library | Model | Strengths | Tradeoffs | License | Official source |
| --- | --- | --- | --- | --- | --- |
| Skeleton | Svelte UI toolkit | Svelte-native themes, layouts, and utilities | Tied to SvelteKit conventions and its release cadence | MIT | https://github.com/skeletonlabs/skeleton |
| Bits UI | Unstyled Svelte component primitives | Svelte-native dialogs, menus, selections, and other behavior foundations; useful beneath a custom visual system or shadcn-svelte | Current releases require Svelte 5; check the exact Svelte and date-package peer dependencies, then own styling and verify composition | MIT | [Repository](https://github.com/huntabyte/bits-ui) · [Documentation](https://bits-ui.com/docs/introduction) |
| Melt UI | Svelte headless builders | Flexible accessible behavior with Svelte actions/builders | Requires building and documenting the visual layer | MIT | https://github.com/melt-ui/melt-ui |
| shadcn-svelte | Copy/paste Svelte components | Source ownership and familiar shadcn patterns | You own upgrades and component maintenance | MIT for the repository; review dependencies | https://github.com/huntabyte/shadcn-svelte |
| Bootstrap | CSS/component framework | Familiar responsive grid and broad documentation | Global styles and markup conventions can constrain custom design | MIT | https://github.com/twbs/bootstrap |
| Bulma | CSS-only framework | Simple class-based composition and no JavaScript runtime | Behavior, accessibility details, and advanced widgets are your responsibility | MIT | https://github.com/jgthms/bulma |
| Pico CSS | Minimal semantic CSS | Very small, attractive defaults for simple forms and content tools | Not a full application component catalog | MIT | https://github.com/picocss/pico |
| Tailwind CSS | Utility-first CSS | Fine-grained control and strong ecosystem | Utilities do not provide complete behavior or accessibility by themselves | MIT | https://github.com/tailwindlabs/tailwindcss |
| daisyUI | Tailwind component classes | Faster semantic component styling on top of Tailwind | Class abstractions can hide design decisions; version compatibility matters | MIT | https://github.com/saadeghi/daisyui |

## Motion and interaction

| Library | Model | Strengths | Tradeoffs | License | Official source |
| --- | --- | --- | --- | --- | --- |
| Motion | JavaScript animation library with React integration | Gestures, layout and exit transitions, and scroll-linked effects without replacing the primary component system | Keep motion purposeful, honor reduced-motion preferences, and check bundle impact and client boundaries; optional Motion+ products have separate terms | MIT for the open-source library | [Repository](https://github.com/motiondivision/motion) · [Documentation](https://motion.dev/docs) |
| dnd-kit | Drag-and-drop toolkit with a DOM layer and framework adapters | Sortable lists, grids, multiple containers, custom drop targets, and pointer, touch, and keyboard interaction | Current React documentation uses `@dnd-kit/react`; legacy `@dnd-kit/core` / `@dnd-kit/sortable` use different APIs. Preserve an existing stack until a migration is planned; own domain state, persistence, collision rules, and accessibility verification | MIT | [Repository](https://github.com/clauderic/dnd-kit) · [React documentation](https://dndkit.com/react/quickstart) · [Legacy React documentation](https://docs.dndkit.com/) |

## Rich-text editing

| Library | Model | Strengths | Tradeoffs | License | Official source |
| --- | --- | --- | --- | --- | --- |
| Tiptap | Headless editor framework built on ProseMirror, with framework integrations | Extensible rich-text and document editing through schemas, commands, and extensions; open-source collaboration extensions are available | You own the toolbar, styling, schema choices, storage, content validation, and collaboration infrastructure; review each extension because Pro extensions and Cloud services have separate terms | MIT for the open-source core | [Repository](https://github.com/ueberdosis/tiptap) · [Documentation](https://tiptap.dev/docs/editor/introduction) |
| Lexical | Extensible editor framework with React bindings | Editor state, custom nodes, commands, and plugins for a tailored rich-text experience | Requires assembling the editing UI and plugins, defining serialization and persistence, and testing selection, paste, input methods, and accessibility in actual flows | MIT | [Repository](https://github.com/facebook/lexical) · [Documentation](https://lexical.dev/docs/intro) |

## Specialized product capabilities

Use these for a concrete product requirement alongside one primary component system. They provide specialized behavior rather than a complete application theme.

| Library | Model | Strengths | Tradeoffs | License | Official source |
| --- | --- | --- | --- | --- | --- |
| assistant-ui | React chat primitives and assistant runtime integration | Streaming conversation UI, message composition, threads, and tool interaction with custom rendering | Requires choosing and integrating a backend or runtime adapter; authentication, model access, persistence, and server-side secrets remain application work; optional hosted services have separate terms | MIT for the open-source library | [Repository](https://github.com/assistant-ui/assistant-ui) · [Documentation](https://www.assistant-ui.com/docs) |
| React Flow / Svelte Flow | Node-based editor components for React and Svelte | Custom nodes and edges, connections, dragging, zooming, and viewport controls for workflow or diagram editors | You own domain validation, execution, persistence, and any automatic layout integration; check layout-engine licenses and distinguish optional Pro examples or support from the core | MIT for the core libraries | [Repository](https://github.com/xyflow/xyflow) · [React documentation](https://reactflow.dev/learn) · [Svelte documentation](https://svelteflow.dev/learn) |
| TanStack Table | Headless table core with framework adapters | Sorting, filtering, grouping, selection, and pagination while the app owns table markup and appearance | Provides no finished visual system; rendering, keyboard behavior, server data loading, and optional virtualization require integration; check the chosen adapter's major version, peers, and runtime requirements | MIT | [Repository](https://github.com/TanStack/table) · [Documentation](https://tanstack.com/table/latest/docs/overview) |
| React Hook Form | React form-state and validation library | Field registration, validation, submission state, errors, and controlled-component integration alongside existing UI controls | Provides no styled fields; connect controlled widgets deliberately, manage accessible errors and focus, and choose schema adapters when needed. Server-side validation remains application work | MIT | [Repository](https://github.com/react-hook-form/react-hook-form) · [Documentation](https://react-hook-form.com/get-started) |
| TanStack Virtual | Headless virtualization core with framework adapters | Windowing for long lists, tables, and grids while preserving control over markup and styling | You own item rendering, measurements, dynamic-size behavior, SSR integration, keyboard focus, and scroll restoration; profile the actual screen rather than assuming a frame-rate guarantee | MIT | [Repository](https://github.com/TanStack/virtual) · [Documentation](https://tanstack.com/virtual/latest/docs/introduction) |
| React DayPicker | Customizable React calendar and date-selection component | Single, multiple, and range selection, locale support, and time-zone-aware calendars | New v10 work uses `@daypicker/react`; `react-day-picker` remains for compatibility. Check the installed major and local Calendar wrapper before upgrading, including removed props, CSS mappings, and separate non-Gregorian add-ons; input fields, popovers, and time selection require composition | MIT | [Repository](https://github.com/gpbl/react-day-picker) · [Documentation](https://daypicker.dev/start) · [Upgrade guide](https://daypicker.dev/upgrading) |

## Icons and visualization support

| Library | Best fit | License | Official source |
| --- | --- | --- | --- |
| Lucide | Consistent outline icons with React/Vue/Svelte packages | ISC | https://github.com/lucide-icons/lucide |
| Heroicons | Tailwind-oriented outline and solid icons | MIT | https://github.com/tailwindlabs/heroicons |
| Tabler Icons | Large, consistent SVG icon set | MIT | https://github.com/tabler/tabler-icons |
| Phosphor | Multiple weights and expressive icon styles | MIT | https://github.com/phosphor-icons/core |
| Apache ECharts | Broad interactive charts, maps, and dashboards | Apache-2.0 | https://github.com/apache/echarts |
| Recharts | Composable React charts | MIT | https://github.com/recharts/recharts |
| Nivo | React charts with higher-level defaults and themed rendering | MIT | https://github.com/plouc/nivo |

## Adoption checklist

Before adding a library, record:

- Target framework and version, SSR/RSC constraints, and package manager.
- Primary system and whether it owns global CSS, resets, typography, and tokens.
- Required components that drive the decision: data grid, date/time, rich text, upload, command menu, charts, or mobile navigation.
- Accessibility behavior to verify in the actual product flow.
- License of the direct package and important transitive packages; retain notices where required.
- Bundle and CSS impact, tree-shaking behavior, and whether the package is safe for the project's runtime.
- Theme/token strategy, RTL/localization needs, and how upgrades will be handled.
- Maintenance signals from the official repository and release notes at the time of adoption.


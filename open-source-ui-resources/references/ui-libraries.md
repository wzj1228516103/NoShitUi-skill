# Curated open-source UI library catalog

This is a practical shortlist, not an exhaustive registry. Names and license labels are based on the projects' public repositories and documentation; confirm the current license, package version, peer dependencies, and maintenance status before adoption. A library's dependencies can have separate licenses.

## Quick selection map

| Need | Good starting points | Why |
| --- | --- | --- |
| React product with a broad, styled component set | MUI, Ant Design, Mantine, Chakra UI | Fast delivery, theming, forms/layout/data-display coverage |
| React with source ownership and a custom visual language | shadcn/ui + Radix UI, or Base UI | Components live in the app; high control over markup and CSS |
| React primitives with strong interaction/accessibility foundations | Radix UI, React Aria, Headless UI | Behavior and semantics without committing to a visual theme |
| React design-system compliance | Fluent UI, React Spectrum | Enterprise patterns, tokens, accessibility and platform guidance |
| Vue 3 enterprise/admin product | Element Plus, Naive UI, Arco Design Vue, PrimeVue | Broad business components and mature Vue integration |
| Vue 3 Material-style product | Vuetify | Integrated Material Design system and theming |
| Vue app with a full framework/toolkit | Quasar | UI components plus app tooling and multi-platform targets |
| Svelte app | Skeleton, Melt UI, shadcn-svelte | Svelte-native theming, primitives, or source-owned components |
| CSS-first or framework-agnostic markup | Bootstrap, Bulma, Pico CSS, Tailwind CSS + daisyUI | Useful when the team owns composition and markup |
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
| shadcn/ui | Copy/paste component source built around Radix and Tailwind | Full source ownership, fast customization, strong modern defaults | You own upgrades, fixes, accessibility review, and copied source provenance | MIT for the repository; review each dependency | https://github.com/shadcn-ui/ui |
| Radix UI | Unstyled React primitives | Strong primitives for dialogs, menus, popovers, navigation, and focus behavior | You must design and maintain the visual system | MIT | https://github.com/radix-ui/primitives |
| React Aria / React Spectrum | Accessibility-focused hooks and components | Interaction semantics, keyboard support, internationalization, complex widgets | More concepts and styling work when using the lower-level APIs | Apache-2.0 | https://github.com/adobe/react-spectrum |
| Headless UI | Unstyled accessible components | Small, familiar primitives with Tailwind-friendly examples | Narrower catalog and strongest fit with Tailwind | MIT | https://github.com/tailwindlabs/headlessui |
| Base UI | Unstyled accessible React components | Low-level control with production interaction behavior | Check current package maturity and API stability before standardizing | MIT | https://github.com/mui/base-ui |

## Vue

| Library | Model | Strengths | Tradeoffs | License | Official source |
| --- | --- | --- | --- | --- | --- |
| Element Plus | Styled Vue 3 system | Admin forms, tables, dialogs, and Chinese-language ecosystem | Opinionated Element visual language and heavier global CSS | MIT | https://github.com/element-plus/element-plus |
| Naive UI | Styled Vue 3 system | TypeScript-friendly API, themes, broad catalog | Smaller ecosystem than Element Plus or Vuetify | MIT | https://github.com/tusen-ai/naive-ui |
| Vuetify | Material Design Vue system | Extensive components, layout, and theme support | Material conventions and upgrade surface are significant | MIT | https://github.com/vuetifyjs/vuetify |
| Quasar | Vue framework and component system | SPA/SSR/PWA/mobile/desktop targets and rich components | Adopts a wider framework model than a component-only library | MIT | https://github.com/quasarframework/quasar |
| PrimeVue | Styled Vue 3 system | Broad enterprise controls, tables, themes, and accessibility work | Large API surface and theme choices need governance | MIT | https://github.com/primefaces/primevue |
| Arco Design Vue | Styled Vue 3 system | Enterprise admin patterns and polished data components | Design language is intentionally Arco-specific | MIT | https://github.com/arco-design/arco-design-vue |

## Svelte and framework-agnostic options

| Library | Model | Strengths | Tradeoffs | License | Official source |
| --- | --- | --- | --- | --- | --- |
| Skeleton | Svelte UI toolkit | Svelte-native themes, layouts, and utilities | Tied to SvelteKit conventions and its release cadence | MIT | https://github.com/skeletonlabs/skeleton |
| Melt UI | Svelte headless builders | Flexible accessible behavior with Svelte actions/builders | Requires building and documenting the visual layer | MIT | https://github.com/melt-ui/melt-ui |
| shadcn-svelte | Copy/paste Svelte components | Source ownership and familiar shadcn patterns | You own upgrades and component maintenance | MIT for the repository; review dependencies | https://github.com/huntabyte/shadcn-svelte |
| Bootstrap | CSS/component framework | Familiar responsive grid and broad documentation | Global styles and markup conventions can constrain custom design | MIT | https://github.com/twbs/bootstrap |
| Bulma | CSS-only framework | Simple class-based composition and no JavaScript runtime | Behavior, accessibility details, and advanced widgets are your responsibility | MIT | https://github.com/jgthms/bulma |
| Pico CSS | Minimal semantic CSS | Very small, attractive defaults for simple forms and content tools | Not a full application component catalog | MIT | https://github.com/picocss/pico |
| Tailwind CSS | Utility-first CSS | Fine-grained control and strong ecosystem | Utilities do not provide complete behavior or accessibility by themselves | MIT | https://github.com/tailwindlabs/tailwindcss |
| daisyUI | Tailwind component classes | Faster semantic component styling on top of Tailwind | Class abstractions can hide design decisions; version compatibility matters | MIT | https://github.com/saadeghi/daisyui |

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


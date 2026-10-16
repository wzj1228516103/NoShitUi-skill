# UI websites and open-source resource catalog

Use this catalog to route a request to the right kind of resource. A design gallery is a source of ideas, not automatically a source of reusable code. Confirm the current license, attribution rules, commercial-use terms, and asset ownership on the specific page or repository before copying anything.

## Inspiration and real product flows

These sites are useful for studying hierarchy, navigation, onboarding, empty states, responsive layouts, and interaction patterns. They should not be treated as open-source code repositories unless the individual item explicitly says so.

| Site | Best for | Reusable code? | Terms status | Official link |
| --- | --- | --- | --- | --- |
| Mobbin | Real mobile and web product screens and flows | Usually no | Site/content terms apply; use as reference | https://mobbin.com/ |
| Page Flows | Complete flows such as signup, checkout, and onboarding | Usually no | Site/content terms apply; use as reference | https://pageflows.com/ |
| Screenlane | Mobile screen patterns and interaction references | Usually no | Site/content terms apply; use as reference | https://screenlane.com/ |
| Godly | High-quality marketing and product websites | Usually no | Each featured site's assets remain separately owned | https://godly.website/ |
| Awwwards | Experimental websites and visual direction | Usually no | Featured work has its own rights and licenses | https://www.awwwards.com/ |
| Land-book | Landing pages and SaaS marketing layouts | Usually no | Use for visual reference; verify featured assets | https://land-book.com/ |
| Lapa Ninja | Landing-page sections and page composition | Usually no | Use for visual reference; verify featured assets | https://www.lapa.ninja/ |
| Dribbble | Visual exploration, UI concepts, and shots | Usually no | Creator-specific terms; request permission before reuse | https://dribbble.com/ |

When using an inspiration site, extract design decisions rather than copying the page: page purpose, primary action, content density, layout grid, spacing scale, type hierarchy, color roles, component states, and responsive changes.

## Component resources and templates

These resources can provide code, examples, or copy/paste components. They are not all uniformly open source: confirm the repository, component, template, and asset license before production use.

| Site | Ecosystem/model | Strong use case | License/terms note | Official link |
| --- | --- | --- | --- | --- |
| shadcn/ui | React, source-owned components | Custom product UI with Tailwind; buttons, forms and dialogs | MIT repository (verified 2026-10-13); copied files become project code, dependencies need separate review | [Repository](https://github.com/shadcn-ui/ui) · [Documentation](https://ui.shadcn.com/docs) |
| UIverse | CSS/HTML community components | Buttons, inputs, loaders, cards, and small effects | Check the individual component author/license | https://uiverse.io/ |
| HyperUI | Tailwind HTML components | Fast marketing pages and common sections | Verify the current project license and any included assets | https://www.hyperui.dev/ |
| Flowbite | Tailwind component library | Application controls, layouts, and templates | Open-source core and paid/pro offerings are separate | https://flowbite.com/ |
| Preline UI | Tailwind component library | Responsive application and marketing components | Check the current license and package version | https://preline.co/ |
| daisyUI | Tailwind component classes | Quick semantic styling and themes | MIT project; still review dependencies and included assets | https://daisyui.com/ |
| Magic UI | React/Tailwind animated components | Motion-heavy landing pages and product moments | Check repository/package terms and third-party assets | https://magicui.design/ |
| Aceternity UI | React/Tailwind visual components | Distinctive hero sections and effects | Verify the current component/repository license | https://ui.aceternity.com/ |
| Motion | JavaScript animation engine with React APIs | Layout transitions, springs, gestures, and restrained effects for a custom visual direction | MIT core; Motion+ paid resources have separate terms | [Documentation](https://motion.dev/docs) · [Repository](https://github.com/motiondivision/motion) · [License](https://github.com/motiondivision/motion/blob/main/LICENSE.md) |
| Reka UI | Unstyled Vue primitives | Custom Vue interfaces with accessible dialogs, menus, and other interaction foundations | MIT; styling and product behavior remain the integrator's responsibility | [Documentation](https://reka-ui.com/) · [Repository](https://github.com/unovue/reka-ui) |
| Bits UI | Headless Svelte components | Svelte interfaces with a custom design language and reusable interaction primitives | MIT; verify the target Svelte version and each component's integration requirements | [Documentation](https://bits-ui.com/) · [Repository](https://github.com/huntabyte/bits-ui) |
| assistant-ui | React components and runtime integrations for AI chat | Streaming conversations, tool interactions, and chat-specific states | MIT repository; hosted services and external model providers have separate terms | [Documentation](https://www.assistant-ui.com/docs) · [Repository](https://github.com/assistant-ui/assistant-ui) |
| xyflow / React Flow / Svelte Flow | React and Svelte node-and-edge editors | Workflow builders, node orchestration, and interactive graph canvases | MIT libraries; paid Pro examples and services have separate terms | [React documentation](https://reactflow.dev/) · [Svelte documentation](https://svelteflow.dev/) · [Repository](https://github.com/xyflow/xyflow) |
| TanStack Table | Headless table engine with framework adapters | Custom data tables with sorting, filtering, grouping, and controlled state | MIT; provide the visual layer and check the selected adapter/version | [Documentation](https://tanstack.com/table/latest/docs/overview) · [Repository](https://github.com/TanStack/table) |
| Figma Community | Figma files, UI kits, and design systems | Starting points for visual systems and prototypes | Each file has its own author and license terms | https://www.figma.com/community |

Do not describe a site as fully open source when it mixes open-source core, paid templates, hosted examples, or per-author assets. Record the exact source URL and license next to copied components.

## Source-available visual effects / restricted redistribution

The following projects are visual-effect candidates with **MIT + Commons Clause** terms, not standard MIT-licensed open-source recommendations. Check the actual `LICENSE.md` at the revision being adopted: a README badge or summary does not override that license.

| Resource | Useful for | License boundary | Official sources |
| --- | --- | --- | --- |
| React Bits | React backgrounds, text effects, and visual interactions for expressive hero sections | MIT + Commons Clause. The terms allow use within applications, websites, and products, but prohibit selling, sublicensing, or redistributing the components themselves, including bundled or ported versions. Check the selected component's dependencies and license before adoption. | [Documentation](https://reactbits.dev/) · [Repository](https://github.com/DavidHDev/react-bits) · [License](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md) |
| Animate UI | Animated React components and interaction examples | MIT + Commons Clause. The terms allow use within applications, websites, and products, but prohibit selling or redistributing the components as-is, individually or in a bundle. Check the selected component's dependencies and license before adoption. | [Documentation](https://animate-ui.com/) · [Repository](https://github.com/imskyleen/animate-ui) · [License](https://github.com/imskyleen/animate-ui/blob/main/LICENSE.md) |

Keep these entries as links and selection guidance. Do not bundle their component source into this Skill. For a project using them, record the applicable revision and terms, and distinguish integration into the product from redistribution of the component source itself.

## Component and pattern catalogs

| Site | Best for | Output |
| --- | --- | --- |
| Component Gallery | Comparing patterns such as buttons, modals, navigation, and tables across design systems | Design-system references and links to implementations |
| Component Party | Comparing the same component across React, Vue, Svelte, and other frameworks | Framework syntax and behavior references |
| React Aria | Accessible interaction behavior and complex widgets | React hooks/components and accessibility guidance |
| Radix UI | Unstyled React primitives | Source package and behavior primitives |
| Headless UI | Unstyled components with Tailwind-oriented examples | Source package and examples |

- Component Gallery: https://component.gallery/
- Component Party: https://component-party.dev/
- React Aria: https://react-spectrum.adobe.com/react-aria/
- Radix UI: https://www.radix-ui.com/
- Headless UI: https://headlessui.com/

## Resource-to-action routing

| User intent | Start with | Deliverable |
| --- | --- | --- |
| "Give me visual direction for a SaaS landing page" | Godly, Land-book, Lapa Ninja, Awwwards | A short pattern audit and a project-specific visual direction |
| "Show me how onboarding or checkout usually works" | Page Flows, Mobbin, Screenlane | A flow outline with states and edge cases |
| "Give me reusable open-source buttons/cards" | UIverse, HyperUI, daisyUI | License-checked component shortlist and integration code |
| "Build a polished React page quickly" | shadcn/ui, Magic UI, Aceternity UI | One coherent component stack and working screen |
| "Add custom motion or spatial effects to an interface" | Motion core; React Bits or Animate UI only under their restricted terms above | A small effect integrated into the existing visual system, with mobile performance and reduced-motion checks |
| "Build a custom Vue interface" | Reka UI | Styled Vue primitives with verified keyboard, focus, and interaction states |
| "Build a custom Svelte interface" | Bits UI; xyflow / Svelte Flow for a node canvas | A Svelte-native component strategy and a representative working flow |
| "Build an AI chat interface" | assistant-ui | A working conversation flow with streaming, tool, loading, error, and empty states |
| "Build a node-based workflow editor" | xyflow / React Flow or Svelte Flow | An editable node-and-edge canvas with connection rules, state, and a verified representative workflow |
| "Build a custom data table" | TanStack Table | A styled table with the required sorting, filtering, selection, and pagination behavior; choose virtualization separately if needed |
| "Compare component behavior across frameworks" | Component Gallery, Component Party | Framework-aware recommendation |
| "Make the UI accessible" | React Aria, Radix UI, Headless UI | Behavior primitives plus an accessibility verification plan |

## Before copying or installing

- Record the exact URL, repository, package version, and component name.
- Distinguish inspiration, code, fonts, images, icons, and brand assets; each may have different rights.
- Confirm the license permits the intended use and whether attribution or notices are required.
- Prefer package installation or copying from the official source rather than an unverified snippet mirror.
- Adapt structure and interaction to the user's product instead of cloning a showcase page.
- Test keyboard navigation, focus management, responsive behavior, loading/error/empty states, and reduced-motion behavior.


# Shadcn Ops demo

This is a small operations dashboard built with Vite, React, TypeScript, Tailwind CSS v4, and shadcn/ui's source-owned component workflow.

The UI components live in `src/components/ui/`. They are local source files, so the example can be inspected and customized instead of importing a runtime widget library. The page demonstrates shadcn/ui Button, Card, Badge, Input, Select, and Dialog components in one product workflow:

- filter orders by text and status
- open an order in an edit dialog
- save the edited customer or status and see a toast
- create a new order draft
- switch between responsive desktop and mobile navigation

Run it locally from this directory:

```sh
npm install
npm run dev
```

The deployed example is available at `/NoShitUi-skill/shadcn-demo/`. It is a static demo; order changes live in the current browser session and are not sent to a server.

Source library: https://github.com/shadcn-ui/ui

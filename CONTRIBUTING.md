# Contributing

## Setup

Use the Node.js version declared by CI and pnpm through the `packageManager` field in `package.json`.

```bash
pnpm install
pnpm dev
```

## Conventions

- Write strict TypeScript and use `.ts` or `.tsx` files.
- Use kebab-case for non-route source filenames.
- Keep route files in the Next.js App Router and feature code in `features`.
- Reuse shadcn components from `components/ui` instead of duplicating primitives.
- Keep uploaded files local to the browser.

## Before opening a pull request

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Keep pull requests focused and explain any intentional breaking change.

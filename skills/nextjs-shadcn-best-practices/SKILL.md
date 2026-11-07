---
name: nextjs-shadcn-best-practices
description: Build and modify Next.js App Router frontends with shadcn/ui, React, and Tailwind CSS. Use when creating or editing pages, layouts, Server or Client Components, forms, tables, dialogs, navigation, data fetching, theming, or dark mode in a Next.js + shadcn/ui project, or when adding shadcn components. Applies folder structure, naming, server-first data flow, Field + useActionState forms, token-only styling, and the loading/error/empty trio.
---

# Next.js + shadcn/ui Best Practices

## Before you write code

1. Read the target project's own context first: its agent entry file (`AGENTS.md` / `CLAUDE.md` / Cursor rules), `components.json`, and `package.json`. Note package manager, Next/React/Tailwind versions, path aliases, UI language and `<html lang>`, auth strategy, and form stack.
2. Project context overrides this skill. Where this skill says "do X" and the project says "here X means Y", follow the project.
3. Confirm installed shadcn variants against the actual files in `components/ui/` (for example `button.tsx`); variants differ by template. Never assume a variant or prop exists. When unsure how components compose, check the official docs or registry source for the project's `style` in `components.json` (for example `base-vega`) before writing the composition.
4. For the full rule set, read [references/full-guide.md](references/full-guide.md). This file is the quick path; the reference is authoritative when they differ in detail.

## Workflow

1. Place the route under `app/(group)/<route>/page.tsx`. Add `loading.tsx` and `error.tsx` for every async segment.
2. Default to a Server Component. Fetch data in the server page and pass props down to small `"use client"` islands.
3. Build UI only from `@/components/ui/*`, project shared/domain components, and `lucide-react` icons.
4. Give every async view loading, error, and empty states.
5. If the page is a primary section, add its link to the shared nav.
6. Verify with the project's lint and build commands (for example `pnpm lint && pnpm build`).

## Non-negotiable rules

### Structure and naming

- Folders are URL segments; only `page.tsx` / `route.ts` makes a segment public. Route groups `(marketing)`, `(auth)`, `(app)` organize without affecting the URL. `_folder` is private and never routable.
- Colocate single-route code in `_components/`; promote to `components/<domain>/` on second-route use and to `components/shared/` when global. `components/ui/` holds shadcn primitives only and never imports project code.
- Files and directories: `kebab-case`. Components `PascalCase`, hooks `useXxx`, callbacks `onXxx` / `handleXxx`, booleans `isXxx` / `hasXxx`.
- Aliases come from `components.json` (typically `@/components`, `@/lib`, `@/hooks`, `@/ui`). Relative imports only within the same folder.

### Next.js

- Server-first: add `"use client"` only for state, event handlers, `useEffect`, browser APIs, or hooks that use them.
- `params` / `searchParams` are async: `const { id } = await params`.
- Layouts accept `{ children: React.ReactNode }` and preserve state across navigation. Only the root layout renders `<html>` / `<body>`.
- Internal navigation uses `next/link` and `useRouter` / `usePathname` from `next/navigation`; never `<a href>` internally. Server-side unauthenticated redirect: `redirect("/login")`.
- Server data: `fetch` with explicit caching or direct API calls in Server Components / Server Actions; secrets stay server-side. Mutations prefer Server Actions with `revalidatePath` / `revalidateTag`. Exception: flows that must write browser storage (for example persisting a Bearer token on login) stay in a Client Component.
- Auth follows the project's stated strategy: httpOnly cookie session verified in a server layout, or the project's existing browser-token client pattern. Do not mix strategies.
- Per-page metadata via `export const metadata`; no manual `<head>`. Fonts via `next/font/*`. Only `NEXT_PUBLIC_*` env vars may reach the client.

### shadcn/ui and styling

- Add components with the CLI (`<pkg> dlx shadcn@latest add button card input field table dialog skeleton`), never hand-copy vendor code. Import from the alias, never deep-import vendor internals.
- Style with Tailwind utilities and shadcn tokens only (`bg-primary`, `text-muted-foreground`, `border-border`, `text-destructive`). No hex codes, no CSS modules, no inline `style={{}}` for layout, no hardcoded palette classes such as `text-red-600`.
- Compose variants with `cva` / `buttonVariants` and `cn` from `@/lib/utils`. Keep generated `data-slot` attributes. Edit `components/ui/*` internals only to fix the primitive for all callers.
- New theme token: define in `:root` and `.dark` in `app/globals.css` and expose it in `@theme inline`. Dark mode is the `.dark` class plus a theme provider.
- Icons: `lucide-react` with size classes (`size-4`), never `width` / `height` props.
- Copy: no redundant secondary labels. A description or subtitle must add information, never paraphrase the title or narrate what the layout already shows. Omit it instead.

### Forms and feedback

- Structure: `Card` > `form` > `FieldGroup` > `Field` + `FieldLabel` + `Input` (the official `login-01` block shape). Do not hand-roll label-plus-gap markup when `Field` exists.
- Icons, text, or buttons inside an input: `InputGroup` > `InputGroupInput` + `InputGroupAddon align="inline-end"` > `InputGroupButton`, so the control stays in normal flex flow. Never hand-roll `relative` + `absolute` positioning around a plain `Input`.
- Unless the project names another form stack, use React `useActionState`: `const [state, formAction, pending] = useActionState(action, { error: "" })` with `<form action={formAction}>`. Every `Input` gets a `name`, an `autoComplete`, and `disabled={pending}`. No manual `onSubmit` + `preventDefault` + pending state.
- Errors use a shared error text style (`text-sm text-destructive`, `role="alert"`). Submit disables while pending.
- `Checkbox.onCheckedChange` passes `boolean | "indeterminate"`; narrow it (`v === true`) before storing.
- Loading state: `Skeleton` or muted loading text. Empty state: `Empty` component or a muted hint. Never return bare `null` for loading.

## New-page checklist

- [ ] Route, `loading.tsx`, `error.tsx` in place; server by default, client islands only where needed
- [ ] Project page shell and heading pattern (check project context)
- [ ] Types in `types/` (or route-local `_lib/` if single-use); typed data fetching
- [ ] UI from `@/components/ui/*` + `lucide-react`; token colors only
- [ ] Forms via `Field` + `useActionState` unless the project names another stack
- [ ] Primary section linked from shared nav
- [ ] Lint and build pass

## Record feedback

When the user corrects you on a rule from this skill, or lint/build fails because a rule here was violated, record one lesson (one generalizable sentence, no secrets or customer data):

```bash
node "${CLAUDE_PLUGIN_ROOT:-${PLUGIN_ROOT:-.}}/scripts/log-feedback.mjs" --lesson "<what to do instead>" --evidence "<what happened>"
```

Add `--scope project-only` when the correction is specific to this repo's conventions; those lessons must not become global rules. If the script or plugin root is unavailable, skip silently and finish the task.

## Reference

Full guide with folder-structure diagram, code examples, and rationale: [references/full-guide.md](references/full-guide.md).

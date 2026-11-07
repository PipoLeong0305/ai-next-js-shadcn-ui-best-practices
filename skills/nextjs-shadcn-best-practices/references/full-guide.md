# AI Frontend Guide — Next.js (App Router) + shadcn/ui

Target reader: an AI coding agent working in a Next.js + shadcn/ui repo.
Stack: Next.js (App Router) + React + Tailwind CSS + shadcn/ui + `class-variance-authority` + `lucide-react`.

Official references:

- [Next.js App Router docs](https://nextjs.org/docs/app) (local mirror: `node_modules/next/dist/docs/`, start at `01-app/01-getting-started/`)
- [shadcn/ui docs](https://ui.shadcn.com/docs), [Next.js install](https://ui.shadcn.com/docs/installation/next), [Theming](https://ui.shadcn.com/docs/theming), [CLI](https://ui.shadcn.com/docs/cli), [Dark mode](https://ui.shadcn.com/docs/dark-mode)

## 0. Adopting this guide in another project

This file is the reference bundled with the `nextjs-shadcn-best-practices` skill (`../SKILL.md`). Install that skill per the repo README; do not copy this file alone.

1. Read the target repo's own context (agent entry file, `components.json`, `package.json`) and treat its values as this guide's [Project Context](#project-context).
2. Project Context overrides any generic default in this guide.

Rules in this guide say "do X". Project Context says "here X means Y in this repo". When they conflict, Project Context wins. The Project Context table below is an example filled in for one repo; replace its values with the target repo's, do not apply them blindly.

## Project Context

Fill this per repo. Leave `—` when not applicable.

| Key | This repo's value |
|---|---|
| Package manager | `pnpm` (commands below use `pnpm`; swap in `npm`/`bun`/`yarn` as needed) |
| Versions | Next.js `16.4.5`, React `19`, Tailwind `4`, shadcn `style: base-vega`, `baseColor: zinc`, CSS variables, `lucide` icons, `@base-ui/react` |
| Path aliases | `@/components`, `@/lib`, `@/hooks`, `@/ui` (see `components.json`) |
| UI language / `<html lang>` | Chinese UI, `lang="zh-CN"` |
| Auth strategy | Browser token: backend returns a Bearer [REDACTED] `lib/api.ts` (`setToken`) persists to `localStorage`/`sessionStorage`; `redirectToLogin()` on 401. Target is an httpOnly cookie session verified in a server layout, backend does not support it yet |
| Form stack | No `react-hook-form` / `zod` installed; use `Field` + `useActionState` (§5.4) unless a form genuinely needs schema validation |
| Reference form | `app/(auth)/login/_components/login-form.tsx` (official `login-01` block structure) |
| Default page shell | `<main className="mx-auto max-w-5xl px-4 py-6">` + `<h1 className="mb-4 text-lg font-semibold">` |
| Shared nav | Primary sections link from the shared nav |

## 1. Commands

```bash
<pkg> dev    # next dev
<pkg> build  # next build
<pkg> start  # next start
<pkg> lint   # eslint (eslint-config-next core-web-vitals + typescript)
```

`<pkg>` is `pnpm`/`npm run`/`bun` per Project Context.

```bash
<pkg> dlx shadcn@latest add <component>  # e.g. card input dialog table skeleton field separator
```

## 2. Folder structure (best practice)

```text
app/
  layout.tsx              # root layout ONLY: <html>/<body>, fonts, globals.css
  globals.css             # tailwind + shadcn theme tokens
  not-found.tsx           # global 404
  error.tsx               # global error boundary (optional, per-segment preferred)
  (marketing)/
    page.tsx              # /  (public landing)
    layout.tsx            # marketing header/footer
  (auth)/
    login/page.tsx        # /login (no app chrome)
    layout.tsx            # centered narrow shell
  (app)/
    layout.tsx            # authed chrome: sidebar/nav + <main> shell
    dashboard/
      page.tsx            # /dashboard (server, fetches, passes props down)
      loading.tsx         # skeleton for this segment
      error.tsx           # error boundary for this segment
      _components/        # colocated, non-routable: summary-cards.tsx
    projects/
      page.tsx            # /projects (list)
      [id]/page.tsx       # /projects/123 (await params)
      _components/
  api/
    health/route.ts       # route handlers ONLY for real backend-for-frontend needs
components/
  ui/                     # shadcn generated primitives ONLY (button, card, input...)
  shared/                 # cross-route project components (app-nav, page-header, empty-state)
  <domain>/               # feature components used in 2+ routes (projects/project-table.tsx)
hooks/                    # use-*.ts client hooks (use-summary.ts)
lib/                      # framework-agnostic: api client, utils (cn), formatting, constants
types/                    # shared DTO/domain types (summary.ts) — import, don't redeclare
public/                   # static assets (logo.svg, favicon.ico)
```

Omit groups you don't need (e.g. no marketing site → no `(marketing)`).

Principles (from Next.js [project structure](https://nextjs.org/docs/app/getting-started/project-structure)):

| Rule | Detail |
|---|---|
| Folders = URL segments; only `page.tsx`/`route.ts` makes a segment public | No stray public routes |
| `(group)` organizes without URL effect | `(marketing)`, `(auth)`, `(app)` each own a layout |
| `_folder` is private, never routable | Colocate `_components/`, `_lib/` next to the route using them |
| Promote on second use | 1 route → `_components/`; 2+ routes → `components/<domain>/`; global → `components/shared/` |
| Never nest `components/ui` imports backwards | `ui/` imports only `lib/utils` + vendor; project code imports from `ui/`, never the reverse |
| Aliases | Per `components.json`; relative imports only within the same folder |

## 3. Naming standards

- Files/dirs: `kebab-case` (`summary-cards.tsx`, `use-summary.ts`). Route files fixed lowercase: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`.
- Components `PascalCase` (`SummaryCards`), hooks `useXxx`, types `PascalCase` (`Summary`), route params match bracket name (`[id]` → `params.id`).
- Props: destructure inline; callbacks `onXxx` (props) / `handleXxx` (internals); booleans `isXxx`/`hasXxx`.
- Styling: Tailwind utilities + shadcn tokens only (`bg-primary`, `text-muted-foreground`, `border-border`). No hex codes, no CSS modules, no `style={{}}` for layout.
- Icons: `lucide-react` with size classes (`size-4`), never `width`/`height` props.
- Copy: no redundant secondary labels or descriptions. A `CardDescription`/subtitle/kicker must add information, never paraphrase the title or narrate what the layout already shows (fields + button explain themselves). Omit it instead of filling it.

## 4. Next.js best practices

### 4.1 Server-first, client islands

- Default to Server Components. Add `"use client"` (first line) only for: state/event handlers, `useEffect`, browser APIs (`localStorage`, `window`), or hooks using them.
- Data flows down: Server page fetches → passes props to small `"use client"` islands. Never fetch-then-prop-drill through multiple client layers; colocate the island with its usage.
- `params`/`searchParams` are async in recent Next.js: `const { id } = await params`.

```tsx
// app/(app)/dashboard/page.tsx — server by default
import { SummaryCards } from "./_components/summary-cards";
import { PendingTable } from "./_components/pending-table";

export default async function DashboardPage() {
  const data = await getSummary(); // fetch close to source, secrets stay server-side
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold">Dashboard</h1>
      <SummaryCards data={data} />
      <PendingTable rows={data.pending_list} />
    </main>
  );
}
```

### 4.2 Routing files — always provide the trio

Every async segment gets `page.tsx` + `loading.tsx` (skeleton, shadcn `Skeleton`) + `error.tsx` (`"use client"`, `error` + `reset` props, retry button). Add `not-found.tsx` per branch that resolves IDs.

- Layouts preserve state across navigation and must accept `{ children: React.ReactNode }`. Only the root layout renders `<html>/<body>`.
- Dynamic: `[slug]` single, `[...slug]` catch-all, `[[...slug]]` optional catch-all.

### 4.3 Navigation

- Internal: `next/link` (`<Link href="/dashboard">`) — prefetches in viewport. Never `<a href>` internally.
- Programmatic: `useRouter`/`usePathname` from `next/navigation`. Active link = compare `pathname === href`, style with `cn`.
- Server redirect: `redirect("/login")` from `next/navigation` (e.g. unauthenticated server page/layout).

### 4.4 Data fetching

- Server: `fetch` with explicit caching (`force-cache` + `revalidate`, or `no-store` for dynamic), or direct DB/API calls in Server Components / Server Actions. Secrets never leave the server.
- Client (only when server can't: token in browser, polling, optimistic UI): single typed client (`api<T>` in `lib/api.ts`), `useEffect` + loading/error/empty states, typed generics, `e instanceof Error` narrowing.
- Mutations: Server Actions (`"use server"`) preferred over manual `fetch` POSTs; revalidate with `revalidatePath`/`revalidateTag`. Exception: flows that must touch browser-only storage (e.g. persisting a Bearer [REDACTED] `localStorage`/`sessionStorage` on login) stay in a Client Component — a Server Action + `redirect()` cannot set browser storage. See Project Context for which auth strategy this repo uses.
- Auth: follow the Project Context strategy. If it says httpOnly cookie session, verify in a server layout and use `redirect("/login")`; if it says browser token, follow the existing `lib/api` pattern (`setToken`, `redirectToLogin()` on 401) until the backend supports cookie sessions.

### 4.5 Metadata, fonts, env

- Metadata per page/layout: `export const metadata: Metadata = { title, description }`. No manual `<head>`. Real product titles, never scaffold defaults (`Create Next App`).
- `<html lang>` matches the actual content language (see Project Context).
- Fonts: `next/font/*` with `variable:` + class on `<html>`/`<body>`; body gets `antialiased`.
- Env: `NEXT_PUBLIC_*` only for client-safe values; server secrets plain (`API_URL`). Validate at module load and fail fast with a clear message.

## 5. shadcn/ui best practices

### 5.1 Add, don't hand-copy

```bash
<pkg> dlx shadcn@latest add button card input label field separator table dialog skeleton
```

Import from the alias; never deep-import vendor internals:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
```

### 5.2 Variants + cn

Compose with `cva` variants and `cn`; keep generated `data-slot` attributes intact:

```tsx
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button size="icon" aria-label="Close"><X className="size-4" /></Button>
```

- `variant`: `default | outline | secondary | ghost | destructive | link`; `size`: `default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg` (confirm against the installed `button.tsx`; variants differ by template).
- Custom wrapper: `buttonVariants({ variant, size, className })` + `cn(...)`. Project code imports `cn` from `@/lib/utils`.
- Generated `components/ui/*` are copy-paste owned: prefer props/`className` overrides; edit internals only to fix the primitive for all callers.

### 5.3 Theming

- Colors/typography come from `app/globals.css` tokens (`--primary`, `--muted-foreground`, `--border`, `--radius`) exposed via `@theme inline`. Components reference tokens, never raw values.
- New token: define under `:root` + `.dark`, expose in `@theme inline`.
- Dark mode = `.dark` class + theme provider ([dark mode guide](https://ui.shadcn.com/docs/dark-mode/next)); no ad-hoc dark classes before the provider exists.

### 5.4 Forms and feedback

- Structure follows the official `login-01` block: `Card` > `form` > `FieldGroup` > `Field` + `FieldLabel` + `Input`. Never hand-roll `Label` + `div` gaps when `Field` exists. (Only cite `react-hook-form`/`zod` if Project Context lists them; otherwise do not treat them as the default.)
- Icons, text, or buttons inside an input use `InputGroup`, never a hand-rolled `relative` + `absolute` overlay on a plain `Input`. Hand positioning fights the button's own transforms (`active:translate-y-px` vs a centering `transform` on the same element), so alignment breaks on interaction. `InputGroup` is a flex container and the addon sits in normal flow:

```tsx
<InputGroup>
  <InputGroupInput id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" disabled={pending} />
  <InputGroupAddon align="inline-end">
    <InputGroupButton aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} onClick={() => setShow(!show)}>
      {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

Add it with the CLI (`<pkg> dlx shadcn@latest add input-group`); it depends on `input` and `textarea`. When unsure how any shadcn components compose, check the official docs or the registry JSON for the project's `style` from `components.json` (for example `https://ui.shadcn.com/r/styles/base-vega/login-01.json`) before writing the composition. ([InputGroup docs](https://ui.shadcn.com/docs/components/base/input-group))
- Client actions use React `useActionState`: `const [state, formAction, pending] = useActionState(action, { error: "" })` with `<form action={formAction}>`. The action reads `formData.get("name")`, so every `Input` needs a `name` plus `autoComplete` (`email`, `current-password`) and `disabled={pending}`. No manual `onSubmit` + `preventDefault` + `isPending` state. ([Next forms guide](https://nextjs.org/docs/app/guides/forms))
- Errors render via shared `ErrorText` (`text-sm text-destructive`, `role="alert"`). Never hardcode `text-red-600`. Pending disables submit: `<Button type="submit" disabled={pending}>`.
- `Checkbox.onCheckedChange` receives `boolean | "indeterminate"` — narrow it (`(v) => setX(v === true)`), never pass the raw setter.
- Placeholder links (`#`) still use `next/link`; point them at a real route once it exists.
- Every async view states the trio: loading (`Skeleton`/muted "loading"), error (`ErrorText` + retry), empty (`Empty`/`text-muted-foreground` hint). No bare `null` returns for loading.

Reference implementation: see Project Context. If empty, fall back to the official shadcn blocks.

## 6. New-page checklist

1. Route at `app/(group)/<route>/page.tsx`, default export; add `loading.tsx` + `error.tsx`.
2. Server Component by default; `"use client"` islands only where interactivity demands.
3. Shell: Project Context page shell (`<main>` + `<h1>`).
4. Types live in `types/` (or route `_lib/` if single-use); data via typed fetch; loading/error/empty required.
5. UI from `@/components/ui/*` + `lucide-react`; token colors only (`text-destructive`, never `text-red-600`); forms via `Field` + `useActionState` (§5.4) unless Project Context names another form stack.
6. Primary section? Add link to the shared nav (see Project Context).
7. Verify: `<pkg> lint && <pkg> build`.

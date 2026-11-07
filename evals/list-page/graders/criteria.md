---
type: llm
weight: 1
---

Score the response against these criteria. Full marks only if all are met:

1. Route file at `app/(group)/projects/page.tsx` (any route group) plus `loading.tsx` and `error.tsx` for the segment.
2. The page is a Server Component (no `"use client"` on the page); data is fetched server-side and passed as props to any client island.
3. Table UI from `@/components/ui/*` (shadcn), icons from `lucide-react` with `size-` classes.
4. Styling uses Tailwind utilities and shadcn tokens only (`text-muted-foreground`, `text-destructive`, `border-border`); no hex colors, no hardcoded palette classes like `text-red-600`, no inline layout styles.
5. All three async states are handled: loading (Skeleton), error (with retry), and empty state; no bare `null` for loading.
6. Types are declared (e.g. in `types/` or colocated) and the data fetch is typed.

Deduct for: client-side fetching in `useEffect` as the primary data path, `<a href>` for internal links, missing loading or error file, or hand-copied shadcn component code instead of CLI imports.

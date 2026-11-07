---
type: llm
weight: 1
---

Score the response against these criteria. Full marks only if all are met:

1. Dark mode is implemented as the `.dark` class plus a theme provider (per the shadcn dark-mode guide for Next.js), not ad-hoc `dark:` overrides scattered before a provider exists.
2. The new success token is defined in `app/globals.css` under both `:root` and `.dark`, and exposed via `@theme inline`; components would reference the token (e.g. `text-success` / `bg-success`), never a raw hex value in component code.
3. No component code contains hex colors or hardcoded palette classes.
4. Existing tokens and the CSS-variable setup are kept intact; the change is additive.

Deduct for: defining the token in only one of `:root` / `.dark`, using a raw Tailwind palette class such as `text-green-600` for the success state, or toggling dark mode via inline styles.

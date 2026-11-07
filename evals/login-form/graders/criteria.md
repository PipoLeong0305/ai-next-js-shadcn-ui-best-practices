---
type: llm
weight: 1
---

Score the response against these criteria. Full marks only if all are met:

1. Form structure follows the shadcn Field pattern: `Card` > `form` > `FieldGroup` > `Field` + `FieldLabel` + `Input` (login-01 block shape); no hand-rolled label-plus-div-gap markup.
2. Uses React `useActionState` with `<form action={formAction}>`; no manual `onSubmit` + `preventDefault` + hand-managed pending state, and no react-hook-form/zod (not installed).
3. Every `Input` has a `name`, an `autoComplete` (`email`, `current-password`), and is disabled while pending; the submit button is disabled while pending.
4. Errors render with token styling (`text-destructive`, ideally `role="alert"`), never hardcoded `text-red-600`.
5. Components imported from `@/components/ui/*`; route includes `page.tsx` (plus loading/error handling appropriate to the page).

Deduct for: client-only fetch login with manual pending state, missing `name` attributes (form cannot submit values), or missing error display.

# Eval baseline

First recorded run, before any feedback-driven rule changes.

- Date: 2026-11-08
- Command: `claude plugin eval . --trust-plugin --runs 1 --no-publish`
- Plugin version: 1.1.0

| Case | With plugin | Without plugin | Delta |
|---|---|---|---|
| list-page | pass (1.0) | fail (0.0) | +1.0 |
| dark-theme | pass (1.0) | pass (1.0) | 0.0 |
| login-form | fail (0.0) | fail (0.0) | 0.0 |
| Overall | 2/3 cases, score 0.667 | | mean delta +0.333 |

Notes:

- login-form failed on judge votes (FAIL/PASS/FAIL) despite the response using `useActionState` and the Field pattern; treat as borderline and re-run before changing any rule because of it.
- Future improvement PRs must paste their own table in this format and compare against this file. Do not edit this baseline; add a new dated section when a release is published.

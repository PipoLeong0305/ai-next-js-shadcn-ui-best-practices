---
name: nextjs-shadcn-improve
description: Review collected feedback for the nextjs-shadcn-best-practices skill and propose improvements. Use only when the user asks to review skill feedback, learn from past corrections, improve or update the nextjs-shadcn skill itself, or triage skill-feedback issues. Do not use for building Next.js or shadcn/ui features.
---

# Improve the Next.js + shadcn/ui Skill

Run this only inside a clone of the `ai-next-js-shadcn-ui-best-practices` repo. You propose changes; a human merges them. Never edit an installed plugin cache, never merge your own PR, never push directly to `main`.

## Collect

1. GitHub feedback: `gh issue list --repo PipoLeong0305/ai-next-js-shadcn-ui-best-practices --label skill-feedback --state open --limit 100 --json number,title,body,url`.
2. Local feedback: the file at `$SKILL_FEEDBACK_FILE` or `~/.local/share/nextjs-shadcn-skill/feedback.jsonl`. Read it if it exists; tolerate bad lines. `signal` rows are raw context (which files changed), not lessons; only `lesson` rows and issues carry proposed rules.
3. If both sources are empty, say so and stop. Do not invent lessons.

## Triage

1. Cluster lessons by the rule they propose, merging duplicates across sources. Count occurrences.
2. Keep a cluster only when it appears at least twice, or once with concrete evidence of a severe failure (build break, data loss, security issue). Drop the rest and say what you dropped.
3. Split by scope:
   - `project-only` lessons and project-specific conventions never enter the global skill. List them separately as "return to the project" and suggest the user record them in that project's `AGENTS.md` / Project Context.
   - Global lessons must be generalizable to any Next.js App Router + shadcn/ui project and must not contradict the target project's right to override (project context still wins).

## Propose

1. Create a branch `skill-improve/YYYY-MM-DD`.
2. Edit the smallest surface that carries the rule:
   - Quick-path rule: `skills/nextjs-shadcn-best-practices/SKILL.md` (must stay under 500 lines; prefer tightening an existing line over adding a new one).
   - Detail, examples, rationale: `skills/nextjs-shadcn-best-practices/references/full-guide.md`.
   - Trigger misses (skill did not load when it should): fix the `description` frontmatter first; it is what agents match on.
3. Run the eval suite before claiming improvement: `claude plugin eval . --trust-plugin` (see `evals/`). Compare against the previous recorded baseline in the PR body; if scores drop on any case, revise or drop that change.
4. Validate: `muse skills validate` on both skill folders and `claude plugin validate .`.
5. Open a PR with `gh pr create`. Body must include: clusters kept (with counts), clusters dropped, project-only items returned, files changed, eval scores before/after, and the source issue numbers. Close no issue from the PR body alone; reference them so a human closes after merge.

## Release (only when the user asks to publish)

1. Bump `version` in both `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` (patch for rule wording, minor for new rules or skills).
2. Commit in the planned units, push, and verify with `git ls-remote`.
3. Tell the user how consumers upgrade: refresh the marketplace and reinstall/update the plugin in their agent, then start a new session.

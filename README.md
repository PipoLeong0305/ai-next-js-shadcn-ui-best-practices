# ai-next-js-shadcn-ui-best-practices

Next.js (App Router) + shadcn/ui best practices, packaged as a cross-agent [Agent Skill](https://agentskills.io).

The content is a frontend guide for AI coding agents: folder structure, naming, server-first data flow, shadcn/ui usage, `Field` + `useActionState` forms, token-only styling, and the loading/error/empty trio.

## Skill

| Item | Value |
|---|---|
| Name | `nextjs-shadcn-best-practices` |
| Entry | [skills/nextjs-shadcn-best-practices/SKILL.md](skills/nextjs-shadcn-best-practices/SKILL.md) |
| Full reference | [skills/nextjs-shadcn-best-practices/references/full-guide.md](skills/nextjs-shadcn-best-practices/references/full-guide.md) |

`SKILL.md` is the concise workflow an agent reads first when the skill triggers; the full rule set lives in `references/full-guide.md` and is loaded on demand. The skill folder is self-contained: copy it anywhere and it works.

## Install

Claude Code, as two separate prompts:

```text
/plugin marketplace add PipoLeong0305/ai-next-js-shadcn-ui-best-practices
```

```text
/plugin install nextjs-shadcn-best-practices@nextjs-shadcn-best-practices
```

Codex:

```bash
codex plugin marketplace add PipoLeong0305/ai-next-js-shadcn-ui-best-practices
codex plugin add nextjs-shadcn-best-practices@nextjs-shadcn-best-practices
```

Other agents (manual):

Copy the whole `skills/nextjs-shadcn-best-practices/` folder into the agent's skill discovery directory, for example `.agents/skills/` (Muse, Codex, Cursor, and similar) or `.claude/skills/` (Claude Code):

```bash
git clone git@github.com:PipoLeong0305/ai-next-js-shadcn-ui-best-practices.git
mkdir -p <project>/.agents/skills
cp -R ai-next-js-shadcn-ui-best-practices/skills/nextjs-shadcn-best-practices <project>/.agents/skills/
```

`SKILL.md` uses only standard frontmatter (`name` + `description`) and no vendor-specific extensions; check each agent's current documentation for its discovery directory.

## Use

After installing, the agent loads the skill automatically when a task matches its description, or you can name it explicitly:

```text
Use the nextjs-shadcn-best-practices skill to add a /projects page with a table, loading skeleton, and error state.
```

```text
Use the nextjs-shadcn-best-practices skill to add a login page, with the form built on Field + useActionState.
```

The target project's own conventions in its `AGENTS.md` / `CLAUDE.md`, `components.json`, and `package.json` (package manager, versions, aliases, language, auth, form stack) override this skill's generic defaults.

## Self-improvement loop

This skill does not edit itself. Its learning loop is semi-automatic:

1. **Collect**: while working with the main skill, when you correct the agent or lint/build fails because a rule was violated, the agent calls `scripts/log-feedback.mjs` to record the lesson in a local `~/.local/share/nextjs-shadcn-skill/feedback.jsonl` (override the path with `SKILL_FEEDBACK_FILE`). The plugin's `Stop` hook only records the list of changed frontend files as a raw signal. Other users can send feedback back through the repo's skill-feedback issue template.
2. **Review**: in this repo, tell any agent "use nextjs-shadcn-improve to review skill feedback". It reads the issues plus the local feedback, clusters and counts them, and only proposes a rule once the same lesson appears at least twice (or once for a severe failure); project-specific lessons are routed back to that project instead of the global skill. It opens a PR and never merges on its own.
3. **Evaluate**: before and after a proposed change, run `claude plugin eval . --trust-plugin` (cases in `evals/`: list page, login form, dark theme). Scores go in the PR; if they do not improve, the change is not merged.
4. **Release**: after merging, bump the version in both plugin manifests and push. Users refresh the marketplace in their agent, update the plugin, and start a new session.

Feedback stays on your machine and is never uploaded automatically; do not record secrets or customer data.

Record a lesson manually:

```bash
node scripts/log-feedback.mjs --lesson "<what to do instead>" --evidence "<what happened>"
```

## Layout

```text
.claude-plugin/
  marketplace.json
  plugin.json
.codex-plugin/
  plugin.json
.agents/
  plugins/
    marketplace.json
skills/
  nextjs-shadcn-best-practices/
    SKILL.md
    references/
      full-guide.md
  nextjs-shadcn-improve/
    SKILL.md
hooks/
  hooks.json
scripts/
  log-feedback.mjs
  log-feedback.test.mjs
evals/
  list-page/
  login-form/
  dark-theme/
```

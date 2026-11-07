# ai-next-js-shadcn-ui-best-practices

Next.js (App Router) + shadcn/ui 最佳实践，打包成一个跨 agent 的 [Agent Skill](https://agentskills.io)。

内容是一份给 AI coding agent 用的前端规范：目录结构、命名、Server-first 数据流、shadcn/ui 用法、`Field` + `useActionState` 表单、token-only 样式、loading/error/empty 三态。

## Skill

| Item | Value |
|---|---|
| Name | `nextjs-shadcn-best-practices` |
| Entry | [skills/nextjs-shadcn-best-practices/SKILL.md](skills/nextjs-shadcn-best-practices/SKILL.md) |
| Full reference | [skills/nextjs-shadcn-best-practices/references/full-guide.md](skills/nextjs-shadcn-best-practices/references/full-guide.md) |

`SKILL.md` 是精简版工作流，触发后先读它；完整规则在 `references/full-guide.md`，按需加载。整个 skill 文件夹自包含，拷走即可用。

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

把 `skills/nextjs-shadcn-best-practices/` 整个文件夹复制到该 agent 的 skill 发现目录，例如 `.agents/skills/`（Muse、Codex、Cursor 等）或 `.claude/skills/`（Claude Code）：

```bash
git clone git@github.com:PipoLeong0305/ai-next-js-shadcn-ui-best-practices.git
mkdir -p <project>/.agents/skills
cp -R ai-next-js-shadcn-ui-best-practices/skills/nextjs-shadcn-best-practices <project>/.agents/skills/
```

`SKILL.md` 只用了标准 frontmatter（`name` + `description`），不依赖任何单一厂商的扩展字段；发现目录以各 agent 当前官方文档为准。

## Use

安装后，任务命中 description 时 agent 会自动加载，也可显式点名：

```text
Use the nextjs-shadcn-best-practices skill to add a /projects page with a table, loading skeleton, and error state.
```

```text
用 nextjs-shadcn-best-practices skill 加一个登录页，表单按 Field + useActionState 做。
```

目标项目自己的 `AGENTS.md` / `CLAUDE.md`、`components.json`、`package.json` 里的约定（包管理器、版本、别名、语言、鉴权、表单栈）优先于本 skill 的通用默认值。

## Self-improvement loop

这个 skill 不会自己改自己。它的学习闭环是半自动的：

1. **收集**：用主 skill 干活时，被你纠正或因违反规则导致 lint/build 失败，agent 会调 `scripts/log-feedback.mjs` 把教训记到本地 `~/.local/share/nextjs-shadcn-skill/feedback.jsonl`（可用 `SKILL_FEEDBACK_FILE` 改路径）。插件的 `Stop` hook 只记录改动过的前端文件清单做原始信号。其他使用者也可以用仓库的 skill-feedback Issue 模板回流。
2. **复盘**：在本仓库里对任意 agent 说「用 nextjs-shadcn-improve 复盘 skill 反馈」。它读 Issue + 本地反馈，聚类计数，同类 ≥2 次（或单次严重失败）才提议入库；项目专属的教训会被分流回该项目，不进全局 skill。它只开 PR，不自动合并。
3. **评测**：改稿前后跑 `claude plugin eval . --trust-plugin`（用例在 `evals/`：列表页、登录表单、暗色主题），分数写进 PR，没变好就不合并。
4. **发布**：合并后同步 bump 两个 plugin manifest 的版本并 push。使用者在自己的 agent 里刷新 marketplace 并更新插件、开新会话即可。

反馈只存本机，不自动上传；记录时不要写密钥和客户数据。

手动记一条教训：

```bash
node scripts/log-feedback.mjs --lesson "<应该怎么做>" --evidence "<发生了什么>"
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

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
```

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

把 `skills/nextjs-shadcn-best-practices/` 整个文件夹复制或软链到你的 agent 的 skill 发现目录。项目级放在目标项目根目录下，用户级放在 home 下。

```bash
git clone git@github.com:PipoLeong0305/ai-next-js-shadcn-ui-best-practices.git
cd ai-next-js-shadcn-ui-best-practices
SKILL_DIR="$PWD/skills/nextjs-shadcn-best-practices"
```

| Agent | 项目级目录 | 用户级目录 |
|---|---|---|
| Muse / Codex / Cursor / Copilot 等支持 `.agents/skills` 的 agent | `<project>/.agents/skills/` | `~/.agents/skills/` |
| Claude Code | `<project>/.claude/skills/` | `~/.claude/skills/` |
| Muse | `<project>/.agents/skills/` | 用 `muse skills install <path>` 安装 |

复制（以 `.agents/skills` 为例）：

```bash
mkdir -p <project>/.agents/skills
cp -R "$SKILL_DIR" <project>/.agents/skills/
```

或软链（改这个仓库即同步生效）：

```bash
mkdir -p <project>/.agents/skills
ln -s "$SKILL_DIR" <project>/.agents/skills/nextjs-shadcn-best-practices
```

Claude Code 把上面路径中的 `.agents/skills` 换成 `.claude/skills` 即可。Muse 也可直接验证和检查：

```bash
muse skills validate skills/nextjs-shadcn-best-practices --json
```

各 agent 的发现目录以其当前官方文档为准；`SKILL.md` 本身只用了标准 frontmatter（`name` + `description`），不依赖任何单一厂商的扩展字段。

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
skills/
  nextjs-shadcn-best-practices/
    SKILL.md
    references/
      full-guide.md
```

# Command & Shortcut Cheat-Sheet

Everything you'll reach for, on one page. Bookmark it. Every command below is verified against **Claude Code v2.1.282** (2026-09-24); the authoritative, always-current list is [code.claude.com/docs](https://code.claude.com/docs) and `/help` in-session.

## Launch & flags (your shell)

| Command | Does |
|---|---|
| `claude` | Start an interactive session in the current dir |
| `claude --continue` | Resume the most recent session |
| `claude --resume` | Pick a past session from a list |
| `claude -p "prompt"` | **Headless** — run once, print, exit |
| `claude -p "…" --output-format json` | Structured output (also `text`, `stream-json`) |
| `claude --permission-mode plan -p "…"` | Set the mode: `auto`, `plan`, `acceptEdits`, `dontAsk`, `manual`, `bypassPermissions` |
| `claude -p "…" --allowed-tools "Edit,Bash(git commit *)"` | Pre-approve tools for batch/unattended runs (`--tools` restricts the set) |
| `claude --effort high` | Reasoning effort: `low`, `medium`, `high`, `xhigh`, `max` |
| `claude --model opus` | Pick a model by alias (`fable`, `opus`, `sonnet`) or full name |
| `claude -w` / `claude --worktree` | Start the session in a fresh git worktree |
| `claude -n oauth-work` | Name the session (prompt box, `/resume` picker, terminal title) |
| `claude --bg "task"` | Launch as a background agent (manage with `claude agents`) |
| `claude --cloud "task"` | Hand the task to a cloud session on claude.ai/code |
| `claude --teleport` | Pull a cloud session down to your local terminal |
| `claude --fallback-model sonnet -p "…"` | Auto-fallback when the primary model is overloaded |
| `claude --safe-mode` | Start with ALL customizations off — debug a broken config |
| `claude --dangerously-skip-permissions` | Skip all prompts — **only** in isolated/trusted envs |
| `claude -p "root cause?" < error.log` | Feed a file in (redirect avoids quoting a pipe) |

## Useful subcommands (your shell)

| Command | Does |
|---|---|
| `claude doctor` | Health-check your installation |
| `claude update` | Update to the latest version |
| `claude agents` | One screen for every background session: running, blocked, done (`--json` to script it) |
| `claude auto-mode config` | Inspect the auto-mode classifier rules (`critique` reviews your custom rules) |
| `claude mcp add / list / login` | Manage MCP servers from the shell |
| `claude plugin install <name>@<marketplace>` | Install a plugin non-interactively |
| `claude ultrareview` | Cloud-hosted multi-agent review of the current branch or a PR |
| `claude import` | Migrate config from another AI coding agent |

## In-session keys

| Key | Does |
|---|---|
| `Shift+Tab` | Cycle the permission mode (auto / accept-edits / **plan** …) |
| `Esc` | Interrupt Claude (context preserved) |
| `Esc` `Esc` | Open the rewind/checkpoint menu |
| `Ctrl+G` | Open the current plan in your editor (plan mode) |
| `Ctrl+C` | Cancel / exit |
| `@path` | Add a file to context (`@src/auth.ts`) |
| paste / drag | Add an image (screenshot, mockup) |

## Slash commands (in session)

| Command | Does |
|---|---|
| `/help` | List commands & shortcuts |
| `/init` | Generate a starter CLAUDE.md |
| `/clear` | Reset context (between unrelated tasks) |
| `/compact [focus]` | Summarize to reclaim context |
| `/rewind` | Restore a checkpoint (conversation/code/both) |
| `/model [name]` | Switch model (aliases, or `opusplan` = Opus plans, Sonnet executes) |
| `/effort [level]` | Reasoning effort for hard vs easy work |
| `/goal` | Set a completion condition Claude keeps working toward |
| `/permissions` | Allow/deny tools & commands |
| `/sandbox` | Run commands in an isolated sandbox |
| `/agents` | Reminder only: ask Claude, or edit `.claude/agents/`, to manage subagents |
| `/subtask` | Hand a side task to a subagent; result returns here |
| `/fork` | Copy this conversation into a new background session |
| `/branch` | Branch the conversation to try another direction |
| `/hooks` | Browse configured hooks |
| `/mcp` | Manage MCP servers |
| `/plugin` | Browse marketplaces & install plugins |
| `/skills`, `/reload-skills` | Manage / hot-reload skills |
| `/code-review` | Fresh-context review of the current diff |
| `/usage` (alias `/cost`), `/context` | Cost, plan limits & what uses them · context contents |
| `/statusline` | Set up a status line (context %, model, branch) |
| `/memory` | Edit memory files; toggle auto memory |
| `/doctor` | Full checkup that can also fix issues |
| `/install-github-app` | Wire up `@claude` on your GitHub repo |
| `/rename` | Name the session |
| `/btw` | Quick aside that doesn't enter history |

## The .claude/ folder

| Path | What |
|---|---|
| `CLAUDE.md` | Always-loaded project memory (keep it lean) |
| `CLAUDE.local.md` | Personal, gitignored |
| `~/.claude/CLAUDE.md` | Global (all your projects) |
| `.claude/rules/*.md` | Rules; ones with `paths:` frontmatter load only when matching files are touched |
| `.claude/settings.json` | Permissions, hooks, env (committed) |
| `.claude/settings.local.json` | Personal overrides (gitignored) |
| `.claude/commands/*.md` | `/slash` commands |
| `.claude/skills/<name>/SKILL.md` | Skills (auto + `/invoke`) |
| `.claude/agents/*.md` | Subagents |
| `.mcp.json` | Project MCP servers |
| `~/.claude/projects/<project>/memory/` | **Auto memory** — notes Claude keeps for itself |

## The loop, in four words

> **Explore · Plan · Code · Commit** — and always give Claude a way to **verify**.

:::tip Print it
This page works great as a printed desk reference or a pinned tab. Fork the repo and add your team's own commands and conventions to it.
:::

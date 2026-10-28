# What's New in Claude Code

Claude Code ships fast — this page pins the course to a date so you know what was checked. **Reviewed against v2.1.312, 2026-10-29**, using the installed CLI help and the official changelog. The sources to check afterwards are the official [weekly digests](https://code.claude.com/docs/en/whats-new) and [changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md).

## Since the previous course review

Checked against **v2.1.312 on 2026-10-29** (the previous review stopped at v2.1.288). Version numbers below come from the [changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md); the linked docs carry the current wording.

- **Headless runs start in Manual mode.** The permission-modes docs now list `default` (Manual) for every `claude -p` or Agent SDK run with no mode set, and a call that needs approval is **denied** unless an allow rule, a hook, an SDK `canUseTool` callback or `--permission-prompt-tool` answers it. The v2.1.302 changelog entry scoped the change to third-party providers, telemetry turned off and fresh installs; either way, pass `--permission-mode` and `--allowedTools` explicitly in every script ([permission modes](https://code.claude.com/docs/en/permission-modes#which-mode-a-non-interactive-run-starts-in)).
- **A failing hook can now block.** From v2.1.295, a `command` or `http` hook with `"onFailure": "block"` blocks the action when the hook cannot start, times out or exits with an unexpected code. Without it, a mistyped hook path still lets everything through ([hooks](https://code.claude.com/docs/en/hooks#block-the-action-when-a-hook-fails)). `UserPromptSubmit` hooks now run *before* a skill or custom command expands (v2.1.299), so a blocked prompt also stops its embedded shell commands.
- **Idle compaction.** From v2.1.299, a terminal conversation of 200K+ tokens left idle for about 54 minutes is compacted before its one-hour prompt cache expires. Turn it off in `/config` → Idle compaction (row added in v2.1.302), or with `"idleCompaction": false` in `settings.json`. Still inspect what a compaction kept before you continue.
- **Fork subagents are on by default everywhere** (v2.1.302): `claude -p`, the Agent SDK, the desktop app and VS Code join the terminal. The desktop app and VS Code now always run the main conversation's subagents in the background, as the terminal does; the sub-agents docs add that under `claude -p` and the SDK, Claude can wait on its own judgment or when you ask ([sub-agents](https://code.claude.com/docs/en/sub-agents#run-subagents-in-foreground-or-background)). `CLAUDE_CODE_FORK_SUBAGENT=0` turns forks off.
- **Subagents got dials.** An `effort` field in a subagent's frontmatter ([sub-agents reference](https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields)) and a per-call `effort` parameter on the Agent tool (v2.1.292), an `autoCompactWindow` so a subagent compacts earlier than the main window (v2.1.296), and a cap of 32 preloaded skills (v2.1.295). MCP permission rules now match the whole server name: write `mcp__<server>__*`, because `mcp__a` no longer covers `a__b` (v2.1.299).
- **MCP can ask to re-authenticate for additional scopes.** Review the added access before agreeing; a previously connected server is not blanket permission for broader access.
- **Background-session plumbing.** `claude attach <id|name>` and `claude logs <id|name>` accept part of a session name (v2.1.290), alongside `claude stop`, `claude rm` and `claude respawn`. `claude ultrareview` now requires workspace trust; scripts pass `--trust-workspace` (v2.1.309). `claude plugin install <name> --marketplace <source>` adds the marketplace and installs in one step (v2.1.292).
- **`/rewind` tracks less of Bash than you may think.** A `sed -i` edit now runs as written and is **not** restored by `/rewind` (v2.1.309); the checkpoint rules for Bash changes are in the [checkpointing docs](https://code.claude.com/docs/en/checkpointing#bash-command-changes-not-tracked). Commit first.
- **Models and effort.** Claude Haiku 5.5 (`claude-haiku-5-5`, 1M context) became the default Haiku (v2.1.293). `ultrathink` in the interactive terminal runs that turn at `xhigh` effort on Opus 5.5, Sonnet 5.5, Haiku 5.5 and Fable 5.1 through Anthropic's API, and typed mid-task it raises the rest of that turn (v2.1.311). The interactive WebSearch budget refills at 100 calls an hour instead of ending after 200 (v2.1.290).
- **Usage visibility.** `/usage` warns when max effort, workflows, always-on context or large tool results are eating your limits (v2.1.299); Pro and Max plans see a warning before resuming an inactive conversation that would use a noticeable share of the **5-hour limit**, the new name for the session limit (v2.1.304, v2.1.312).

## The headline shifts (Mar–Sep 2026)

### Permissions grew a brain
**Auto is the built-in starting mode for interactive terminal and VS Code sessions from v2.1.283**, subject to settings and availability. Its classifier reviews actions; explicit ask rules still prompt, and a classifier decision is not a safety guarantee. Check the [current mode rules](https://code.claude.com/docs/en/permission-modes), especially the separate non-interactive defaults. Audit custom classifier rules with `claude auto-mode critique`. Separately, [sandboxing](https://code.claude.com/docs/en/sandboxing) provides filesystem and network boundaries, with credential masking available through configuration.

### One session became a fleet
- **Background agents** — `claude --bg "task"`, with **`claude agents`** as the control tower for every running/blocked/done background session.
- **Named sessions that message each other** — `claude -n backend`, then "tell frontend the endpoint changed" ([cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging)).
- **Fork subagents** — `/subtask` spawns a subagent that inherits your full conversation, and `/fork` copies the conversation into a new background session. With nothing configured, a subagent Claude spawns from your main conversation starts in the background; in `claude -p` and the SDK, Claude can choose to wait ([sub-agents](https://code.claude.com/docs/en/sub-agents#run-subagents-in-foreground-or-background)).
- **Agent teams** (experimental, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) — shared task list, teammate messaging, a team lead ([docs](https://code.claude.com/docs/en/agent-teams)); Anthropic demoed a team building a C compiler ([HN](https://news.ycombinator.com/item?id=46903616)).
- **Dynamic workflows** — the keyword `ultracode` makes Claude generate and run a multi-agent orchestration plan for the task; `/workflows` lists runs ([docs](https://code.claude.com/docs/en/workflows) · [launch post](https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code)).

### It left the terminal
- **Cloud sessions** at [claude.ai/code](https://claude.ai/code): `claude --cloud` hands a task to an isolated VM, `claude --teleport` pulls it back down; **Routines** schedule recurring cloud agents ([docs](https://code.claude.com/docs/en/routines)); self-hosted environments run cloud sessions on your infra.
- **Remote Control** — start and steer a session on your machine from your phone ([docs](https://code.claude.com/docs/en/remote-control)).
- **Claude in Chrome** (`claude --chrome`) is GA ([docs](https://code.claude.com/docs/en/chrome)); the desktop app added a browser pane with element-select (⌘⇧S) and an iOS-simulator panel ([@ClaudeDevs, 2026-07-21](https://x.com/ClaudeDevs/status/2079674432038248611)).
- **`/design`** (early preview) — generate visual artboards for a feature and pick one before implementing ([@nateparrott, 2026-08-17](https://x.com/nateparrott/status/2089470636796059754)).

### Memory got two tiers
Beyond `CLAUDE.md`: **auto memory** (Claude keeps its own per-project notes in `~/.claude/projects/<project>/memory/`) and **path-scoped rules** (`.claude/rules/*.md` with `paths:` frontmatter) ([memory docs](https://code.claude.com/docs/en/memory)). Subagents can carry their own persistent memory via a `memory` frontmatter field.

### Quality-of-life you should actually adopt
| Feature | Why it matters |
|---|---|
| `/usage` | See which skills, MCP servers and subagents eat your plan limits |
| `/goal` | A completion condition Claude keeps working toward across turns |
| `/checkup` | Audits your setup for config issues and context dead weight |
| `/effort low…max` | Reasoning depth as a session dial; `ultrathink` in a prompt still deepens a single turn |
| `claude ultrareview` | Cloud-hosted multi-agent review of a branch or PR |
| `/rewind` after `/clear` | Since v2.1.191 the rewind menu can resume the conversation from before a `/clear`, in the same process |
| Hooks beyond shell | HTTP hooks, and prompt hooks judged by a fast LLM ([hooks](https://code.claude.com/docs/en/hooks)) |
| `claude import` | Migrate your config from another AI coding agent |

## Renamed or replaced — update your muscle memory

- The `/output-style` command was deprecated in v2.1.73 (styles moved to `/config`) and came back in v2.1.269 as `/output-style [name]` ([output styles](https://code.claude.com/docs/en/output-styles)).
- `claude project purge` became **`claude purge`** (the older spelling still works with a notice). It deletes local data only — transcripts, tasks and file history on this computer — not anything stored by Anthropic (v2.1.311 wording); read `claude purge --help` first.
- "Think hard" is no longer a keyword — set reasoning depth with the **`/effort`** dial; only `ultrathink` still works, for one turn.
- The classic engineering-blog "Claude Code Best Practices" post now redirects to the maintained docs page: [code.claude.com/docs/en/best-practices](https://code.claude.com/docs/en/best-practices).

## The ecosystem worth knowing

**Official (anthropics on GitHub):** [skills](https://github.com/anthropics/skills) (Anthropic's skill examples), [claude-plugins-official](https://github.com/anthropics/claude-plugins-official) (the curated plugin directory), [claude-code-action](https://github.com/anthropics/claude-code-action) (CI / `@claude`), and the [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) (TypeScript + Python).

**Community examples to evaluate:** [superpowers](https://github.com/obra/superpowers) (a workflow skill collection), [claude-mem](https://github.com/thedotmack/claude-mem) (memory tooling), [ccusage](https://github.com/ccusage/ccusage) (usage reporting), [claude-squad](https://github.com/smtg-ai/claude-squad) (agent/worktree management), [claude-hud](https://github.com/jarrodwatts/claude-hud) (a statusline display), and the navigation hubs [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) and [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills). These are examples, not an audited installation list.

:::warning Ecosystem hygiene
Maintenance and ownership can change. Before installing, check the repository's current maintainers, activity, permissions and dependencies. Read its listing or source, then use `claude plugin details <name>` to inspect what an installed plugin loads. Popularity alone does not establish suitability.
:::

:::tip How to stay current without homework
Skim the [weekly digest](https://code.claude.com/docs/en/whats-new) when something feels different, and run `/checkup` monthly. The concepts in this course — context, verification, delegation — are the stable layer; only the flag names move.
:::

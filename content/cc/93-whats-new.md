# What's New in Claude Code

Claude Code ships fast — this page pins the course to a date so you always know what's current. **Verified against v2.1.282, 2026-09-24.** The two sources that keep you up to date afterwards: the official [weekly digests](https://code.claude.com/docs/en/whats-new) and the [changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md).

## The headline shifts (Mar–Sep 2026)

### Permissions grew a brain
**Auto mode is now the default** on Pro/Max/Team: a classifier model reviews actions and blocks risky ones; Claude then tries another way, and you're asked only after repeated blocks. In Anthropic's study, humans clicking "approve" caught 13.6% of hidden dangerous commands; the classifier caught 89% ([@adocomplete, 2026-08-13](https://x.com/adocomplete/status/2087957562859913525)). Tune it in plain English and audit your rules with `claude auto-mode critique` ([permission modes](https://code.claude.com/docs/en/permission-modes)). Sandboxing matured alongside it: network egress allowlists and automatic credential masking ([sandboxing](https://code.claude.com/docs/en/sandboxing)).

### One session became a fleet
- **Background agents** — `claude --bg "task"`, with **`claude agents`** as the control tower for every running/blocked/done background session.
- **Named sessions that message each other** — `claude -n backend`, then "tell frontend the endpoint changed" ([cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging)).
- **Fork subagents** — `/subtask` spawns a subagent that inherits your full conversation, and `/fork` copies the conversation into a new background session; spawned subagents run in the background by default ([sub-agents](https://code.claude.com/docs/en/sub-agents)).
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
- "Think hard" is no longer a keyword — set reasoning depth with the **`/effort`** dial; only `ultrathink` still works, for one turn.
- The classic engineering-blog "Claude Code Best Practices" post now redirects to the maintained docs page: [code.claude.com/docs/en/best-practices](https://code.claude.com/docs/en/best-practices).

## The ecosystem worth knowing (stars as of 2026-08-25)

**Official (anthropics on GitHub):** [skills](https://github.com/anthropics/skills) (171k ★ — the Agent Skills standard + Anthropic's production skills), [claude-plugins-official](https://github.com/anthropics/claude-plugins-official) (34k ★ — the curated plugin directory), [claude-code-action](https://github.com/anthropics/claude-code-action) (8.7k ★ — CI/`@claude`), and the [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) (TypeScript + Python).

**Community standouts:** [superpowers](https://github.com/obra/superpowers) (277k ★ — an enforced brainstorm→plan→TDD methodology as skills), [claude-mem](https://github.com/thedotmack/claude-mem) (92k ★ — cross-session memory via hooks), [ccusage](https://github.com/ccusage/ccusage) (18k ★ — cost reporting from local transcripts), [claude-squad](https://github.com/smtg-ai/claude-squad) (8k ★ — a TUI managing agents in worktrees), [claude-hud](https://github.com/jarrodwatts/claude-hud) (28k ★ — a statusline HUD), and the navigation hubs [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) and [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills).

:::warning Ecosystem hygiene
Popularity moves fast and names churn (claude-flow became *ruflo*; get-shit-done was archived). Before installing anything: check the repo is the real one (top ecosystem repos warn about malicious mirrors), check it's maintained, and remember plugins run with **your** permissions — read its listing or repo before install, then run `claude plugin details <name>` to see what it loads.
:::

:::tip How to stay current without homework
Skim the [weekly digest](https://code.claude.com/docs/en/whats-new) when something feels different, and run `/checkup` monthly. The concepts in this course — context, verification, delegation — are the stable layer; only the flag names move.
:::

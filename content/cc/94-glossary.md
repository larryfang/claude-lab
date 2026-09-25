# Glossary

Every term in this course, in one or two sentences, in the words the lessons use. Terms are linked from the lessons: select a dotted word to see its definition without leaving the page.

## The core ideas

**Agentic loop** — the cycle Claude Code runs over and over: gather context, take an action, verify the result — until the goal is met. It is why Claude Code is an agent, not autocomplete.

**Context window** — everything Claude holds for a session: your messages, every file it read, every command's output. It is large, but it fills fast.

**Context rot** — the drop in quality as the context window fills: Claude starts forgetting earlier instructions and making more mistakes. The reason every best practice protects the context.

**Plan mode** — a mode in which Claude Code blocks file edits until you approve a plan. Claude can still read, search and run exploratory commands. Enter it with `Shift+Tab`; open the plan in your editor with `Ctrl+G`.

**Auto mode** — the default permission mode on Pro, Max and Team plans. A separate classifier model reviews actions and blocks risky ones; Claude then tries another way, and you are asked only after repeated blocks.

**Permission mode** — how much Claude may do without asking: `auto`, `plan`, `acceptEdits`, `dontAsk`, `manual` or `bypassPermissions`. `Shift+Tab` cycles Manual → Accept edits → Plan → Auto (when available); set `dontAsk` with `--permission-mode`, and `bypassPermissions` joins the cycle only when you start with it enabled.

**Effort** — how deeply Claude reasons: `low`, `medium`, `high`, `xhigh` or `max`, set with `/effort`. Raise it for hard problems; lower it for mechanical work.

**opusplan** — a `/model` setting in which Opus writes the plan and Sonnet carries it out.

## Context and memory

**CLAUDE.md** — the memory file Claude loads at the start of every session: commands, conventions and gotchas. Keep it under about 200 lines, because every line competes with your task.

**CLAUDE.local.md** — your personal, gitignored project memory.

**Memory hierarchy** — your global `~/.claude/CLAUDE.md`, the project's `CLAUDE.md`, and files in subfolders. Subfolder files add to what is above them; they do not replace it.

**Path-scoped rules** — Markdown files in `.claude/rules/` with `paths:` frontmatter, which load only when Claude touches matching files. A rule without `paths:` loads every session.

**Auto memory** — notes Claude keeps for itself in `~/.claude/projects/<project>/memory/`.

**Checkpoint** — a restore point Claude records as it works. `/rewind` (or `Esc` `Esc` on an empty prompt) rolls the conversation, the code, or both back to one.

**Compaction** — `/compact` summarises a long session to reclaim context while keeping the thread. `/clear` is the full reset between unrelated tasks.

## The workflow

**Headless mode** — running Claude once without the interactive screen: `claude -p "prompt"` prints the result and exits. The basis for scripts, batch jobs and CI.

**Worktree** — a separate git working folder on its own branch, so parallel sessions never edit the same files. `claude -w` starts a session in a fresh one.

**Background agent** — a session started with `claude --bg` that works on its own. `claude agents` shows every background session: running, blocked or done.

**Cloud session** — a task handed to claude.ai/code with `claude --cloud`. `claude --teleport` pulls it back into your terminal.

**TDD (test-driven development)** — write a failing test first, then the code that makes it pass. With an agent, the test is the definition of done.

**Stop hook** — a hook that runs your check when Claude tries to finish, and blocks the turn from ending until the check passes.

**Regression test** — a test you keep after fixing a bug. It fails if the bug ever comes back, and documents the bug better than a comment.

**git bisect** — a git command that searches your history for the first commit that broke something. Give Claude the failing test as the check at each step.

## Customising Claude Code

**Subagent** — a specialist with its own separate context window, defined in a file in `.claude/agents/` (ask Claude to write it; `/agents` now only points you there). It does the investigating and returns only a summary to your session. Most subagents load `CLAUDE.md`, but none load your auto memory; a `memory` field gives one memory of its own.

**Explore subagent** — the built-in subagent for investigating code. It skips `CLAUDE.md` and git status to stay lean, so restate any rule it must follow in the handoff.

**Skill** — a folder in `.claude/skills/` with a `SKILL.md`. Claude loads it when your request matches its `description`, or when you invoke it by name.

**Custom command** — a Markdown file in `.claude/commands/` that becomes a slash command. `$ARGUMENTS` passes in what you type after it.

**Hook** — a script that runs at a lifecycle event, configured in `.claude/settings.json`. An instruction can be forgotten; a hook always happens. Hooks in a skill's frontmatter stay active for the rest of the session; a subagent's run only while it runs.

**PreToolUse** — the hook event before a tool runs. It can block the call (with `exit 2`), so it is used to protect files and guard dangerous commands.

**PostToolUse** — the hook event after a tool runs, used to format, lint or run the affected tests after every Edit or Write call.

**MCP (Model Context Protocol)** — the open standard for connecting Claude Code to tools and data. Add a server with `claude mcp add`; project servers live in `.mcp.json`.

**Plugin** — a bundle of skills, subagents, hooks and MCP servers in one installable unit. `/plugin` opens the marketplace browser.

**settings.json** — `.claude/settings.json` holds the team's permissions, hooks and environment (committed); `.claude/settings.local.json` holds your personal overrides (gitignored).

**Allowlist** — permission rules, set with `/permissions` or in settings, that let named tools or commands run without asking.

**Safe mode** — `claude --safe-mode` starts with every customisation off, to debug a broken configuration.

## Failure patterns

**Kitchen-sink session** — one session that drifts from task to task until the context is full of noise. Fix: `/clear` between unrelated tasks.

**Correcting over and over** — correcting the same mistake again and again until the context is full of failed attempts. Fix: after two failed corrections, `/clear` and write a sharper prompt.

**Over-specified CLAUDE.md** — a memory file so long that Claude ignores half of it. Fix: prune it, and turn must-happen rules into hooks.

**Trust-then-verify gap** — shipping plausible code that was never checked against its edge cases. Fix: always give Claude a way to verify, and read the evidence.

**Infinite exploration** — an unscoped "investigate this" that reads hundreds of files. Fix: scope it narrowly, or hand it to a subagent.

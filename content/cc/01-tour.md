# The TUI & Session Basics

Let's get fluent in the terminal UI. None of this is hard — it's a chat box that can also run your computer. Here's everything that matters.

## Starting a session

Open your project and launch Claude in it:

```bash
cd your-project
claude
```

Claude starts **in that directory** — it can see and work with the files there. You then type in plain English, or use **slash commands** (they start with `/`).

:::tip Start in the right folder
Claude Code's view of the world is rooted where you launched it. Start it at your repo root so it can find your code, your `CLAUDE.md`, and your config.
:::

## The modes (Shift+Tab)

Press **Shift+Tab** to cycle the permission/working mode. This is one of the most important keys in the tool:

| Mode | What it does |
|---|---|
| **Auto** | A classifier model reviews each action and interrupts you only for risky ones — the **default** on Pro/Max/Team plans |
| **Accept edits** | Applies file edits without asking (faster when you trust the task) |
| **Plan mode** | **Read-only.** Claude can explore and propose a plan, but *cannot* edit files or run destructive commands |
| **Manual** | Asks permission before every edit and command — the classic, most cautious mode |

(The full set, including `dontAsk` and `bypassPermissions`, is in the [permission-modes docs](https://code.claude.com/docs/en/permission-modes) — more in the Permissions lesson.)

:::concept Plan mode is enforced, not suggested
In plan mode, Claude is blocked at the **tool level** from editing or running destructive commands — it can only read, search, and think. That's why it's the safe way to let Claude loose on an unfamiliar codebase. We'll go deep on it in the workflow module.
:::

## The keys that matter

- **Enter** — send. **`Esc`** — interrupt Claude mid-action (context is preserved, so you can redirect).
- **`Esc` `Esc`** (double-tap) or **`/rewind`** — open the checkpoint menu to restore previous conversation/code state. Every prompt is a checkpoint.
- **`@`** — reference a file (`@src/auth.ts`) so Claude reads it before responding.
- **`#`** — quickly save a note to memory (`# always run prettier before committing` adds it to CLAUDE.md).
- **Paste / drag an image** — Claude can see screenshots, mockups, diagrams.
- **`Ctrl+C`** — cancel / exit. **`Ctrl+G`** — open the current plan in your text editor (in plan mode).

## Slash commands you'll use constantly

There are dozens of built-ins (`/help` shows the live list). The ones you'll actually reach for:

| Command | Does |
|---|---|
| `/help` | List commands and shortcuts |
| `/init` | Generate a starter `CLAUDE.md` from your codebase |
| `/clear` | Wipe context for a fresh, unrelated task |
| `/compact` | Summarize the conversation to reclaim context (optionally `/compact focus on X`) |
| `/rewind` | Restore a previous checkpoint (conversation, code, or both) |
| `/model` | Switch models (aliases like `opus`/`sonnet`, or `opusplan` — Opus to plan, Sonnet to execute) |
| `/permissions` | Allowlist commands/tools so you're not asked every time |
| `/agents`, `/hooks`, `/mcp`, `/plugin` | Manage subagents, hooks, MCP servers, plugins |
| `/code-review` | Run a fresh-context review of your current diff |
| `/cost`, `/context`, `/usage` | Token spend · what's filling your context · plan-limit usage |
| `/statusline` | Put context %, model, and branch permanently in view |

## Sessions persist (treat them like branches)

Your conversations are saved locally, so a task can span multiple sittings:

```bash
claude --continue   # resume the most recent session
claude --resume     # pick a session from a list
```

Use `/rename` to name a session (e.g. `oauth-migration`) so you can find it later. Each workstream gets its own persistent context.

## See it in action

Here's a *simulated* session so you can feel the rhythm. **Type the suggested command exactly and press Enter** — or leave the field blank and hit **Run ▶**. This is a guided transcript, so each step checks the expected input before showing its response.

```claude-sim
# Welcome to Claude Code (simulated). Try the steps below.
> /help
Claude Code — common commands:
  /init       Generate a CLAUDE.md for this project
  /clear      Reset context between tasks
  /compact    Summarize to reclaim context
  /rewind     Restore a previous checkpoint
  /model      Switch model (try: opusplan)
  /permissions, /agents, /hooks, /mcp, /plugin
Shortcuts: Shift+Tab = cycle modes · Esc = interrupt · @file = add file · # = save memory
> how does this project handle configuration?
I read package.json and src/config/. Configuration loads from:
  • src/config/index.ts — merges defaults with env vars
  • .env (gitignored) — local secrets like API_KEY
  • Validated at startup by config.schema.ts (zod)
Want me to trace where API_KEY is consumed?
> yes, and which files would break if it's missing
Tracing usage of API_KEY…
  • src/clients/api.ts:12 — throws "Missing API_KEY" at startup
  • src/jobs/sync.ts:30 — used in the auth header
If API_KEY is unset, startup fails fast in api.ts. Nothing reaches sync.ts.
```

:::note That was a simulation
The box above is a guided demo so you can practice the flow safely. The *real* magic happens in your own terminal — which you'll do next lesson.
:::

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What does **Shift+Tab** do?
A: It cycles the permission/working mode: Auto, Accept edits, Plan mode, Manual.

Q: What is Claude blocked from doing in plan mode?
A: Editing files or running destructive commands. The block is at the tool level, so it can only read, search, and think.

Q: How do you interrupt Claude mid-action without losing context?
A: Press `Esc`. Context is preserved, so you can redirect.

Q: How do you restore an earlier conversation or code state?
A: Double-tap `Esc` or run `/rewind` to open the checkpoint menu. Every prompt is a checkpoint.

Q: `/clear` or `/compact` — which one before an unrelated task?
A: `/clear` wipes context for a fresh, unrelated task. `/compact` only summarizes the conversation to reclaim context.

Q: How do you pick up a session from an earlier sitting?
A: `claude --continue` resumes the most recent session; `claude --resume` lets you pick one from a list.
```

```quiz
Q: You're about to let Claude work in a codebase you don't know well. Which mode is safest to start in?
- Auto-accept edits
+ Plan mode (Shift+Tab) — read-only, so it can explore and plan but not change anything
- Normal mode with permissions disabled
- There is no safe mode
> Plan mode is enforced at the tool level — Claude can only read, search, and think. Ideal for exploring unfamiliar code.

Q: You finished one task and want to start something totally unrelated. Best move?
+ /clear to reset the context window
- Keep going in the same session
- Restart your computer
- /model
> /clear between unrelated tasks keeps the context clean. A "kitchen sink" session degrades performance.

Q: What does `@src/auth.ts` do in a prompt?
+ Tells Claude to read that file before responding
- Emails the file
- Deletes the file
- Nothing
> `@` references a file so Claude pulls it into context — better than describing where code lives.
```

:::try Your turn for real
Enough watching. Next is a hands-on lab: a guided first session you run in the in-browser terminal, then mirror in your own.
:::

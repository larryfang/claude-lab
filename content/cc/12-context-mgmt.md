# Managing Context Live

`CLAUDE.md` is your *baseline* context. This lesson is about steering context **mid-session** — the moves that keep a long workday with Claude fast and sharp.

## /clear — the reset button

Between **unrelated** tasks, run `/clear`. It wipes the conversation so the next task starts fresh.

:::warning The "kitchen sink" trap
Working on task A, you ask about unrelated thing B, then go back to A. Now A's context is polluted with B. Quality drops. **Fix:** `/clear` between unrelated tasks. It's the most common rookie mistake — and the easiest fix.
:::

## /compact — summarize without losing the thread

When you're **deep in one task** but the window is filling, don't clear (you'd lose useful history). Instead **compact** — at the Claude prompt, type either:

```text
/compact
/compact focus on the API changes and the failing test
```

`/compact` summarizes the conversation, preserving key code, file states, and decisions while freeing space. Claude also **auto-compacts** when you approach the limit. You can guide it from `CLAUDE.md` too, e.g. *"When compacting, always preserve the list of modified files and test commands."*

## /rewind — checkpoints, not chaos

Every **user prompt** you send creates a **checkpoint**. Claude snapshots files before each change, so you can roll back ([checkpointing docs](https://code.claude.com/docs/en/checkpointing)).

- **`Esc` `Esc`** (double-tap, with an empty prompt) or `/rewind` → open the rewind menu
- Restore **conversation only**, **code only**, **both**, or **summarize from here**
- Since v2.1.191 the rewind menu can even resume the conversation from **before a `/clear`**, while you're still in the same Claude Code process ([changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md))

:::concept Be bold, then rewind
Because rewinding is cheap, you can tell Claude to **try a bold edit**. If it goes sideways, rewind and try another angle. Checkpoints persist across sessions. *(Rewind only undoes edits from Claude's file-editing tools — not changes made by Bash commands like `rm`, `mv` or a migration, and usually not subagent edits. Commit first; it's not a replacement for git.)*

Want to keep the current state *and* explore an alternative? **`/branch`** forks the conversation to try another direction, and **`/fork`** copies the whole session into a new background session that keeps working while you continue here.
:::

## Subagents — investigate without polluting

When a task needs Claude to **read a lot** (explore a subsystem, hunt for a pattern), delegate it:

```prompt
Use subagents to investigate how our auth system handles token refresh, and whether we already have OAuth utilities I should reuse. Report back a summary with file references.
```

The subagent explores in its **own context window** and returns just a **summary** — so your main session stays clean and focused on building. (Deep dive in the Customize module.)

## Feed context efficiently

- **`@file`** — `@src/auth.ts` pulls a specific file in (beats "read the whole repo").
- **Paste/drag images** — screenshots, mockups, error dialogs, design comps.
- **Pipe data in** — `cat error.log | claude -p "root cause?"` sends file contents directly.
- **Give URLs** — and `/permissions` to allowlist docs domains you use often.
- **`/btw`** — ask a quick side question that *doesn't* enter the conversation history ([commands](https://code.claude.com/docs/en/commands)).

:::tip Audit the standing overhead: /checkup
Context isn't only what you add mid-session — it's also what loads *every* session: skills, MCP servers, plugins, CLAUDE.md. **`/checkup`** audits that standing setup — flagging unused pieces and duplicated rules — and offers fixes. Claude Code's creator announced it as a way to clean up unused skills, MCP servers and plugins, and to dedupe `CLAUDE.md` ([@bcherny, 2026-07-08](https://x.com/bcherny/status/2074997570317779038)).
:::

## Course-correct early

Tight feedback loops beat long ones:

- **`Esc`** — interrupt the moment Claude drifts (context is preserved; just redirect).
- **"undo that"** — have Claude revert its last change.
- Corrected the same thing **twice**? Stop. `/clear` and write a sharper prompt that bakes in what you learned. A clean restart beats fighting a polluted session.

## Feel it

```claude-sim
# You've been deep in a refactor; the window is getting full.
> /compact focus on the rate limiter changes and the failing concurrency test
Compacted. Kept: 4 modified files (middleware/rateLimiter.ts, …), the failing
test concurrency.test.ts, and the decision to use a token-bucket algorithm.
Freed ~38k tokens. Ready to continue.
> now use a subagent to check if any other middleware already does rate limiting
Delegating to a subagent (separate context)…
Subagent report:
  • No existing rate limiter. middleware/throttle.ts is unrelated (per-IP request log only).
  • Reuse candidates: utils/redis.ts (shared client), config/limits.ts (defaults).
Your main context stayed clean — only this summary was added.
> good. implement using utils/redis.ts and the defaults in config/limits.ts
```

## Make the call

Choose what you would do, read the consequence, then try the other options.

```scenario
S: You just finished a login bug fix, and in the same session you now want to start an unrelated CSV export feature.
Q: What do you do before you describe the new task?
+ Run `/clear`, then describe the CSV export task.
> The new task starts fresh, with no login-bug detail in the way. It's the easiest fix for the most common rookie mistake.
~ Run `/compact`, then describe the CSV export task.
> You get space back, but a summary of the bug fix still rides along into an unrelated task. `/compact` is for staying deep in *one* task.
- Type the new request and keep going.
> This is the kitchen sink trap: the export work runs on context polluted with the bug fix, and quality drops.

S: Mid-refactor, you need to know whether any other middleware already does rate limiting, and finding out means reading a lot of files.
Q: How do you get the answer?
+ Ask Claude to use a subagent to investigate and report back a summary with file references.
> The subagent explores in its own context window and returns just a summary, so your main session stays clean and focused on building.
~ Let Claude read the middleware files in the main session, then run `/compact` afterwards.
> You get the answer, but every file read fills your main window first, and you depend on the summary to keep the refactor details you need.
- Ask Claude to read the whole `src/` folder so it has everything.
> "Read the whole `src/` folder" sprawl is exactly what eats context. The refactor details start to get lost in the noise.
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: When do you `/clear`, and when do you `/compact`?
A: `/clear` between **unrelated** tasks. `/compact` when you are deep in one task and the history is still useful.

Q: What does `/compact` keep while it frees space?
A: Key code, file states, and decisions. Give it a focus, e.g. `/compact focus on the API changes and the failing test`.

Q: What creates a checkpoint, and how do you open the rewind menu?
A: Every user prompt you send creates a checkpoint. Double-tap `Esc` on an empty prompt, or run `/rewind`, to open the menu.

Q: Do checkpoints replace git?
A: No. They track only edits from Claude's file-editing tools — not Bash changes like `rm` or `mv`.

Q: You corrected the same thing twice. What now?
A: Stop. `/clear` and write a sharper prompt that bakes in what you learned.

Q: How do you ask a side question that stays out of history?
A: Use `/btw`. It doesn't enter the conversation history.
```

```quiz
Q: You're 40 messages deep on ONE feature and the window is filling, but the history is still useful. Best move?
- /clear (start over)
+ /compact — summarize to reclaim space while keeping key code and decisions
- Keep going until it breaks
- Restart Claude
> /clear is for *unrelated* task switches. When you're deep in one task, /compact preserves the thread while freeing space.

Q: Why delegate a big investigation to a subagent?
+ It explores in a separate context and returns only a summary, keeping your main window clean
- It's faster to type
- Subagents are free
- It edits files for you automatically
> Investigation reads lots of files = lots of tokens. Subagents quarantine that cost and report back a distilled summary.

Q: You've corrected Claude on the same issue twice and it's still wrong. Do what?
+ /clear and restart with a sharper prompt incorporating what you learned
- Correct it a third, fourth, fifth time
- Give up on Claude Code
- Switch to a bigger model and keep going
> After two failed corrections the context is polluted with dead ends. A clean session + better prompt wins.
```

:::try Next
Theory locked in. Time for a lab: run `/init` and tune a real `CLAUDE.md` until Claude's behavior visibly shifts.
:::

# Context Is the Whole Game

If you remember one thing from this course, make it this lesson. **Managing context is *the* skill** of working with Claude Code. Every other technique — CLAUDE.md, plan mode, subagents — exists to serve it.

## The constraint, restated

Claude's **context window** holds the entire session: your messages, every file it reads, every command's output. It's large, but it **fills fast** — a single debugging spree can burn tens of thousands of tokens. And here's the catch:

:::warning Keep relevant context easy to find
Large amounts of unrelated material can make important instructions harder to follow. Context usage is a useful signal, not a guarantee of quality. Keep the current goal, constraints and verification evidence clear, and check the result rather than judging it from the meter alone.
:::

## What eats your context

- **Reading files** — especially "read the whole `src/` folder" sprawl
- **Command output** — a noisy test run or a giant log dumped into the chat
- **Long meandering conversations** — ten tangents in one session
- **An over-stuffed CLAUDE.md** kept in the session context (next lesson)

## The prime directive

> **Keep the working context small and relevant.** Give Claude exactly what the current task needs — no more.

A **fresh session with a sharp prompt** helps when the old conversation is mostly unrelated. For ongoing work, preserve useful decisions and evidence with a focused handoff or compaction.

## Your context toolkit (preview)

You'll learn each of these in the next lessons; here's the map so the pieces connect:

| Tactic | What it does |
|---|---|
| **Precise prompts + `@file`** | Pull in *specific* files, not the whole repo |
| **A tight `CLAUDE.md`** | Persistent, broadly-useful context — kept short |
| **Subagents for investigation** | Research in a *separate* window; only a summary returns |
| **`/clear`** | Wipe context between unrelated tasks |
| **`/compact`** | Summarize a long session to reclaim space |
| **`/rewind`** | Roll back to a clean checkpoint |

:::tip See it filling
Run `/context` to see what's currently occupying the window, `/usage` to see which skills, subagents and MCP servers are eating your plan limits, and `/statusline` to keep a context-usage readout permanently in view. You can't manage what you can't see — and once you *watch* a session fill up, this all becomes second nature.
:::

:::concept Prune standing instructions
The [official memory guide](https://code.claude.com/docs/en/memory) recommends short instruction files and moving narrowly relevant material into skills or path-scoped rules. Keep the commands and project decisions Claude needs; remove repetition and facts it can reliably discover from the code.
:::

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What happens to Claude as the context window fills?
A: Important details can become harder to follow when irrelevant material accumulates. Check relevance and the result, then compact or start fresh when appropriate.

Q: What four things eat your context?
A: Reading files, command output, long meandering conversations, and an over-stuffed `CLAUDE.md` in the session context.

Q: What is the prime directive of context?
A: **Keep the working context small and relevant.** Give Claude exactly what the current task needs — no more.

Q: Long session full of detours, or fresh session with a sharp prompt?
A: Start fresh for unrelated work. Preserve useful decisions and evidence when continuing the same task.

Q: How do you see what is filling your context?
A: `/context` shows what occupies the window, `/usage` shows what eats your plan limits, and `/statusline` keeps a context-usage readout in view.

Q: How do subagents protect your context?
A: They research in a *separate* window, and only a summary returns to yours.
```

```quiz
Q: Why is a long, multi-topic session a problem?
+ Unrelated material makes the current task's instructions and evidence harder to keep in focus
- It costs slightly more money but works the same
- Long sessions are actually always better
- The terminal runs out of space
> Keep context relevant and verify the result. Use a fresh session for unrelated work; compact when useful history belongs to the task you are continuing.

Q: Which is usually the better move?
- Keep one giant session running all day across many tasks
+ Use fresh, focused sessions with sharp prompts; clear or compact when the window fills
- Never read any files
- Paste your entire codebase up front
> A clean session with a good prompt beats a polluted one. Feed only what the task needs.

Q: What's the single highest-leverage idea behind nearly every Claude Code best practice?
+ Manage the context window — it's the fundamental constraint
- Use the most expensive model
- Type faster
- Disable permissions
> Everything — CLAUDE.md, plan mode, subagents — is in service of keeping context focused.
```

:::try Next
The number-one tool for giving Claude *persistent, broadly-useful* context — without bloating every turn — is `CLAUDE.md`. Let's master it.
:::

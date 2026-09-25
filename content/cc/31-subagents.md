# Subagents

A **subagent** is a specialist Claude can delegate to — running in its **own context window**, with its **own tools and system prompt**, returning only a **summary** to your main session. They're the single best tool for protecting context (remember: context is everything).

## Why they matter

When Claude researches a codebase or reviews a big diff, it reads lots of files — all of which would normally pile into *your* context. A subagent does that work **in a separate window** and hands back a distilled result:

```text
   main session ──"investigate X"──▶  subagent (fresh context)
        ▲                                  │ reads 20 files,
        └────────  summary only  ◀─────────┘ returns 5 bullets
```

Your main conversation stays lean and focused on building.

## Defining one

A subagent is a Markdown file in `.claude/agents/` (project) or `~/.claude/agents/` (personal), with frontmatter + a system prompt:

```markdown
<!-- .claude/agents/code-reviewer.md -->
---
name: code-reviewer
description: Reviews a diff for bugs, security, and convention violations. Use after implementing a change.
tools: Read, Grep, Glob, Bash
model: sonnet
---
You are a senior reviewer. Flag actual bugs, security issues, and convention
violations — not style nitpicks. For each finding, give the file:line and a
specific suggested fix. Report only issues that affect correctness or the stated
requirements. If the diff is clean, say so.
```

Key frontmatter ([sub-agents reference](https://code.claude.com/docs/en/sub-agents)):
- **`name`** / **`description`** — the description is how Claude decides when to delegate.
- **`tools`** — restrict what it can do (a reviewer needs Read/Grep/Bash, not Write).
- **`model`** — e.g. `haiku` for fast read-only research, `opus` for hard reasoning.
- **`memory`** — give the subagent its **own persistent memory** across sessions (subagents don't share the main session's auto memory): its `MEMORY.md` loads at start, and the subagent writes to its memory folder as it works ([@lydiahallie, 2026-07-20](https://x.com/lydiahallie/status/2079255826355892464)). It also turns on Read, Write and Edit, so a read-only reviewer gains write tools.

Create or change them by asking Claude, or edit the files in `.claude/agents/` directly (since v2.1.198, `/agents` only prints that reminder). Subagents spawned mid-session run **in the background by default**, so your conversation keeps moving while they work.

## Invoke them — by name or on purpose

Claude auto-delegates when relevant, or you can be explicit:

```prompt
Use a subagent to investigate how token refresh works and whether we have OAuth utilities to reuse. Summarize with file references.
```
```prompt
Use the code-reviewer subagent on my current diff.
```

Two related commands round out delegation ([commands reference](https://code.claude.com/docs/en/commands)):

- **`/subtask`** — hand a side task to a subagent; the result comes back into *this* conversation.
- **`/fork`** — copy the whole conversation into a **new background session** that inherits everything you've discussed, then keep working here. Perfect for "also try the other approach while I continue."

## The built-ins: Explore & Plan

Claude Code ships with subagents it invokes automatically:

| Built-in | Role |
|---|---|
| **Explore** | Fast, **read-only** codebase research — it inherits the main session's model (capped at Opus on the Claude API) and keeps bulky exploration out of the main context |
| **Plan** | Does the research during plan mode so your main agent stays focused on presenting the plan |

:::warning Shadow the built-ins only on purpose
A project or user subagent named `Explore` or `Plan` replaces the built-in with your prompt, tools and model. Do it only on purpose — for example, an `Explore` pinned to `model: haiku` to keep exploration cheap — never by accident.
:::

## Two rules that make subagents great

:::concept Specific beats general
A **feature-specific** subagent (`payment-flow-reviewer`, `migration-explorer`) outperforms a vague one (`qa`, `backend-engineer`). Specificity buys better tool selection and tighter context.
:::

:::warning Know the two lean exceptions
Custom and general-purpose subagents load the same `CLAUDE.md` hierarchy as the main conversation (unless a custom one sets `omitClaudeMd: true`), but not your auto memory. The built-in **Explore** and **Plan** agents deliberately skip `CLAUDE.md` and git status to stay lean. Restate a rule in the delegation prompt when Explore or Plan must follow it, or when the rule is important enough to make explicit in the handoff.
:::

## See it delegate

```claude-sim
# You just implemented a change and want a fresh-eyes review.
> use the code-reviewer subagent on my current diff
Delegating to code-reviewer (separate context, tools: Read/Grep/Bash)…
code-reviewer report:
  • src/auth/oauth.ts:41 — state param isn't validated on callback (CSRF risk). Fix: compare against the stored state before exchanging the code.
  • src/auth/oauth.ts:58 — error path leaks the raw provider response in the 500 body. Fix: log it, return a generic message.
  • Tests: callback happy-path covered; no test for denied consent.
Two correctness issues + one test gap. Want me to fix all three?
> fix the CSRF and error-leak issues, add the denied-consent test, then re-review
```

## Make the call

Choose what you would do, read the consequence, then try the other options.

```scenario
S: You want a reusable reviewer for your payment code, and you are writing its file in `.claude/agents/`.
Q: Which definition do you write?
+ A `payment-flow-reviewer` with `tools: Read, Grep, Glob, Bash` and a description that says when to use it.
> Specificity buys better tool selection and tighter context. A reviewer needs Read/Grep/Bash, not Write, and the description is how Claude decides when to delegate.
~ A general `qa` subagent with the same read-only tools, used for every review.
> It still keeps the review out of your main context, but a vague agent loses to a feature-specific one on tool selection and focus.
- An agent named `Plan` with every tool enabled, so it can also fix what it finds.
> Naming it `Plan` replaces the built-in plan-mode researcher with your reviewer, so plan mode now runs it. Every tool also throws away the read-only restriction both roles should have.

S: Your `CLAUDE.md` says the old `v1/` API is deprecated. You ask Claude to have the built-in Explore subagent find utilities you can reuse.
Q: How do you hand off the search?
+ Restate the rule in the delegation prompt: ignore the deprecated `v1/` code.
> Explore deliberately skips `CLAUDE.md` to stay lean, so the rule only reaches it when the handoff states it.
~ Delegate to a custom subagent instead, because it loads `CLAUDE.md`.
> That works — custom subagents load the same `CLAUDE.md` hierarchy — but you give up fast, read-only Explore for a rule that one sentence could carry.
- Delegate as usual; Explore reads `CLAUDE.md` like the main session does.
> It doesn't. Explore skips `CLAUDE.md` and git status, so its summary can recommend the deprecated code.
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: Where does a subagent's context go?
A: It runs in its **own context window**. Only a **summary** returns to your main session.

Q: Where do subagent definitions live?
A: A Markdown file in `.claude/agents/` (project) or `~/.claude/agents/` (personal), with frontmatter and a system prompt.

Q: How does Claude decide when to delegate to a subagent?
A: From the subagent's `description` frontmatter.

Q: Which built-in subagents skip `CLAUDE.md` and git status?
A: **Explore** and **Plan**. Restate a rule in the delegation prompt when they must follow it.

Q: What happens if you name a custom subagent `Explore` or `Plan`?
A: It replaces the built-in. Do it only on purpose, for example an `Explore` pinned to `haiku`.

Q: `/subtask` or `/fork` — what is the difference?
A: `/subtask` hands a side task to a subagent and the result comes back here. `/fork` copies the whole conversation into a new background session.
```

```quiz
Q: What's the #1 reason to use a subagent?
+ It runs in a separate context window and returns only a summary, keeping your main context clean
- It's a different AI model from a different company
- It edits files twice as fast
- It removes the need for tests
> Investigation/review reads lots of files. Subagents quarantine that token cost and report back a distilled result.

Q: Which built-in subagents deliberately skip CLAUDE.md and git status to keep research lean?
+ Explore and Plan; custom and general-purpose subagents load the normal memory hierarchy
- Every subagent
- Only custom reviewer agents
- No subagent ever skips project memory
> Explore and Plan are the lean exceptions. Custom and general-purpose subagents receive the CLAUDE.md hierarchy (but not your auto memory), while still starting without your conversation history unless you explicitly fork it.

Q: Which subagent design is better?
+ A specific one like "payment-flow-reviewer" with a tight toolset
- A vague catch-all "engineer" that does everything
- Naming it "Plan" to reuse the built-in
- One giant agent with all tools enabled
> Specificity buys better tool selection and tighter context. A custom "Plan" replaces the built-in rather than reusing it, so shadow a built-in name only on purpose.
```

:::try Next
Commands and subagents are *advisory* — Claude chooses when to use them. **Hooks** are different: they run automatically, every time, guaranteed.
:::

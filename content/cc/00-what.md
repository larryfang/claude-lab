# It's an Agent, Not Autocomplete

You've installed Claude Code and run `claude`. Before you start firing prompts, spend five minutes on the mental model — it's the difference between fighting the tool and flying with it.

## What Claude Code actually is

**Claude Code is an agentic coding environment that lives in your terminal (and IDE).** Unlike a chatbot that answers and waits, Claude Code can **read your files, run commands, make changes, and work through a problem autonomously** while you watch, redirect, or step away.

:::concept The shift in how you work
Old way: *you* write the code, then ask an AI to review it.
Claude Code: *you describe the outcome*, and Claude **explores, plans, and implements** — then you review and steer.

You move from **typist** to **tech lead**: setting direction, reviewing diffs, and course-correcting, while the agent does the keystrokes.
:::

This is why people distinguish **"vibe coding"** (one-shot "just build it" with no plan, no tests — fine for prototypes) from **agentic engineering** (orchestrating the agent through a *research → plan → execute → review* loop, with you as oversight). This course teaches the second one. That's what holds up at production scale.

## The agentic loop

Under the hood, Claude Code runs a simple loop, over and over:

```text
   gather context  →  take an action  →  verify the result
        ▲                                        │
        └────────────────  repeat  ◀─────────────┘
```

It reads files and output to **gather context**, edits files or runs commands to **take an action**, then reads tests/build output to **verify** — looping until the goal is met. Almost everything you'll learn is about making each part of that loop better: feeding it the *right* context, giving it a *clear* plan, and giving it a way to *verify* its own work.

## The one constraint that explains everything

:::warning Context is the bottleneck
Claude's **context window** holds the entire conversation — every message, every file it reads, every command's output. It fills up fast, and **as it fills, performance degrades**: Claude starts "forgetting" earlier instructions and making more mistakes.

Nearly every best practice in this course exists to manage this one constraint. Keep that in mind and the rest will make sense.
:::

## What it's genuinely great at

- **Onboarding to a codebase** — "how does auth work here?", "where do I add an API endpoint?"
- **Implementing features** end-to-end from a description
- **Debugging** from a symptom or stack trace (and writing a failing test first)
- **Refactors & migrations** across many files
- **Tests** — writing them, running them, fixing until green
- **The toil** — changelogs, boilerplate, config, one-off scripts

## The mindset that makes it click

> Treat Claude Code like a **fast, capable engineer who just joined your team**: brilliant, tireless, and literal — but with **no memory of your project** beyond what you give it, and a tendency to look "done" before it's verified.

Your job is to give it context (next module), a plan (the workflow module), and a way to check its work (the verification lesson). Do that and you can hand off real work and walk away.

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What loop does Claude Code run, over and over?
A: Gather context → take an action → verify the result, then repeat until the goal is met.

Q: What one constraint explains nearly every best practice?
A: The **context window**. It fills up fast, and as it fills, performance degrades.

Q: What fills Claude's context window?
A: The entire conversation: every message, every file it reads, every command's output.

Q: Vibe coding vs agentic engineering — what is the difference?
A: Vibe coding is one-shot "just build it" with no plan and no tests. Agentic engineering runs research → plan → execute → review, with you as oversight.

Q: What mental model should you hold for Claude Code?
A: A fast, capable engineer who just joined your team: brilliant, tireless and literal, with no memory of your project beyond what you give it.

Q: What three things must you give Claude to hand off real work?
A: Context, a plan, and a way to check its work.
```

```quiz
Q: How is Claude Code fundamentally different from code autocomplete or a chat window?
- It's just a faster autocomplete
+ It's an agent: it reads files, runs commands, and makes changes autonomously in a gather→act→verify loop
- It only answers questions and never touches your files
- It requires you to paste code in manually every time
> Claude Code acts on your repo. You describe outcomes; it explores, plans, edits, and runs commands — then you review.

Q: Why do almost all Claude Code best practices come back to one thing?
+ The context window fills up fast, and performance degrades as it fills — so managing context is everything
- The model is slow
- Terminals are hard to use
- It can't read files
> Context is the fundamental constraint. Feeding the right context and keeping the window clean is the core skill.

Q: What's the difference between "vibe coding" and "agentic engineering"?
- They're the same thing
+ Vibe coding is one-shot "just build it"; agentic engineering runs a research → plan → execute → review loop with you as oversight
- Agentic engineering means writing all the code yourself
- Vibe coding uses tests and reviews
> Vibe coding is great for throwaways; agentic engineering is the disciplined loop that scales to real work.
```

:::try Next
You've got the model. Now let's get comfortable in the actual interface — the TUI, the modes, and the handful of keys that matter.
:::

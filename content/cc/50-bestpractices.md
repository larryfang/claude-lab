# Habits & Failure Patterns

You've learned the mechanics. This lesson is the *judgment* — the habits that separate people who get 10x from Claude Code from people who fight it, plus the five failure patterns to recognize early.

## What effective users actually do

The developers getting the most from Claude Code aren't typing the most prompts. They're **structuring the work**:

- **Small sessions, clear scope.** One task per session; `/clear` between them.
- **Externalize the plan.** For anything big, write `SPEC.md` / `PLAN.md` so it survives a context reset — then implement from it in a fresh session.
- **Use subagents aggressively** to keep the main context clean (research, review).
- **Always give a way to verify** (tests, build, screenshot) and demand evidence.
- **Commit often.** Small, verified commits make rewinds and reviews painless.
- **Course-correct early.** `Esc` the moment it drifts; after two failed corrections, `/clear` and rewrite the prompt.
- **Right-size the model, mode & effort.** `opusplan` for hard planning; `/effort xhigh` for gnarly problems, `low` for mechanical ones; plan mode for unfamiliar code; skip planning for one-line diffs.

(The official distillation of these habits lives at [code.claude.com/docs/en/best-practices](https://code.claude.com/docs/en/best-practices) — it superseded the older engineering-blog post you may have bookmarked.)

:::concept In the field: why one engineer 10x's and the org doesn't
Boris Cherny (Claude Code's creator) frames team adoption as a ladder: first give Claude **end-to-end verification** of its own work (tests, builds, browsers), then trust **auto mode** so nobody babysits approvals, then move recurring fixing and maintenance to **background agents** — and measure the return in merged background PRs, not usage dashboards ([@bcherny, 2026-07-17](https://x.com/bcherny/status/2077929379661844559)). Notice the order: verification comes *first*, autonomy second. That's this course's Module 3 before Module 6, and it's not a coincidence.
:::

:::concept The meta-skill
It all reduces to one thing: **manage context, and close the loop.** Feed Claude exactly what the task needs, give it a way to check its own work, and keep sessions tight. Master that and the tool feels telepathic.
:::

## The five failure patterns (and the fix)

Recognize these early — each has a one-move fix.

:::warning 1. The kitchen-sink session
You start on task A, ask about unrelated B, drift to C… now context is full of noise and quality drops.
**Fix:** `/clear` between unrelated tasks.
:::

:::warning 2. Correcting over and over
Claude gets it wrong, you correct, still wrong, correct again. The context is now polluted with failed attempts.
**Fix:** after **two** failed corrections, `/clear` and write a sharper prompt that bakes in what you learned.
:::

:::warning 3. The over-specified CLAUDE.md
It's so long Claude ignores half of it; important rules are buried.
**Fix:** prune ruthlessly. If Claude already does something right without the rule, delete it. Convert "must-happen" rules into **hooks**.
:::

:::warning 4. The trust-then-verify gap
Claude produces plausible-looking code that doesn't handle edge cases — and you shipped it.
**Fix:** always provide verification (tests/build/screenshot) and review the evidence. If you can't verify it, don't ship it.
:::

:::warning 5. The infinite exploration
You say "investigate this" with no scope; Claude reads hundreds of files and fills the context.
**Fix:** scope investigations narrowly, or hand them to a **subagent** so the exploration doesn't touch your main context.
:::

## Develop your own intuition

These patterns are starting points, not laws. Sometimes you *should* let context accumulate (you're deep in one rich problem). Sometimes you *should* skip planning (it's exploratory). Sometimes a vague prompt is exactly right (you want to see how Claude frames it).

> Pay attention to what works. When output is great, notice what you did — the prompt shape, the context, the mode. When Claude struggles, ask *why*: too-noisy context? too-vague prompt? too-big a task? Over time you'll build intuition no guide can capture.

## Make the call

Choose what you would do, read the consequence, then try the other options.

```scenario
S: It's late. Claude's change looks right at a quick glance, Claude says it's done, and you want to ship it.
Q: What do you do before you ship?
+ Ask Claude to run the tests or the build and show you the output, then review that evidence.
> You review proof, not a claim. Plausible-looking code that misses edge cases gets caught before it ships.
~ Read the diff closely yourself, then ship.
> Better than nothing, but now you are the only check, and edge cases hide well in plausible-looking code.
- Ship it. It looks right, and Claude said it's done.
> This is the trust-then-verify gap: plausible code that doesn't handle edge cases, shipped. If you can't verify it, don't ship it.

S: You are an hour into a big feature, the context is filling up, and the work will run across several more sessions.
Q: How do you carry the work forward?
+ Have Claude write the plan to `PLAN.md`, then implement from it in a fresh session.
> The plan survives the context reset, and the new session starts clean with a written plan to check against.
~ Keep this one session going, because you're deep in one rich problem.
> Sometimes that's right. But a plan that lives only in the context doesn't survive a reset, and the window keeps filling.
- Start a fresh session and re-explain the feature from memory.
> The decisions you worked out live only in the old context, so the new session starts without them.
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What does the meta-skill reduce to?
A: **Manage context, and close the loop.** Feed Claude exactly what the task needs, and give it a way to check its own work.

Q: Why externalize a big plan into `SPEC.md` / `PLAN.md`?
A: So it survives a context reset. Then implement from it in a fresh session.

Q: What is the fix for the kitchen-sink session?
A: `/clear` between unrelated tasks.

Q: What is the fix for the infinite exploration?
A: Scope investigations narrowly, or hand them to a **subagent** so the exploration doesn't touch your main context.

Q: What is the fix for the over-specified `CLAUDE.md`?
A: Prune ruthlessly: if Claude already does it right without the rule, delete it. Convert "must-happen" rules into hooks.

Q: On the team adoption ladder, what comes first?
A: End-to-end verification of Claude's own work. Autonomy — auto mode, then background agents — comes second.
```

```quiz
Q: Claude has been wrong twice on the same thing despite your corrections. The pro move is…
+ /clear and restart with a sharper prompt incorporating what you learned
- Correct it a few more times
- Switch to a bigger model and continue in the same session
- File a bug report
> Repeated corrections pollute context with dead ends. A clean session + better prompt beats a long, muddy one.

Q: Which habit most reliably separates power users from strugglers?
+ Structuring work: small scoped sessions, externalized plans, subagents, and verification
- Typing prompts as fast as possible
- Never using plan mode
- Keeping one giant session open all day
> It's about deliberate structure and context management, not volume of prompts.

Q: You ask Claude to "investigate the codebase" and it reads 200 files. Which failure pattern + fix?
+ Infinite exploration → scope it narrowly or delegate to a subagent
- Kitchen sink → restart your computer
- Trust-then-verify → add tests
- None; that's ideal
> Unscoped investigation floods context. Narrow the scope or quarantine it in a subagent that returns a summary.
```

:::try Next
One challenge stands between you and "Claude Code power user": the capstone. Let's take a project from clone to PR using everything you've learned.
:::

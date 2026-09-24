# Capstone: Clone → PR

The boss level. You'll take a project from **first clone** to an **opened PR**, using the whole stack: `/init`, plan mode, TDD, a custom command, a reviewer subagent, and verification. ~30 minutes. Finish this and you're a genuine Claude Code power user.

:::concept What you're proving
That you can drop into a repo and ship a verified change the professional way: **orient → set up memory → plan → build test-first → review in a fresh context → commit & PR.** This is the loop you'll run for real, forever.
:::

## Part 1 — Simulator: the full arc

```claude-sim
# A fresh clone of an open-source CLI tool. Let's add a feature, end to end.
$ git clone https://github.com/acme/tinydate && cd tinydate && claude
Claude Code — ready. Working directory: ~/code/tinydate
> /init
Analyzed: Python, pytest, Click CLI. Created CLAUDE.md (commands, conventions, gotchas).
> [plan mode] read the code and tell me how commands are added, and what's missing that users ask for.
[plan mode] Commands live in tinydate/commands/, registered in cli.py via Click.
Tests in tests/. README issues mention a frequently-requested `tinydate diff DATE1 DATE2`
(days between two dates) that doesn't exist yet.
> plan adding a `diff` command, test-first. list steps + edge cases.
Plan:
  1. tests/test_diff.py: same day → 0; later-earlier → positive; bad date → error exit 2
  2. tinydate/commands/diff.py: parse args, compute delta, print integer
  3. register in cli.py
  4. run pytest; update README usage
Approve? (Ctrl+G to edit)
> approve. write failing tests first, run them, then implement to green.
[normal] ✎ tests/test_diff.py
  $ pytest tests/test_diff.py -q   →  3 failed (diff not implemented)  ✓ red
✎ tinydate/commands/diff.py, ✎ cli.py
  $ pytest -q   →  41 passed  ✓ green (all existing tests still pass)
> use a subagent to review the diff for edge cases and CLI consistency
code-reviewer (fresh context): handles bad dates (exit 2 ✓). Suggestion: other commands
accept `--iso` for output format; `diff` should too for consistency. Otherwise solid.
> add the --iso flag with a test, re-run, then use /standup to summarize and open a PR
✎ added --iso (+test)  ·  $ pytest -q → 43 passed ✓
Running /standup → summary ready.
  $ gh pr create --fill
✓ Opened PR #88: feat(cli): add `diff` command (days between dates) with --iso
```

:::tip Count the techniques you just used
`/init` · **plan mode** · **test-first (red→green)** · **regression safety** (existing tests stay green) · **adversarial subagent review** · a **custom command** (`/standup`) · **verification with evidence** · **commit + PR**. That's the entire course in one flow.
:::

## Part 2 — Do it for real

Pick a small real repo (yours, or `git clone` a tiny open-source project) and a modest feature or fix.

:::lab Clone → PR, for real
**Orient & set up memory:**
```bash
git clone <repo-url> && cd <repo> && claude
```
```prompt
/init
```
- [ ] Cloned, started Claude, and generated a `CLAUDE.md`

**Explore in plan mode** (Shift+Tab → plan):
```prompt
Read the relevant code and explain how I'd add [your feature]. What files change and what are the edge cases? Write a plan with a test per step. Don't change anything yet.
```
- [ ] I have a reviewed plan (edited with Ctrl+G if needed)

**Build test-first** (switch out of plan mode):
```prompt
Write the failing tests first and run them so I see red. Then implement until green and show the passing output. Don't break existing tests.
```
- [ ] Red → green, existing tests still pass

**Adversarial review in a fresh context:**
```prompt
Use a subagent to review the diff against the plan — correctness, edge cases, and consistency with the rest of the codebase. Report gaps only.
```
- [ ] A fresh-context review ran; I addressed real issues

**Ship it:**
```prompt
Summarize the change, then commit with a conventional message and open a PR with `gh pr create`.
```
- [ ] A PR is open (or a clean commit, if you're not pushing)

**Success criteria — you can say yes to all of these:**
- [ ] I oriented before changing anything (plan mode)
- [ ] My change is covered by tests that went red then green
- [ ] A fresh-context review checked my work
- [ ] The result is committed with a clear message / PR
:::

:::concept You did it
You took a repo you may have never seen and shipped a verified change the professional way — context first, plan, test, review, ship. That's not "using an AI." That's **agentic engineering**. Most developers never build this muscle. You just did.
:::

## Reflect

```reflect
Which step of the clone → PR loop felt slowest on your repo, and what would you change — in `CLAUDE.md`, a command, or a subagent — to speed it up next time?
```

```reflect
Which habit from this course will you apply first in your team's main repo, and how will you know after a week that it stuck?
```

```quiz
Q: The capstone chained which techniques together?
+ /init → plan mode → test-first → fresh-context review → commit/PR
- Just one big "build it all" prompt
- Only headless mode
- Only CLAUDE.md
> Orient, set memory, plan, build test-first, review in a fresh context, ship. The whole loop in one flow.

Q: What single idea underpins the entire workflow you practiced?
+ Manage context and close the loop — feed the right context, then verify the result
- Type as fast as possible
- Never use plan mode
- Skip the tests to go faster
> Context management + verification is the through-line of everything in this course.
```

:::try Almost there
Mark this complete for your **🏆 Shipped It** badge (and **💯 Completionist** if you've finished everything — confetti incoming). Then keep the Reference lessons in a tab for daily use.
:::

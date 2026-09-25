# Capstone: Clone → PR

Take a small project from **first clone** to a **reviewable change**, using `/init`, planning, tests, and a fresh-context review. Allow about 30 minutes for a small, familiar change; setup and debugging can take longer. A local commit is a valid finish if you are practising without publishing.

:::concept What you're proving
That you can drop into a repo and ship a verified change the professional way: **orient → set up memory → plan → build test-first → review in a fresh context → commit & PR.** This is the loop you'll run for real, forever.
:::

## Part 1 — Simulator: the full arc

```claude-sim
# Fictional demonstration repo; use your own repo in Part 2. Start on a feature branch.
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
  1. Yes, and use auto mode   2. Yes, manually approve edits   3. No, keep planning
> yes, and use auto mode. write failing tests first, run them, then implement to green.
[auto mode] ✎ tests/test_diff.py
  $ pytest tests/test_diff.py -q   →  3 failed (diff not implemented)  ✓ red
✎ tinydate/commands/diff.py, ✎ cli.py
  $ pytest -q   →  41 passed  ✓ green (all existing tests still pass)
> use a subagent to review the diff for edge cases and CLI consistency
code-reviewer (fresh context): handles bad dates (exit 2 ✓). Suggestion: other commands
validate date formats; test that an impossible date such as 2026-02-30 is rejected.
> add the impossible-date regression test, fix any failure, re-run, then summarize, commit and open a PR
✎ added invalid-calendar-date test  ·  $ pytest -q → 42 passed ✓
Summary ready. Reviewed diff, committed feature, and pushed the feature branch.
  $ gh pr create --fill
✓ Opened PR #88: feat(cli): add `diff` command with date validation
```

:::tip Count the techniques you just used
`/init` · **plan mode** · **test-first (red→green)** · **regression safety** (existing tests stay green) · **fresh-context review** · **verification with evidence** · **commit + PR**. The simulator is scripted practice, not evidence that those commands ran against a real repository.
:::

## Part 2 — Do it for real

Pick a small real repo (yours, or `git clone` a tiny open-source project) and a modest feature or fix.

Use a repository you own, a fork, or a local practice copy. Before editing, create a feature branch, inspect the working tree, and preserve existing changes. If publishing a PR, confirm that your GitHub login and push remote point to the intended repository. Do not copy the fictional `acme/tinydate` URL from the simulator.

## Define success before implementation

Write the expected result and two acceptance cases: one normal input and one failure or boundary input. For the date example, specify the sign convention and how an impossible date should fail. This is the task's contract; do not let an implementation silently redefine it.

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
Review the diff against the acceptance cases. Summarize what changed, the checks actually run and their results, and anything unverified. Commit the reviewed change on my feature branch. If this is my publishing run, push that branch to the agreed remote and open a PR with `gh pr create`; otherwise stop at the local commit.
```
- [ ] A PR is open (or a clean commit, if you're not pushing)

**Success criteria — you can say yes to all of these:**
- [ ] I oriented before changing anything (plan mode)
- [ ] My change is covered by tests that went red then green
- [ ] A fresh-context review checked my work
- [ ] The result is committed with a clear message / PR
:::

## Evidence to keep with the change

Record the acceptance cases, the relevant failure before the fix, the passing result after it, and one review finding with its resolution. If the reviewer found none, record what was examined. For a UI change, include a completed user flow and a failed or empty state. Mark mocked integrations and unrun checks explicitly. A green suite with a skipped acceptance test does not meet the capstone.

:::concept You did it
You have practised context first, planning, tests, review, and a documented result. The badge records lesson completion; the evidence above shows what you actually verified. Reuse that evidence format in your next repository.
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

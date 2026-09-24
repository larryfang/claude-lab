# Lab: Ship a Feature (Plan + TDD)

Put it all together. You'll take a feature from **plan mode** through **tests** to a **commit** — the full Explore → Plan → Code → Commit loop with verification baked in.

## Part 1 — Simulator: a feature, end to end

The task: add input validation to a "create todo" endpoint so empty titles are rejected.

```claude-sim
# A small Express + Jest API is open. Start in plan mode (Shift+Tab → plan).
> [plan mode] read src/todos.js and __tests__ to see how POST /todos works and how it's tested. don't change anything.
[plan mode — read only]
  • POST /todos → src/todos.js:createTodo — pushes { id, title } to the in-memory store
  • No validation: an empty or missing title is accepted (bug)
  • Tests use supertest in __tests__/todos.test.js
Ready to plan.
> plan adding validation: reject missing/empty title with 400 and { error }. test-first, list the steps.
Plan:
  1. add __tests__/todos.validation.test.js: empty title → 400; missing → 400; valid → 201
  2. implement validation in createTodo (return 400 before writing to store)
  3. run the full suite; ensure existing tests still pass
Approve to implement (I'll switch out of plan mode).
> approve. write the failing tests first and run them.
[normal mode] ✎ created __tests__/todos.validation.test.js
  $ npm test -- validation
 FAIL  __tests__/todos.validation.test.js
   ✕ empty title → 400   (received 201)
Red, as expected. Implementing the fix now.
> go
✎ edited src/todos.js (+6)  — validate title, return 400 { error: "title required" }
  $ npm test
 PASS  __tests__/todos.test.js
 PASS  __tests__/todos.validation.test.js
Tests: 9 passed, 9 total ✓  (existing tests still green)
> use a subagent to review the diff for edge cases I might've missed, then commit
Subagent review (fresh context): trims whitespace? — currently "   " passes. Suggest
treating whitespace-only as empty. Otherwise solid; scope unchanged.
> good catch — handle whitespace-only as empty, re-run tests, then commit
✎ edited src/todos.js — trim() before the empty check
  $ npm test  →  10 passed ✓
  $ git commit -m "feat(todos): validate title on create (400 on empty)"
[main 7d3aa12] feat(todos): validate title on create (400 on empty)
```

:::tip Spot the full loop
**Explore** (plan mode, read-only) → **Plan** (test-per-step) → **Code** (red → green) → **verify** (suite stays green) → **adversarial review** (subagent caught the whitespace edge case) → **Commit**. That's the professional rhythm in one pass.
:::

## Part 2 — Do it on your own repo

Pick a small, real improvement in one of your projects (a validation, an edge case, a tiny endpoint).

:::lab Ship it for real
**Explore in plan mode:**
- [ ] In Claude, press **Shift+Tab** until you're in **plan mode**
- [ ] Ask Claude to read the relevant files and explain the current behavior — no changes

```prompt
Read the files involved in [the thing you're changing] and explain how it currently works. Don't change anything yet.
```

**Plan, test-first:**

```prompt
Plan [the change] test-first. List the steps, with a test for each. Include edge cases. I'll review before you implement.
```

- [ ] I reviewed the plan (used **Ctrl+G** to edit it, if needed)

**Code (red → green):** switch out of plan mode (Shift+Tab), then:

```prompt
Write the failing tests first and run them so I see red. Then implement until green and show the passing output. Don't break existing tests.
```

- [ ] I saw tests go red, then green, with real output

**Adversarial review, then commit:**

```prompt
Use a subagent to review the diff against the plan for edge cases and gaps. Then address only correctness issues and commit with a conventional message.
```

- [ ] A fresh-context review ran and I committed the result
:::

## Reflect

```reflect
Which step of the loop did you most want to skip on your own repo — plan mode, the red tests, or the fresh-context review — and what would skipping it have cost you?
```

```reflect
Which small change waiting in your backlog would you take through this loop next, and which test would prove it done?
```

```quiz
Q: In the lab, what caught the whitespace-only edge case?
+ An adversarial review subagent looking at the diff in a fresh context
- Luck
- The linter
- The commit message
> A reviewer in a fresh context (or /code-review) evaluates the result on its own terms and surfaces gaps the implementer missed.

Q: Why write the tests BEFORE the implementation?
+ They give Claude an unambiguous target and a self-check — red proves the test works, green proves the code does
- Tests are optional decoration
- To make the session longer
- Because plan mode requires it
> Test-first turns "looks done" into "provably done." Claude reads the pass/fail each loop and self-corrects.
```

:::try Module complete!
You ran the full professional loop. Mark it done for your **🔁 Workflow Pro** badge. Next module: make Claude Code *yours* with custom commands, subagents, and hooks.
:::

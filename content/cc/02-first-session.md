# Lab: Your First Session

Time to drive. First you'll run a guided session in the **in-browser terminal** below, then do the same in your own Claude Code. The whole point: feel the *ask → review → steer → verify* loop.

:::concept What you'll practice
1. **Ask** a codebase question (orientation)
2. **Make** a tiny, safe change
3. **Verify** it with a test or build
4. **Commit** it

That's the atomic unit of working with Claude Code. Everything scales up from here.
:::

## Part 1 — The simulator

Work through this guided session. Type each suggested command exactly and press **Enter**, or leave the field blank and choose **Run ▶**. This guided transcript checks each expected step before showing the canned response. Hit **↻ Reset** to replay.

```claude-sim
# A tiny Node project is open. You launched Claude Code in it.
$ cd todo-api && claude --permission-mode manual
Claude Code — ready in Manual mode. Working directory: ~/code/todo-api
Type a request, or /help. Tip: press Shift+Tab to switch modes.
> what does this project do and what's the test command?
I read package.json, README.md, and src/. Summary:
  • todo-api — a small Express REST API for todos (src/server.js, src/todos.js)
  • Storage is in-memory (src/store.js)
  • Test command: npm test  (uses Jest; tests in __tests__/)
The README mentions GET/POST /todos but there's no health check endpoint.
> add a GET /health endpoint that returns { status: "ok" }. write a test for it, then run the tests.
Plan:
  1. Add GET /health to src/server.js returning { status: "ok" }
  2. Add __tests__/health.test.js hitting the route with supertest
  3. Run npm test
Proceed? (I'll edit 2 files.)
> yes
✎ Edited src/server.js  (+4)
✎ Created __tests__/health.test.js  (+12)
  $ npm test
 PASS  __tests__/todos.test.js
 PASS  __tests__/health.test.js
Tests: 7 passed, 7 total ✓
The new endpoint works and all tests pass. Want me to commit?
> commit with a clear message
  $ git add src/server.js __tests__/health.test.js && git commit -m "feat: add GET /health endpoint with test"
[main 9c1f2a0] feat: add GET /health endpoint with test
 2 files changed, 16 insertions(+)
Done. Anything else?
```

:::tip Notice the loop
You **asked** (orientation), **described an outcome** (Claude proposed a plan and asked before editing), it **verified** with the test suite and showed the passing output as evidence, then **committed**. That evidence-first habit — showing the test output, not just claiming success — is what lets you trust unattended work.
:::

## Part 2 — Now do it for real

Use a small practice repository, or a new branch in an approved project. Check for existing work first, keep it intact, and commit only the files changed by this lab. Then run these in your **own terminal** — adapt each to your project.

:::lab Run your first real session
**Start Claude in your project:**

```bash
cd path/to/your-project
claude --permission-mode manual
```

- [ ] Claude Code started in my project

**Ask it to orient you** (type this at the prompt):

```prompt
Give me a 5-bullet overview of this project: what it does, the main entry point, how to run it, how to test it, and one thing that looks unfinished or risky.
```

- [ ] I got a useful overview of my own codebase

**Make a tiny, safe change** (adapt to your project):

```prompt
Add a single log line at startup that prints the app version from package.json. Show me the change before applying it.
```

- [ ] Claude proposed the change and I approved it

**Verify it** (use your real run/test command):

```prompt
Run the project (or the tests) and show me the output to prove it still works.
```

- [ ] I saw real output confirming it works

**Commit it:**

```prompt
Commit this change with a clear, conventional commit message.
```

- [ ] The change is committed
:::

:::warning If Claude asks permission
This lab explicitly starts in **Manual** mode. Actions requiring approval prompt; in-scope reads and already allowed actions can run without one. **Read the request, then approve.** Interactive terminal sessions now start in Auto by default on v2.1.283 or later when supported and not overridden. Check the active mode rather than inferring it from your plan. The Permissions lesson explains the controls.
:::

## Reflect

You just ran the core loop on your own code. Two habits to carry forward from this single lab:

1. **Ask before you assume.** Orientation questions are free and prevent wrong-problem solutions.
2. **Always close the loop with verification.** "Show me it works" beats "it works."

```reflect
Which part of Claude's overview of your own project surprised you, and what would you have assumed if you had not asked first?
```

```reflect
Which run or test command proves a change works in your project, and how will you make Claude show you its output every time?
```

```quiz
Q: In the session, why did Claude show the `npm test` output instead of just saying "done"?
+ Passing output gives you evidence to inspect alongside the diff and the test's coverage
- To use more tokens
- It's required by git
- To look impressive
> Ask for the real output, then check that the test covers the behavior you requested. Passing tests do not replace reviewing the change or checking important cases they omit.

Q: What's the atomic loop you practiced?
+ Ask (orient) → make a change → verify → commit
- Type code → hope → ship
- Clear → model → exit
- Plan → plan → plan
> Orientation, a small change, verification, and a commit. Every bigger workflow is built from this unit.
```

:::try Module complete!
That's Foundations. Choose **Complete and continue** — you already earned your **🐣 Booted Up** badge in the first lesson. Next module is the real skill ceiling: **context engineering** — feeding Claude exactly what it needs and nothing it doesn't.
:::

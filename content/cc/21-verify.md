# Give Claude a Way to Verify

Here's the difference between a session you have to babysit and one you can walk away from: **a check Claude can run itself.**

## Why this is the whole ballgame

A runnable check gives Claude concrete feedback: implement, run the check, inspect failures, and revise. You still decide whether the check covers the requirement and whether unresolved problems allow the change to ship.

:::concept A "check" is anything that returns a signal
- a **test suite** (the gold standard)
- a **build** exit code
- a **linter / type-checker**
- a script that **diffs output** against a fixture
- a **screenshot** compared to a design
:::

:::tip UI work: let Claude drive a real browser
For frontend changes, "screenshot and compare" isn't hypothetical — **Claude in Chrome** (`claude --chrome`, [docs](https://code.claude.com/docs/en/chrome)) lets Claude open your app, click through the flow, and read the console to verify its own change end-to-end. The desktop app goes further with a built-in browser pane ([@ClaudeDevs, 2026-07-10](https://x.com/ClaudeDevs/status/2075635283211772279)): select any element (⌘⇧S, [desktop docs](https://code.claude.com/docs/en/desktop)) and Claude can inspect its DOM before editing. The principle is the same as tests: the agent that can *see* the result can fix it.
:::

## Put the check in your prompt

The simplest version: ask for the work *and* the verification in one breath.

| ❌ Vague | ✅ With a verification loop |
|---|---|
| "implement a function that validates emails" | "write `validateEmail`. Test cases: `user@example.com` → true, `invalid` → false, `user@.com` → false. **Run the tests after implementing** and fix failures." |
| "make the dashboard look better" | "[paste screenshot] implement this design. **Take a screenshot of the result, compare to the original, list differences, and fix them.**" |
| "the build is failing" | "the build fails with [error]. Fix it and **verify the build succeeds. Address the root cause — don't suppress the error.**" |

## TDD pairs beautifully with agents

Tests give a repeatable pass/fail signal for the cases they cover. A useful recipe for a behaviour change:

```prompt
Let's do this test-first. Write failing tests for [behavior], including edge cases [list]. Don't write the implementation yet — show me the tests and run them so I can see them fail (red). Then implement until they pass (green), and show the passing output.
```

Red → green, with Claude reading the test output each loop. Confirm that red failed for the intended reason, not an unrelated setup error. Green proves those assertions passed; it does not prove the requirements or test cases are complete.

## Check the test as well as the code

Agree on expected behaviour before implementation. Afterward, inspect the diff for deleted assertions, skipped tests, broad mocks, or changed fixtures that merely make the result pass. Keep a regression case the implementation did not get to redefine. For a content-only change, a render or link check may be more useful than a new unit test.

```scenario
S: Claude fixes a validation bug. The suite is green, but the diff replaces a rejected-input test with test.skip.
Q: Is the change ready?
+ Restore the acceptance check, confirm it fails on the bug, fix the implementation, and rerun the relevant tests.
> The green result excluded the behaviour you needed to verify. Review the test diff as part of the fix.
~ Ask another AI reviewer whether the code looks reasonable.
> A review can help, but it does not restore the missing behavioural evidence.
- Ship it because the test command succeeded.
> A successful command can include skipped tests. Read what ran and what it actually proved.
```

## Review beyond a green suite

Anthropic's [AI Fluency for builders](https://academy.claude.com/courses/ai-fluency-for-builders/discernment-for-code) uses five review lenses. Apply them to your change:

| Lens | Evidence to collect |
|---|---|
| **Correctness** | Expected behaviour and a relevant failure case both pass |
| **Quality** | The diff is understandable and follows the project's conventions |
| **Fit** | It solves the requested user problem without unrelated work |
| **Experience** | Someone can finish the task and recover from an error |
| **Responsibility** | Access, data handling, and any release limitations are reviewed |

For UI changes, test a complete keyboard path, a narrow screen, and an empty or failed response. Check accessible names and visible focus as well as appearance. The [Academy's UX lesson](https://academy.claude.com/courses/ai-fluency-for-builders/discernment-for-user-experience) reinforces specifying accessibility and feedback explicitly.

## Gate harder when you walk away

The longer Claude runs unattended, the harder you want the stop gated:

| Gate | How |
|---|---|
| **Per-prompt** | "run the check and iterate in this same message" |
| **Across a session** | set a **`/goal`** — Claude keeps working toward the condition across turns until it's met ([commands](https://code.claude.com/docs/en/commands)) |
| **Deterministic** | a **Stop hook** runs your check as a script and blocks the turn from ending until it passes |
| **Second opinion** | a **verification subagent** or `/code-review` re-checks the diff in a fresh context |
| **Heavyweight** | `claude ultrareview` — a cloud-hosted **multi-agent** review of the whole branch or PR, from your shell or CI |

## Demand evidence, not assertions

:::warning "It works" is not evidence
Have Claude show the command, result, relevant test cases, and any skipped or unrun checks. A screenshot supports a visual claim; it does not prove an interaction works. A mocked test is not evidence that a live service succeeded. Match each claim in the handover to what was actually checked.
:::

## See TDD in the loop

```claude-sim
# Add a "slugify" helper, test-first.
> write failing tests for a slugify(str) util: "Hello World" → "hello-world", "  A & B  " → "a-b", "" → "". don't implement yet. run them so I see red.
✎ created __tests__/slugify.test.js (3 cases)
  $ npm test -- slugify
 FAIL  __tests__/slugify.test.js
   ✕ slugify("Hello World")  (slugify is not defined)
3 failing — as expected (red). Ready to implement?
> yes, implement until green, then show the passing output
✎ created src/slugify.js
  $ npm test -- slugify
 PASS  __tests__/slugify.test.js
   ✓ "Hello World" → "hello-world"
   ✓ "  A & B  " → "a-b"
   ✓ "" → ""
Green — 3/3 passing. Evidence above. Commit?
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: Why does Claude need a check it can run itself?
A: A runnable check provides feedback for correction. You still review whether its assertions cover the requirement and what remains untested.

Q: What counts as a "check"?
A: Anything that returns a signal: a test suite (the gold standard), a build exit code, a linter or type-checker, an output diff, a screenshot compared to a design.

Q: What is the test-first recipe?
A: Have Claude write failing tests and run them so you see red. Then it implements until green and shows the passing output.

Q: How do you keep Claude working toward a condition across turns?
A: Set a `/goal`. Claude keeps working toward the condition across turns until it's met.

Q: Which gate blocks the turn from ending until your check passes?
A: A **Stop hook**. It runs your check as a script, so the stop is deterministic.

Q: Claude says "Done, it works!" What do you insist on?
A: Evidence: the test output, the command it ran and what it returned, or the screenshot. If you can't verify it, don't ship it.
```

```quiz
Q: Why is "give Claude a way to verify" the difference between watching and walking away?
+ With a runnable check, Claude closes its own loop — does the work, runs the check, and iterates until it passes
- It makes Claude type faster
- It removes the need for prompts
- It disables permissions
> Without a check, "looks done" is the only signal and you become the QA. A pass/fail check lets the agent self-correct.

Q: Which prompt is most likely to produce correct code?
- "implement an email validator"
+ "write validateEmail with these test cases [...], run the tests, and fix failures"
- "make it good"
- "trust me, just ship it"
> Bundling explicit test cases + "run and fix" gives Claude an unambiguous target and a self-check.

Q: Claude says "Done, it works!" What should you insist on?
+ Evidence — the actual test output, command results, or a screenshot
- Nothing, take its word
- A longer explanation
- A new session
> Evidence beats assertion. Reviewing the proof is faster than re-verifying yourself and is essential for unattended runs.
```

:::try Next
You can plan and verify. Next: the same discipline for when something breaks — debugging with Claude Code, where the rule is *no fix without a failing test*. Then permissions.
:::

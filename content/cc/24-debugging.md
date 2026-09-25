# Debugging With Claude Code

Claude Code is a strong debugger for one reason: it can **run the code**. It can reproduce the failure, read the logs, try a change and run the tests again — the whole loop, without you copying anything between windows.

It also has one dangerous habit. Asked to "fix the error", it will happily make the error *go away*: a null check, a `try/except`, a skipped test. The symptom disappears and the bug moves somewhere quieter. This lesson is about getting the first behaviour and never the second.

:::concept The rule that changes everything
**No fix without a reproduction, and no reproduction without a failing test.** If Claude cannot make the bug happen on demand, it cannot prove it fixed it — and neither can you.
:::

## The debugging loop

```text
REPRODUCE → ISOLATE → HYPOTHESISE → PROVE → FIX → VERIFY → GUARD
 make it     smallest    one cause     a test    the     whole    keep the
 happen      failing     at a time     that      cause,  suite    test
             case                      fails     not the passes
                                                 test
```

### 1. Reproduce — and give it everything

Paste the **whole** error: the full stack trace, the command that produced it, and what you expected instead. Truncated errors produce guessed fixes. For long logs, pipe them in or point at the file with `@` instead of pasting a wall of text (see *Managing Context Live*).

```prompt
This command fails: `npm test -- orders`. Full output is in @logs/test-run.txt. Expected: all order tests pass. Reproduce the failure first and show me the failing output. Do not change any code until you can reproduce it.
```

### 2. Isolate

Ask for the **smallest** case that still fails: one input, one function, one request. A failure you can trigger with one line is a failure you can reason about.

### 3. Hypothesise — one at a time

```prompt
List three possible causes, ranked by likelihood, with the evidence for each. Then test only the most likely one. Keep a running list in `debug-notes.md` of each hypothesis and whether it was ruled in or out.
```

The notes file matters more than it looks. It survives a `/clear`, it stops Claude re-trying a ruled-out idea, and it is the explanation you will want for the PR.

### 4. Prove — the failing test

```prompt
Write a test that fails because of this bug and only this bug. Run it and show me it fails for the reason we expect. Do not fix anything yet.
```

A test that fails for the *right reason* is the proof that you found the cause. If it fails for a different reason, you have not found it yet.

### 5. Fix the cause, not the symptom

```prompt
Now fix the cause in the code. Do not change the test, do not add a try/except or a null check to hide the error, and do not skip or loosen any test. If the fix needs any of those, stop and explain why.
```

### 6. Verify and 7. Guard

Run the **whole** suite, not just the new test — fixes break neighbours. Then keep the test. It is now a regression guard, and it documents the bug better than any comment.

## When the bug is hard to find

| Situation | Move |
|---|---|
| The failure started recently, and you do not know which change caused it | Have Claude run `git bisect` with the failing test as the check, so git finds the first bad commit |
| The investigation needs to read many files | Hand it to a **subagent**, so only the findings come back into your context |
| Two fixes have failed | `/clear`, and start a new session with the error, `debug-notes.md` and what you ruled out |
| It only fails in CI | Get the exact CI command and environment into the prompt; reproduce locally before changing code |
| It is intermittent | Ask for a loop that runs the test many times, and log the conditions of each failure before theorising |

```prompt
The checkout test passed last week and fails now. Use git bisect between the tag v2.3.0 (good) and HEAD (bad), running `npm test -- checkout` at each step. Report the first bad commit and the lines in it most likely to cause the failure. Do not change any code.
```

## Watch the loop

```claude-sim
# A small API. Users report a 500 error when an order has no discount code.
> POST /orders returns 500 when discountCode is missing. Reproduce it and show me the failing output before you change anything.
Reproducing with a request without discountCode...
  POST /orders  {"items":[{"sku":"A1","qty":2}]}
  500 Internal Server Error
  TypeError: Cannot read properties of undefined (reading 'toUpperCase')
      at applyDiscount (src/pricing.js:14)
Reproduced. The crash is in applyDiscount, line 14.
> list likely causes, then write a failing test for the most likely one
Hypotheses (most likely first):
  1. applyDiscount assumes discountCode is always a string (line 14 calls toUpperCase)
  2. The request validator strips empty fields before pricing
  3. A recent refactor changed the default from "" to undefined
Test added: __tests__/pricing.test.js
  "prices an order with no discount code"
  FAIL  TypeError ... reading 'toUpperCase'
Fails for the expected reason.
> fix the cause. no try/catch, don't touch the test. then run the whole suite
Checked hypothesis 3: git log shows commit 4e1a9c changed the default from "" to undefined.
Fix: applyDiscount returns the price unchanged when there is no code.
  PASS  __tests__/pricing.test.js
  PASS  __tests__/orders.test.js
Tests: 31 passed, 31 total
Root cause: the default changed in 4e1a9c; applyDiscount assumed a string.
```

:::tip Notice what did not happen
Claude never wrapped the call in a `try/catch`, never changed the test, and never claimed a fix without output. It also found **why** the value was undefined — a changed default — instead of only handling it. That is the difference between a fix and a patch.
:::

## Put the loop in order

```order
# A teammate's bug report just landed. Put the debugging steps in order.
1. Reproduce the failure and capture the full output
2. Shrink it to the smallest case that still fails
3. List hypotheses and test the most likely one
4. Write a test that fails for that reason
5. Fix the cause without touching the test
6. Run the whole suite, then keep the new test
> Reproduce before you theorise, prove before you fix, and verify the whole suite before you trust it. Skipping step 4 is how symptom fixes get merged.
```

## Make the call

Choose what you would do, read the consequence, then try the other options.

```scenario
S: Claude says: "Fixed! I wrapped the parser call in a try/except, and the error no longer appears." The tests pass.
Q: What do you do?
+ Reject it. Ask why the parser fails, for a test that reproduces the real cause, and for a fix that makes the error impossible rather than invisible.
> The error still happens; now it is silent. The data it was protecting you from will reach somewhere worse — usually production, and usually at night.
~ Accept it for now and open a ticket to investigate properly.
> Sometimes right as an emergency stop-gap, if it is labelled as one. As a fix, it hides the evidence you need to find the cause.
- Accept it. The tests pass and the user-facing error is gone.
> Passing tests that never exercised the bug prove nothing. This is the trust-then-verify gap in its most common form.

S: Claude's second fix attempt has failed. The session is long and full of tried ideas.
Q: What next?
+ Ask for `debug-notes.md` to be up to date, then `/clear` and start a fresh session with the error, the notes and what was ruled out.
> After two failed corrections the context is polluted with dead ends. A fresh session plus written notes keeps the learning and drops the noise.
~ Switch to a higher effort level and try again in the same session.
> More thinking may help, but it thinks inside a context full of wrong turns. Clean context usually beats more effort.
- Keep correcting. The third attempt usually works.
> It usually does not — each failure adds more misleading context. This is the "correcting over and over" trap (see *Habits & Failure Patterns*).
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What must exist before Claude changes code to fix a bug?
A: A reproduction, then a test that fails for the expected reason.

Q: Name three ways a "fix" can hide a bug instead of fixing it.
A: A `try/except` or null check around the error, changing the test, or skipping or loosening a test.

Q: Why keep a `debug-notes.md` of hypotheses?
A: It survives `/clear`, stops ruled-out ideas coming back, and becomes the explanation for the PR.

Q: The bug appeared recently and you do not know which commit caused it. What do you use?
A: `git bisect`, with the failing test as the check at each step.

Q: Two fixes have failed. What now?
A: Update the notes, `/clear`, and restart with the error, the notes and what was ruled out.

Q: After the fix, what do you run — and what do you keep?
A: The whole suite, not just the new test. Keep the test as a regression guard.
```

```quiz
Q: Why ask Claude to reproduce a bug before changing any code?
+ Without a reproduction it cannot prove the fix worked — the error could vanish for an unrelated reason
- Reproducing is faster than fixing
- Claude Code cannot edit code until it runs it
- It uses fewer tokens
> A fix you cannot demonstrate against a failing case is a guess. Reproduction is the baseline every later check compares against.

Q: The new test fails, but with a different error from the one users reported. What does that mean?
+ You have not isolated the reported bug yet — find the cause of the reported error before fixing anything
- The fix is working
- The test is wrong, so delete it
- Both bugs are the same bug
> A test proves a cause only when it fails for the expected reason.

Q: Which prompt gets a cause fix rather than a symptom fix?
+ "Fix the cause. Do not change the test, add a try/except, or skip tests. If the fix needs any of those, stop and explain."
- "Make the error go away."
- "Fix it as fast as you can."
- "Handle all possible errors."
> Naming the forbidden shortcuts closes them. "Make the error go away" invites exactly the patch you do not want.
```

:::try Next
You can now make Claude prove its work — including when things break. Next: how much it may do without asking, and how to keep that safe.
:::

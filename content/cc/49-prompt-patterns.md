# Prompt Patterns That Work

Most bad Claude Code sessions start with a prompt that was clear to the person who wrote it. "Fix the login bug." "Add tests." "Clean this up." Each one hides five decisions Claude now has to guess.

This lesson is a pattern library: eight moves that turn a vague request into one Claude can finish and prove. You will not use all eight every time. You will use two or three on almost every prompt.

:::concept The test for any prompt
**Could a new teammate do this task from your message alone — and know when they were done?** If not, Claude cannot either. It will just be more confident about its guess.
:::

## The eight patterns

| # | Pattern | Vague | Specific |
|---|---|---|---|
| 1 | **Scope it** | "fix the login bug" | "users with a `+` in their email cannot log in; fix it in `src/auth/`" |
| 2 | **Point at the source** | "add a settings page" | "add a settings page that follows the pattern in @src/pages/Profile.tsx" |
| 3 | **Describe the symptom, not your guess** | "the cache is broken" | "the dashboard shows yesterday's totals until I hard-refresh" |
| 4 | **Define done** | "add tests" | "add tests for the three edge cases below; run them and show me they pass" |
| 5 | **Limit the blast radius** | "refactor this" | "refactor `billing.ts` only; do not change its exported functions" |
| 6 | **Say what not to do** | "make it faster" | "make it faster without adding a dependency or changing the API" |
| 7 | **Ask for the plan first** | "build OAuth" | "plan Google OAuth: files, flow, edge cases, and a test per step. Don't code yet" |
| 8 | **Demand evidence** | "does it work?" | "run the suite and paste the output; show me the screenshot" |

### 1 · Scope it

Name the place and the case. "The login bug" could be ten bugs; "users with a `+` in their email" is one. Scope also stops the infinite exploration failure — Claude does not read the whole repo looking for your bug.

### 2 · Point at the source

Your codebase already contains the answer to "how should this look?" Point at it with `@` and say *follow this pattern*. It is the cheapest way to get code that matches your conventions without writing them all into CLAUDE.md.

### 3 · Describe the symptom, not your guess

Your guess narrows the search to where you already looked. The symptom lets Claude find the cause — which may be somewhere you would not have searched. Include what you saw, what you expected, and how to trigger it.

### 4 · Define done

"Done" is the sentence most prompts leave out. It is also what lets Claude check itself: tests that pass, a command that exits 0, a page that renders. Without it, done means "Claude stopped".

### 5 · Limit the blast radius

Say which files may change and which may not. "Do not change the public API" and "only touch `src/billing/`" prevent the helpful refactor that breaks three other teams.

### 6 · Say what not to do

Name the shortcuts you do not want: new dependencies, skipped tests, disabled lint rules, a `try/except` around the error. Claude takes the path of least resistance unless you close it.

### 7 · Ask for the plan first

For anything multi-file or unfamiliar, get a plan in plan mode, edit it, then build. For big features, ask Claude to interview you first. A wrong approach caught in a plan costs one message.

### 8 · Demand evidence

Ask for output, not assurance: the test run, the command result, the screenshot. "It works" is a claim; the passing output is evidence.

## Before and after

```prompt
Make the export faster.
```

```prompt
The CSV export at /reports/export takes about 40 seconds for a 10,000-row report (see @logs/export-timing.txt). Find where the time goes before changing anything, and show me the measurement.

Then make it faster. Only change files in `src/reports/`. Do not add a dependency and do not change the CSV format — downstream scripts parse it.

Done means: the existing export tests pass, a new test covers a 10,000-row export, and you show me the before and after timing.
```

The second prompt uses patterns 1, 3, 4, 5, 6 and 8. It is longer — and it will finish in fewer messages.

## Spot the vague parts

```spot
# This prompt went to Claude Code as written. Select every sentence that forces Claude to guess, then check.
We need to improve the signup flow. [[Make it better and more modern.|No definition of better. Better conversion? Fewer fields? Faster load? Claude will pick one and you will disagree.]] The form lives in `src/signup/SignupForm.tsx`. [[Fix the validation issues.|Which issues? Describe the symptom: which input, what happens, what should happen.]] [[Clean up the code while you are in there.|Unlimited scope. This invites a refactor of files you did not mean to change — limit the blast radius or cut it.]] Keep the existing field names, because analytics depends on them. [[Let me know when it's done.|No done criterion and no evidence. Ask for the tests to pass and the output to be shown.]]
```

## Make the call

Choose what you would do, read the consequence, then try the other options.

```scenario
S: You want Claude to add rate limiting to the public API. You have a rough idea but have not decided on limits or storage.
Q: Which first prompt?
+ "I want rate limiting on the public API. Interview me about limits, storage, headers and edge cases, then write the spec to SPEC.md. Don't write code yet."
> The decisions are not made yet, so let Claude help you make them. The spec survives a /clear and becomes the definition of done for a fresh build session.
~ "Add rate limiting to the public API using Redis, 100 requests per minute per key."
> Specific, which is good — but you have made decisions you had not actually thought through, and there is no done criterion or evidence.
- "Add rate limiting."
> Claude will choose the limits, the storage and the behaviour. You will review a finished design you never agreed to.
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What is the test for any prompt?
A: Could a new teammate do the task from your message alone, and know when they were done?

Q: Why describe the symptom instead of your guess?
A: A guess narrows the search to where you already looked; the symptom lets Claude find the real cause.

Q: What is the cheapest way to get code that matches your conventions?
A: Point at an existing file with `@` and say "follow this pattern".

Q: What does "define done" give Claude?
A: A way to check its own work: tests that pass, a command that exits 0, output it can show you.

Q: Name two blast-radius limits.
A: "Only change files in `src/billing/`" and "do not change the public API" (or its exported functions).

Q: Which three patterns turn a vague request into a provable one?
A: Define done, say what not to do, and demand evidence.
```

```quiz
Q: "The cache is broken — fix it." Which pattern would improve this prompt most?
+ Describe the symptom: what you saw, what you expected, and how to trigger it
- Ask for the plan first
- Point at the source
- Make it shorter
> "The cache is broken" is a guess. The symptom might point to the cache, or to something else entirely.

Q: Why write "do not add a dependency" in a performance prompt?
+ Claude takes the shortest path unless you close it, and a new dependency is often the shortest path to "faster"
- Dependencies are always bad
- Claude cannot install packages
- It makes the prompt longer, which improves results
> Pattern 6: name the shortcuts you do not want. Constraints are part of the task.

Q: A prompt ends with "let me know when it's done". What is missing?
+ A done criterion Claude can check, and a request for evidence
- A polite closing
- The file path
- A plan
> "Tell me when it's done" means "tell me when you stop". Say what done looks like, and ask to see it.
```

:::try Next
Patterns make single prompts better. The next lesson is about the habits that make whole sessions better — and the five ways they go wrong.
:::

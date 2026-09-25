# Explore → Plan → Code → Commit

This is the canonical workflow from Anthropic's own [best-practices guide](https://code.claude.com/docs/en/best-practices), and the single biggest upgrade to your results. The headline: **don't let Claude jump straight to code.** Separate *figuring out what to do* from *doing it*.

## The four phases

```text
  EXPLORE  →  PLAN  →  CODE  →  COMMIT
 (read-only)  (write    (switch    (descriptive
  understand   a plan)   out &      commit + PR)
  the code)              build)
```

### 1. Explore (in plan mode)
Enter **plan mode** (Shift+Tab) so Claude can read, search and reason but **not edit your code**. Have it understand the relevant code first:

```prompt
Read src/auth and explain how we handle sessions and login. Also check how we manage env vars for secrets. Don't write code yet.
```

### 2. Plan
Ask for a concrete implementation plan:

```prompt
I want to add Google OAuth. What files change, what's the session flow, and what are the edge cases? Write a step-by-step plan with a test for each step.
```

Press **`Ctrl+G`** to open the plan in your editor and tweak it before Claude proceeds. A plan you can read and edit is a plan you can trust.

### 3. Code
Switch **out** of plan mode (approve the plan, or press Shift+Tab) and let Claude implement — **verifying against the plan**:

```prompt
Implement the OAuth flow from your plan. Write tests for the callback handler, run the suite, and fix any failures.
```

### 4. Commit
```prompt
Commit with a descriptive message and open a PR.
```

### Check your model of the loop

```order
# A teammate asks Claude Code for a new OAuth login. Put their session in the right order.
1. Enter plan mode and have Claude read `src/auth` and explain the session flow
2. Ask for a step-by-step plan that names the files and a test for each step
3. Open the plan with Ctrl+G and edit the edge cases it missed
4. Leave plan mode and have Claude implement against the plan
5. Run the test suite and fix failures until it passes
6. Commit with a descriptive message and open a PR
> Understand before you plan, plan before you code, verify before you commit. Each step makes the next one cheaper to get right, and a test failure found in step 5 costs far less than one found in review.
```

## Plan mode, deeper

:::concept Why plan mode is the biggest unlock
Plan mode is **enforced, not advisory** — Claude Code blocks file edits until you approve a plan. Claude can still read, search, and run exploratory commands (read-only ones freely; others through the auto-mode classifier or a prompt). So you get fearless exploration of unfamiliar code and a reviewable plan *before* a single line changes.
:::

Two dials pair naturally with planning:

- **`/model opusplan`** uses **Opus to plan** (better reasoning) and **Sonnet to execute** (fast, efficient) — the best of both without manual switching ([model config](https://code.claude.com/docs/en/model-config)).
- **`/effort`** sets reasoning depth (`low` → `medium` → `high` → `xhigh` → `max`) — crank it up for a gnarly architectural plan, drop it for mechanical work. Phrases like "think hard" are now just ordinary text; for one deep turn, `ultrathink` in your prompt still works.

## When to skip the plan

Planning has overhead. **Skip it** when the scope is obvious and the fix is small — a typo, a log line, a rename. The test: *if you could describe the diff in one sentence, just ask Claude to do it.* Plan when you're **uncertain**, the change spans **multiple files**, or you're in **unfamiliar** code.

## For big features: let Claude interview you

For anything large, get the requirements straight first:

```prompt
I want to build [brief description]. Interview me in detail using the AskUserQuestion tool — technical approach, UI/UX, edge cases, and tradeoffs. Dig into the hard parts I haven't considered. When we're done, write a complete spec to SPEC.md.
```

Then start a **fresh session** to implement from `SPEC.md` — clean context, focused entirely on building, with a written spec to check against.

## Watch it flow

```claude-sim
# You need to add OAuth. Start in plan mode (Shift+Tab → "plan").
> [plan mode] read src/auth and summarize how login + sessions work. don't change anything.
[plan mode — no edits]
  • Login: src/auth/login.ts issues a JWT, stored in an httpOnly cookie
  • Sessions: middleware/session.ts verifies the JWT on each request
  • Secrets: loaded from env via config/env.ts (JWT_SECRET)
No OAuth provider wired up yet. Ready to plan when you are.
> plan adding Google OAuth. list files to change, the flow, edge cases, and a test per step.
Plan:
  1. add googleStrategy in src/auth/oauth.ts        (test: redirect URL is built correctly)
  2. add GET /auth/google + /auth/google/callback   (test: callback exchanges code → user)
  3. reuse JWT issuance from login.ts                (test: session works post-OAuth)
  4. handle edge cases: denied consent, email already exists, expired state
Press Ctrl+G to edit this plan. Approve?
  1. Yes, and use auto mode   2. Yes, manually approve edits   3. No, keep planning
> yes, and use auto mode — implement step 1 with its test, then run it
[auto mode] ✎ created src/auth/oauth.ts, __tests__/oauth.redirect.test.js
  $ npm test -- oauth.redirect
 PASS  __tests__/oauth.redirect.test.js ✓
Step 1 done and verified. Continue with step 2?
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What are the four phases of the canonical workflow?
A: Explore → Plan → Code → Commit. Separate *figuring out what to do* from *doing it*.

Q: What does plan mode prevent?
A: Editing files, until you approve a plan. Claude can still read, search, and run exploratory commands; ones that aren't read-only go to the classifier or a prompt.

Q: How do you edit Claude's plan before it proceeds?
A: Press `Ctrl+G` to open the plan in your editor.

Q: When do you skip the plan?
A: When you could describe the diff in one sentence — a typo, a log line, a rename. Plan when uncertain, multi-file, or in unfamiliar code.

Q: What does `/model opusplan` do?
A: It uses **Opus to plan** and **Sonnet to execute**, without manual switching.

Q: How do you start a large, fuzzy feature?
A: Have Claude interview you and write `SPEC.md`, then implement from it in a fresh session.
```

```quiz
Q: What's the main reason to explore and plan before coding?
+ Jumping straight to code often solves the wrong problem; planning separates understanding from doing
- It uses more tokens, which is good
- Plan mode is required for all edits
- It's just ceremony
> Explore→Plan→Code→Commit prevents wrong-problem solutions and gives you a reviewable plan before anything changes.

Q: When should you SKIP planning?
+ When the scope is clear and the fix is tiny — if you could describe the diff in one sentence
- Never skip it
- Always skip it
- Only on Fridays
> Planning has overhead. Small, obvious changes (typo, log line, rename) don't need it. Plan for uncertainty/multi-file/unfamiliar code.

Q: What does plan mode guarantee?
+ Claude Code blocks file edits until you approve a plan; Claude can still read, search, and run exploratory commands
- Claude works faster
- Claude writes tests automatically
- Nothing; it's advisory
> Plan mode is enforced, not a suggestion — edits stay blocked until you approve, making it the safe way to explore unfamiliar code and produce a reviewable plan.

Q: For a large, fuzzy feature, a great first step is to…
+ Have Claude interview you, then write a SPEC.md, then implement from it in a fresh session
- Tell it "just build the whole thing" and walk away
- Skip straight to a PR
- Write all the code yourself first
> Interview → SPEC.md → fresh implementation session gives precise requirements and clean context.
```

:::try Next
A plan gets Claude building the right thing. Next: how to make sure it built it *correctly* — by giving Claude a way to verify its own work.
:::

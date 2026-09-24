# Lab: Write a Great CLAUDE.md

A strong `CLAUDE.md` pays off every single session. In this lab you'll generate one with `/init`, then do the part most people skip: **prune and tune it** until Claude's behavior actually changes.

## Part 1 — Simulator: init → prune → tune

Work through this guided flow, then do it for real on your own repo.

```claude-sim
# A real project is open. Let's build its memory file.
> /init
Analyzing the project… detected: TypeScript, pnpm, Vitest, Express, Prisma.
Created CLAUDE.md (1 file, 86 lines) with: project overview, commands,
detected conventions, and a file map of src/.
Open it to review — I tend to over-include on the first pass.
> that's too long. cut anything I could figure out by reading the code, and drop the per-file map. keep commands, real conventions, and gotchas.
Revised CLAUDE.md → 31 lines. Removed: the src/ file map, generic "use TypeScript"
advice, and restated language defaults. Kept: pnpm commands, the Vitest single-file
tip, the Prisma migrate gotcha, and required env vars.
> add a rule: never edit files under src/generated, and always run `pnpm typecheck` after a batch of edits. mark them important.
Updated CLAUDE.md. Added under ## Workflow:
  - IMPORTANT: never edit src/generated/** (built by `pnpm codegen`)
  - IMPORTANT: run `pnpm typecheck` after a series of edits
> now make a trivial change to a generated file to prove the rule holds
I won't — src/generated/** is off-limits per CLAUDE.md. If you need that output
changed, edit the source schema and run `pnpm codegen`. Want me to do that instead?
```

:::tip What just happened
You watched the full lifecycle: **generate → prune hard → add sharp rules → verify the behavior changed.** That last step — Claude *refusing* to touch `src/generated` — is how you know a rule landed. If behavior doesn't change, the rule is buried or ambiguous.
:::

## Part 1b — Lint a bloated CLAUDE.md

A teammate's CLAUDE.md is below. It has every common problem. Choose **Check it**, fix the file in the box until the checker is happy, and notice which cuts felt risky. (They almost never are.)

```claudemd-check
# Project Guidelines

IMPORTANT: You MUST ALWAYS follow these rules. NEVER ignore them. This is CRITICAL.

## Rules
- Write clean code
- Follow best practices
- Be careful with the database
- Make sure it works before you finish

## Structure
├── src
│   ├── api
│   └── models
├── tests
└── docs

## Environments
The staging environment is on the shared cluster and it is used by the QA team and by the mobile team for their nightly builds, so try not to break it, and remember that deploys happen through the pipeline rather than by hand unless there is an emergency.
- Staging DB password: hunter2-staging
```

:::tip What a fixed version keeps
Exact commands (`npm test`, `npm run lint`), the two or three gotchas Claude would get wrong, and nothing Claude could discover by reading the repo. Put the password in an environment variable — then rotate it, because a real one in a committed file is already leaked.
:::

## Part 2 — Do it on your own repo

:::lab Build & tune your CLAUDE.md
**Generate the draft:**

```bash
cd path/to/your-project
claude
```
Then at the prompt:

```prompt
/init
```

- [ ] `/init` created a starter `CLAUDE.md`

**Prune it ruthlessly** (paste this):

```prompt
Review CLAUDE.md and cut it down. Remove anything you could infer by reading the code, any restated language defaults, and any per-file descriptions. Keep only: non-obvious commands, conventions that differ from defaults, repo etiquette, and real gotchas. Show me the before/after line counts.
```

- [ ] My `CLAUDE.md` is meaningfully shorter (aim < ~200 lines)

**Add 2–3 sharp, project-specific rules** (adapt):

```prompt
Add these rules with IMPORTANT emphasis: (1) the exact test command and that you prefer single-file test runs, (2) one directory you must never edit, (3) one gotcha that's bitten us. Then show me the final file.
```

- [ ] My rules are specific and emphasized

**Test that a rule actually changed behavior:**

```prompt
Without making changes yet, tell me: based on CLAUDE.md, what will you do differently in this project compared to a generic one? Name the specific rules you'll follow.
```

- [ ] Claude echoed back my real rules (proof they're loaded and clear)

**Commit it so your team benefits:**

```prompt
Commit CLAUDE.md with a clear message.
```

- [ ] `CLAUDE.md` is committed
:::

:::warning Keep tending it
`CLAUDE.md` is living. When Claude does something annoying, add a rule. When a rule stops being needed, delete it. When Claude ignores a rule, the file's probably too long — prune. Review it like code.
:::

```quiz
Q: How do you know a CLAUDE.md rule actually "landed"?
+ Claude's behavior visibly changes (e.g., it refuses to edit a forbidden directory)
- The file got longer
- You feel good about it
- It's impossible to know
> Test by observation. If behavior doesn't shift, the rule is buried (file too long) or ambiguous (reword it).

Q: After /init generates a CLAUDE.md, the most important next step is to…
+ Prune it — cut anything Claude could infer from the code
- Add 200 more lines
- Leave it exactly as generated
- Delete it
> /init over-includes by design. The value is in pruning to the essentials and tuning over time.
```

:::try Module complete!
You've mastered the core skill — context. Mark it done for your **📍 Context Engineer** badge. Next: the workflow that turns context into shipped code — Explore → Plan → Code → Commit.
:::

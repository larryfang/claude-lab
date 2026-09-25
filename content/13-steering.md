# Plans, Steering & When to Stop

A Cowork run benefits from clear checkpoints. Claude may ask follow-up questions, but you should specify which decisions require your input and inspect the work as it develops.

This lesson is about the twenty minutes in the middle.

## Reading a plan properly

When Cowork shows you its steps, you are looking for four things — in this order, because they cost different amounts to fix later.

:::concept The four-point plan review
1. **Wrong source.** Is it about to read something it should not — an archive folder, a different product's data, a connector you did not intend? *Cost of missing it: the whole run is invalid.*
2. **Wrong write.** Is any step writing outside the folder you nominated, or modifying a source file? *Cost of missing it: real damage.*
3. **Missing step.** You asked for a cross-reference, a flag list, a consistency check. Is it in the plan? Silent omission is the most common failure. *Cost of missing it: a deliverable that looks complete and is not.*
4. **Wrong shape.** Does the plan produce the artefacts you named, in the formats you named? *Cost of missing it: one re-run.*
:::

Then say so, specifically:

```prompt
Two changes before you start. Step 3 is reading `archive/` — skip that folder entirely, it is a different product. And you have dropped the requirement to flag rows you exclude from totals; add that as an explicit step and write those rows into the Issues tab. Otherwise the plan looks right — go ahead.
```

## Steering a run in flight

You do not have to wait for the end. Three interventions, in increasing order of cost:

**Nudge** — it is doing the right thing slightly wrong.

> "Keep going, but from here on attribute every quote to the customer name as well as the file."

**Redirect** — the approach is wrong, the goal is right.

> "Stop what you are doing on the per-channel breakdown. The channel names are inconsistent in the source — normalise them first, then redo the aggregation."

**Stop and re-brief** — the brief was wrong.

> Pause the work. If the goal or permitted sources changed, save any verified output and write a corrected brief. Restart the affected work; a new task can help when conflicting instructions or accumulated context are getting in the way.

:::tip Judge progress, not elapsed time
Continue when each correction improves the result against a clear check. Pause when the same error recurs, fixes break previously correct work, or the goal is unclear. Diagnose whether the cause is the brief, data, tool access, or context before choosing a restart. A minute is a useful moment to reassess, not a deadline.

This follows Anthropic's [Description–Discernment loop](https://academy.claude.com/courses/ai-fluency-framework-foundations/the-description-discernment-loop): inspect what came back, give specific feedback, and repeat while the work improves.
:::

## The four ways a run goes wrong

Learn to name these and you will diagnose problems in seconds rather than sessions.

### 1. The Confident Gap
It needed a number that was not there and produced a plausible one anyway. Totals that do not reconcile, a "typical industry benchmark", a date that was inferred.

**Prevention:** *"Never estimate a missing value — write 'not recorded'."*
**Detection:** trace decision-critical numbers to source, then sample additional numbers. Three is a useful practice sample, not proof that the rest are correct.

### 2. The Silent Exclusion
Four rows had blank fields, so it dropped them. The total is now wrong and nothing says so.

**Prevention:** *"Flag every row you excluded from any calculation, and why."*
**Detection:** can every input record be accounted for as included, excluded with a reason, or merged into a documented group? Aggregated reports legitimately have fewer rows.

### 3. The Drift
Long run, many files. By file thirty it is applying subtly different criteria than at file three, or scoring inconsistently across parallel subagents.

**Prevention:** *"After processing all items, review them together and make the criteria and scoring consistent."*
**Detection:** compare the first and last items it produced. They should feel like the same author.

### 4. The Eager Rewrite
You asked it to organise a folder. It also renamed your files, "improved" a document, and overwrote a version you needed. (Picking a folder authorises Claude to read and write in it, so edits, moves, renames and overwrites there are part of the access you already gave — do not count on a prompt to stop them. Only permanent *deletion* always asks first, in any mode — which is one more reason to read prompts before clicking Allow.)

**Prevention:** *"Write only to `output/`. Do not modify, rename, or delete anything in the source folders."* Plus: work on copies.
**Detection:** an overwrite or rename is very hard to detect after the fact. Prevent it.

:::warning Protect the source before you run
An overwrite may be recoverable from a backup or version history, but recovery is not guaranteed. Copies, narrow scope, and explicit write boundaries reduce the risk. Incorrect analysis can also cause lasting harm once someone acts on it, so review before sharing.
:::

## When to let it run and when to watch

**Let it run** — read-only analysis, writing to a scratch folder, work you will review carefully anyway, a job you have run successfully several times before.

**Watch it** — the first run of any new brief, anything touching a real system through a connector, anything that writes outside `output/`, anything on a deadline where a failed run costs you the deadline.

## Make the call

Three moments from real runs. Choose what you would do, read the consequence, then try the other options to see why they lose.

```scenario
S: You read Cowork's plan for a deal-review pack. Step 2 reads `archive/2025-pipeline.csv` as well as this quarter's export. Steps 3–5 look right.
Q: What do you do?
+ Tell it to skip `archive/` entirely, say why, and approve the rest of the plan.
> Wrong source is the most expensive miss on the four-point review: it invalidates the whole run. One specific sentence fixes it before any work happens.
~ Approve it, and plan to check the numbers carefully at the end.
> You might catch it. But now you must trace every number to find which ones blended old data. Fixing a plan costs seconds; fixing a finished pack costs a re-run.
- Approve it. More data usually makes a better analysis.
> Last year's rows blend silently into this quarter's totals, and nothing in the narrative will tell you. This is how a Confident Gap is born.

S: Ten minutes into a long run you notice the per-channel totals treat "LinkedIn", "linkedin" and "LI" as three separate channels.
Q: The goal is right; the approach is wrong. Which intervention?
+ Redirect: stop the aggregation, normalise the channel names first, then redo it.
> A redirect keeps the goal and fixes the method. It is cheaper than a restart and much cheaper than hand-fixing a table later.
~ Nudge: "keep going, but be careful with channel names".
> "Be careful" is a wish, not an instruction. Name the exact fix (normalise, then re-aggregate) or the error continues.
- Let it finish, then merge the three rows by hand in the spreadsheet.
> The narrative, charts and rankings were all built on the split totals. Fixing one table by hand leaves every other artefact wrong.

S: You have steered the same run four times in three minutes. Each fix creates a new small problem.
Q: What now?
+ Pause, diagnose why the corrections conflict, and restart affected work if the brief or accumulated context is the cause.
> Each fix is breaking something else, so this run is no longer converging. Save verified work, diagnose the cause, and restart with a corrected brief if the goal or instructions were the problem.
~ Steer once more with a longer, more detailed correction.
> Sometimes it works. Usually you get a patchwork document whose reasoning you cannot reconstruct.
- Keep steering. You have already put three minutes into it.
> Sunk cost. Every extra steer adds another layer of patched reasoning to a document you will have to defend.
```

## Practise the interventions

Next time you run a lab in this course:

- [ ] Read the plan against the four checks; approve it if it meets them, or name a specific correction
- [ ] Interrupt a run once, deliberately, just to feel the control
- [ ] After it finishes, trace three numbers back to their source
- [ ] Account for input records, exclusions, and any grouping that changes the output row count

```quiz
Q: Repeated corrections are creating new errors, and you discover the brief names the wrong source. What should you do?
- Keep steering; you are nearly there
+ Pause, correct the source in the brief, and redo the affected work
- Switch models
- Split it into smaller tasks
> The wrong source is the cause. Correct it and recheck affected outputs. Elapsed time alone does not tell you whether to restart.

Q: Four records with blank amounts disappeared from a report without an exclusion note. Which failure mode is this?
- The Eager Rewrite
+ The Silent Exclusion — rows with missing values were dropped from the calculation without being reported
- The Drift
- A connector failure
> Reconcile included and excluded record IDs against the input. If the report groups records, inspect the group counts too.

Q: Which failure mode directly risks destroying the original source files?
- The Confident Gap
- The Silent Exclusion
+ The Eager Rewrite — it has already modified or deleted your source files
- The Drift
> Overwrites and deletion can destroy source data. Backups may allow recovery; protect the originals before running the task.

Q: When reviewing a plan, which problem is most expensive to miss?
- A step in a slightly odd order
+ A step reading a source it should not, which invalidates the entire run
- A file named differently from what you asked
- A missing length limit
> Wrong source first, wrong write second, missing step third, wrong shape last — that is the order of cost.
```

:::try Next
Time to feel all of this. The lab runs a deliberately lazy brief, then the same job done properly.
:::

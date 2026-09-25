# Plans, Steering & When to Stop

A Cowork run is not a vending machine. It is closer to briefing a capable new hire who will not ask you a follow-up question unless you told them they could.

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

> Hit stop. Do not try to patch it. Rewrite the brief with the missing B.R.I.E.F. element and start again. A run steered five times produces a worse document than a run briefed once properly, and you will not be able to reconstruct why it said what it said.

:::tip The 60-second rule
If you have been steering for more than a minute, you are debugging your brief, not the run. Stop, fix the brief, restart. This feels wasteful and is always faster.
:::

## The four ways a run goes wrong

Learn to name these and you will diagnose problems in seconds rather than sessions.

### 1. The Confident Gap
It needed a number that was not there and produced a plausible one anyway. Totals that do not reconcile, a "typical industry benchmark", a date that was inferred.

**Prevention:** *"Never estimate a missing value — write 'not recorded'."*
**Detection:** trace three numbers from the deliverable back to a source row. Always three, always at random.

### 2. The Silent Exclusion
Four rows had blank fields, so it dropped them. The total is now wrong and nothing says so.

**Prevention:** *"Flag every row you excluded from any calculation, and why."*
**Detection:** does the row count in the output match the row count in the input?

### 3. The Drift
Long run, many files. By file thirty it is applying subtly different criteria than at file three, or scoring inconsistently across parallel subagents.

**Prevention:** *"After processing all items, review them together and make the criteria and scoring consistent."*
**Detection:** compare the first and last items it produced. They should feel like the same author.

### 4. The Eager Rewrite
You asked it to organise a folder. It also renamed your files, "improved" a document, and overwrote a version you needed. (Picking a folder authorises Claude to read and write in it, so edits, moves, renames and overwrites there are part of the access you already gave — do not count on a prompt to stop them. Only permanent *deletion* always asks first, in any mode — which is one more reason to read prompts before clicking Allow.)

**Prevention:** *"Write only to `output/`. Do not modify, rename, or delete anything in the source folders."* Plus: work on copies.
**Detection:** an overwrite or rename is very hard to detect after the fact. Prevent it.

:::warning The Eager Rewrite is the only one that is not recoverable
The other three cost you a re-run. This one costs you data. Copies, narrow scope, explicit write boundaries — every time, even when you are in a hurry. Especially when you are in a hurry.
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
+ Stop the run, find the missing B.R.I.E.F. element, rewrite the brief, and start again.
> The 60-second rule. Past a minute of steering, you are debugging your brief. A run briefed once beats a run steered five times, and you can explain its output.
~ Steer once more with a longer, more detailed correction.
> Sometimes it works. Usually you get a patchwork document whose reasoning you cannot reconstruct.
- Keep steering. You have already put three minutes into it.
> Sunk cost. Every extra steer adds another layer of patched reasoning to a document you will have to defend.
```

## Practise the interventions

Next time you run a lab in this course:

- [ ] Read the plan and find at least one thing to change — even a small one
- [ ] Interrupt a run once, deliberately, just to feel the control
- [ ] After it finishes, trace three numbers back to their source
- [ ] Check the output row count against the input row count

```quiz
Q: You have been correcting a run for three minutes and it is still not on track. What should you do?
- Keep steering; you are nearly there
+ Stop, fix the brief, restart — you are debugging the brief, not the run
- Switch models
- Split it into smaller tasks
> Beyond about a minute of steering, restarting from a corrected brief is both faster and produces a better artefact.

Q: A report's totals do not reconcile with the source data, and nothing in the report mentions why. Which failure mode is this most likely to be?
- The Eager Rewrite
+ The Silent Exclusion — rows with missing values were dropped from the calculation without being reported
- The Drift
- A connector failure
> Check row counts in against row counts out. It is the fastest test there is.

Q: Which failure mode cannot be fixed after the fact?
- The Confident Gap
- The Silent Exclusion
+ The Eager Rewrite — it has already modified or deleted your source files
- The Drift
> The other three cost a re-run. This one costs data. Prevent it with copies, narrow scope, and explicit write boundaries.

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

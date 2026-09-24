# Anatomy of a Great Run

You know the parts: the brief, the deliverables, the plan review, the steering moves. This lesson puts them together. It is one complete run, start to finish, with the operator's thinking written on the page.

Watch where the time goes. Most of it is **before** and **after** the run, not during it. That is not a flaw in the process. It *is* the process.

:::concept The job
Jordan leads RevOps at a mid-market software company. The VP of Sales wants a deal-review pack for Monday's forecast call: which open deals are at risk, and what decision each one needs. Jordan has a CRM export, `pipeline-q3.csv`, and last quarter's pack in `archive/`.
:::

## The timeline

| Minutes | Stage | What Jordan does | Why it pays |
|---|---|---|---|
| 0–6 | **Brief** | Writes all five B.R.I.E.F. parts and asks for two artefacts | Every later check depends on it |
| 6–8 | **Plan review** | Reads the plan against the four-point review; fixes three things | Cheapest moment to catch an error |
| 8–20 | **Run** | Watches the first minute, then lets it work; one nudge | Early steering is almost free |
| 20–30 | **Verify** | Runs the four-check pass on the output | Makes the time saving real |
| 30–32 | **Keep** | Saves the brief for next week | The next run starts at minute 6 |

About a third of Jordan's attention goes on verification. That ratio is normal for the first run of a new brief, and it falls as the brief matures.

## 1 · The brief (minutes 0–6)

```prompt
I run RevOps. This pack is for our VP of Sales, who will read it in the ten minutes before Monday's forecast call and needs to leave knowing which deals need a decision.

Using only `pipeline-q3.csv`, produce two files in `output/`:

1. `deal-review.xlsx` — one row per open opportunity: account, owner, stage, amount_usd, close_date, days_since_last_activity, risk (high/medium/low) and a one-line reason for the risk. Totals by stage with live formulas.
2. `deal-review.md` — a one-sentence headline; the five highest-risk deals with the specific evidence from the export; the decision each one needs this week; and a Slack summary of four sentences or fewer.

Rules: never estimate a missing amount or date — write "not recorded". Do not use the web or the files in `archive/`. Write only to `output/`.

Flag separately, rather than deciding: any row you exclude from a total and why, any deal whose stage and close date contradict each other, and anything you inferred rather than read.

Show me your plan before you start.
```

:::details Why each line is there
- **"Read in the ten minutes before…"** — Background. It sets length and tone better than "be concise" ever could.
- **Two files** — Result. The spreadsheet is the evidence; the memo is the argument. Without the spreadsheet, the three-number trace is impossible.
- **"Using only `pipeline-q3.csv`" and "not `archive/`"** — Inputs. Last quarter's rows would blend silently into this quarter's totals.
- **"Never estimate…"** — Edges. The single rule that prevents the Confident Gap.
- **The Flag list** — Flag. Exclusions and contradictions become visible instead of being resolved for you.
- **"Show me your plan"** — buys the cheapest review of the whole job.
:::

## 2 · The plan (minutes 6–8)

Cowork answers with a plan. It looks fine at a glance. Review it the way the four-point plan review teaches: wrong source, wrong write, missing step, wrong shape.

```spot
# Select every step you would change before approving this plan, then choose Check.
Step 1: Read `pipeline-q3.csv` and profile the columns and row count. [[Step 2: Read last quarter's pack in `archive/` to match its format and fill in any missing close dates.|Wrong source, twice. The brief excluded `archive/`, and "fill in missing close dates" is exactly the estimate the brief forbade. Missing dates must say "not recorded".]] Step 3: Score each open deal for risk from stage, close date and days since last activity. [[Step 4: Save a cleaned copy of the export over `pipeline-q3.csv` so the totals are consistent.|Wrong write. It would overwrite the source file. Cleaned data belongs in `output/`, and the source stays untouched.]] Step 5: Build `deal-review.xlsx` with totals by stage. [[Step 6: Write `deal-review.md` with the headline, the top five risks and the Slack summary.|Missing step. The flag list is gone: excluded rows, stage/date contradictions and inferences. Silent omission is the most common plan failure.]]
```

Jordan's reply takes thirty seconds:

```prompt
Three changes, then go ahead. Skip `archive/` entirely — leave missing dates as "not recorded". Do not overwrite `pipeline-q3.csv`; write any cleaned copy to `output/`. And add a step that writes the flag list — excluded rows, stage/date contradictions, and inferences — as its own section in the memo and its own tab in the spreadsheet.
```

## 3 · The run (minutes 8–20)

Jordan watches the first minute, because that is when a wrong turn is cheapest to fix. The activity feed shows the profile of the file: 42 rows, two with a blank amount. Good — that matches the export.

At minute 11, Jordan sees the risk reasons quoting stage names in three spellings ("Negotiation", "negotiation", "Negotiate"). That is a small problem with the method, not with the goal, so it gets a nudge, not a restart:

> "Keep going, but normalise the stage names before you score risk, and list the spellings you merged in the flags."

Then Jordan stops watching. The rest is read-only analysis written to a scratch folder — the "let it run" case.

```scenario
S: At minute 16 you glance at the feed and see Cowork scoring "risk" only from days since last activity. It has ignored the close dates.
Q: What do you do?
+ Redirect: tell it to stop, score risk from stage, close date and activity together as the plan said, and redo the scoring.
> The goal is right; the method has drifted from the approved plan. A redirect costs one message, and every artefact after it is built on the right scores.
~ Let it finish, then ask it to rescore at the end.
> It works, but the memo, the top five and the Slack summary will all be rebuilt from new scores — a full second pass you could have avoided.
- Leave it. Activity is probably the best risk signal anyway.
> You approved a plan with three signals. Silently accepting one means the VP reads a risk ranking nobody agreed to — and you cannot explain it on the call.
```

## 4 · Verify (minutes 20–30)

The files are in `output/`. They look finished. Jordan runs the four-check pass anyway.

| Check | What Jordan did | What it found |
|---|---|---|
| **Trace three numbers** | Picked the Negotiation total, one deal amount and "days since activity" for one account, and followed each to a source row | Two matched exactly. The Negotiation total in the memo said "about $1.2M"; the spreadsheet said $1,184,300. Fixed the memo to the real figure |
| **Count the rows** | 42 rows in; 40 in the totals plus 2 flagged with blank amounts | Reconciles, and the memo says so |
| **Verify claims** | The memo said one deal "has gone quiet since the pricing call". Jordan checked the export's last-activity note | The note said "pricing sent". Changed the claim to what the source says |
| **Read the flags** | Five flags: 2 blank amounts, 1 stage/date contradiction, 2 merged stage spellings | The contradiction was a real data-entry error. Jordan fixed it in the CRM and noted it in the memo |

Two corrections to the memo and one to the CRM, in ten minutes. None was visible from the memo alone, and the two memo errors would have been repeated on Monday's call in Jordan's voice.

## 5 · Keep the asset (minutes 30–32)

The brief worked, with three fixes that came from the plan review. Jordan folds those fixes back into the brief and saves it as a note. Next Monday's run starts at minute 6, not minute 0. By the third week it is worth turning into a Skill, then a schedule — Module 8.

:::tip The pattern to copy
**Fix the brief, not the output.** Every correction Jordan made during the plan review went back into the saved brief. That is why the second run is faster *and* better than the first.
:::

## Put the run in order

```order
# Six moments from Jordan's run. Put them in the order a great run follows.
1. Write the brief with all five parts and two artefacts
2. Read the plan and fix the wrong source, the wrong write and the missing step
3. Watch the first minute of the run and nudge the stage-name problem
4. Let the read-only analysis run unwatched
5. Trace three numbers, count the rows, check the claims and read the flags
6. Fold the plan fixes back into the saved brief
> Brief, review, steer early, let it run, verify, keep. The two cheapest moments to fix anything are the brief and the plan — which is why they come first and take the least time.
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: Where does most of the time in a great run go?
A: Before and after it: briefing, plan review and verification. The run itself needs the least attention.

Q: What are the four things to look for in a plan?
A: Wrong source, wrong write, missing step, wrong shape — in that order, because they cost most to miss.

Q: When should you watch a run closely?
A: The first minute, the first run of a new brief, and anything that writes outside `output/` or touches a real system.

Q: A method drifts but the goal is still right. Which move?
A: Redirect: stop that part, restate the method, and redo it. Restart only when the brief itself was wrong.

Q: What do you do with fixes found in the plan review?
A: Fold them back into the saved brief, so the next run starts right.
```

```quiz
Q: Jordan's plan included "fill in any missing close dates from last quarter's pack". Why was that the most dangerous step?
+ It is an estimate the brief forbade, from a source the brief excluded — a Confident Gap built into the plan
- It would make the run slower
- Last quarter's format is out of date
- It writes to the wrong folder
> Wrong source plus an invented value. The output would look complete and be quietly wrong. The plan review is where that is cheapest to stop.

Q: The memo said "about $1.2M" but the spreadsheet said $1,184,300. What does this show?
+ Why the data artefact matters: without it, the three-number trace could not have found the rounding
- That spreadsheets are more accurate than memos
- That the brief should have asked for a shorter memo
- Nothing — rounding is always fine in an exec memo
> Two artefacts make the narrative checkable. "About" hid a rounded figure that would have been repeated as fact.

Q: Why did Jordan nudge the stage-name problem instead of stopping the run?
+ The goal and approach were right; only a detail of the method was off, so a one-line correction was enough
- Stopping a run deletes its progress
- Nudges are always better than restarts
- The 60-second rule forbids stopping
> Match the intervention to the problem: nudge a detail, redirect a method, restart a wrong brief.
```

:::try Next
Module complete. Now make Cowork see your real systems — safely — in Module 3.
:::

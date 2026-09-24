# The Failure Clinic

Every lesson so far has taught you how to prevent a bad run. This one teaches you to **diagnose** one — fast, from the symptom alone — because you will meet them, and so will the people you roll this out to.

Six case files follow. Each is a real kind of failure, described the way it shows up: as a document that looks fine and is not. Read the symptom, make your diagnosis, and read why the other diagnoses lose.

:::concept The clinic's one question
For every failure, ask: **which line in the brief, or which check, would have caught this?** A failure you can name is a failure you can prevent — on the next run, and in the brief you save.
:::

## The six failures, at a glance

| Failure | What you see | The brief line that prevents it | The check that finds it |
|---|---|---|---|
| **Confident Gap** | A plausible number or date with no source | "Never estimate a missing value — write 'not recorded'" | Trace three numbers |
| **Silent Exclusion** | A total that does not reconcile, and no note why | "Flag every row you exclude, and why" | Count rows in and out |
| **Drift** | Early and late items scored by different rules | "Review all items together and make the criteria consistent" | Compare the first and last items |
| **Eager Rewrite** | Source files renamed, edited or overwritten | "Write only to `output/`. Do not modify the sources" | Prevent it — detection is too late |
| **Wrong Source** | Facts from a folder, quarter or product you never meant | "Use only … Do not use the web / `archive/`" | Read the plan before approving |
| **Quiet Resolution** | Two sources disagreed; the document picked one | "Flag contradictions rather than resolving them" | Read the flag section |

## Case 1 — The tidy win rate

```scenario
S: A campaign readout says "Webinar leads convert at 18%". The source export has 140 webinar leads and 21 conversions — 15%. Nothing in the readout mentions the difference.
Q: What is your diagnosis, and the fix?
+ A Silent Exclusion: rows were dropped from the calculation. Count rows in against rows out, and add "flag every row you exclude, and why" to the brief.
> 21 of 140 is 15%; 21 of about 117 is 18%. Roughly 23 rows vanished — probably blanks or duplicates. The rate is not invented; the denominator is. Only a row count shows it.
~ A Confident Gap: the model invented the 18%. Add "never estimate a missing value".
> Worth checking, but the pattern (a real numerator, a smaller denominator) points to rows removed, not a number made up. The estimate rule alone would not have surfaced the exclusion.
- Rounding. 15% and 18% are close enough for an internal readout.
> Three points on a conversion rate can move a budget decision. And the gap is not rounding — it is 23 missing leads nobody chose to drop.
```

## Case 2 — The benchmark nobody sourced

```scenario
S: A board-pack draft says "Our CAC payback of 14 months compares well with the industry benchmark of 18 months." The brief restricted sources to the finance export.
Q: What went wrong?
+ A Confident Gap: the benchmark came from general knowledge, not from the permitted source. Cut it or source it, and restate "use only these files; no general knowledge".
> The finance export contains no industry benchmarks, so the 18 months could only have come from somewhere else. It may even be right — but you cannot defend it in a board meeting.
~ A Wrong Source: the web was used. Turn off web access.
> Close, but the benchmark can come from the model's general knowledge with no web access at all. The instruction needs to exclude general knowledge, not just the web.
- Nothing is wrong. The comparison makes the slide stronger.
> A number you cannot source, in front of a board, is the most expensive kind of error. The claim table in *Verify Before You Send* lists exactly this.
```

## Case 3 — The scorecard that changed its mind

```scenario
S: Cowork scored 60 interview transcripts for "pain severity" across parallel subagents. The first ten average 3.1 out of 5; the last ten average 4.4. Nothing about the customers changed.
Q: Diagnosis?
+ Drift: the criteria shifted across the run and between workers. Ask for a consistency pass — "review all items together and make the scoring consistent" — then compare first and last again.
> Long, parallel runs apply subtly different rules at different times. The fix is a final pass that re-reads every score against one written rubric.
~ The later customers really were in more pain.
> Possible, which is why you check. Pick two similar transcripts, one early and one late, and compare their scores and the reasons given. If the reasons use different standards, it is drift.
- Cut the run into ten smaller runs of six transcripts each.
> More runs means more places for the criteria to differ. Consistency comes from one rubric and a review pass, not from smaller batches.
```

## Case 4 — The folder that got "organised"

```scenario
S: You asked Cowork to "organise the Q3 contracts folder". The files are now renamed to a neat pattern — and the version your legal team marked up is gone, overwritten by a cleaned copy.
Q: What is the lesson?
+ An Eager Rewrite. It cannot be undone from the output, so prevention is the only fix: work on copies, and write "write only to `output/`; do not modify, rename or delete sources" in every brief that touches files.
> Of the six failures, this is the one that costs data rather than a re-run. The brief line and a copy of the folder are cheap; the lost markup is not.
~ Restore the file from backup and ask Cowork to be more careful.
> Restore it, yes. But "be careful" is a wish. The next run needs an explicit write boundary.
- Nothing went wrong — the folder is organised now.
> The task succeeded and the job failed. Renames and overwrites do not trigger a permission prompt the way permanent deletions do, so they pass silently.
```

## Case 5 — Last year's numbers, this year's pack

```scenario
S: A pipeline summary shows 61 open deals. Your CRM shows 42. The plan you approved skimmed "read the pipeline files".
Q: Where would you look first, and what prevents it?
+ The plan: "the pipeline files" probably included last quarter's export. It is a Wrong Source — name the exact file in the brief and read the plan's sources before approving.
> 61 − 42 = 19 extra rows, the size of an old export. The four-point plan review puts "wrong source" first because it invalidates the whole run.
~ Ask Cowork to remove duplicates and re-run.
> It might, but deals from last quarter are not duplicates — they are the wrong data. De-duplication hides the cause.
- Trust Cowork's number; the CRM may be out of date.
> The CRM is the source of truth for open deals. When the output and the source disagree, the output has to explain why.
```

## Case 6 — The customer who said two things

```scenario
S: An insight report quotes a customer: "Onboarding took us a week." A second transcript from the same account says "it took our team most of a month". The report mentions only the first.
Q: Diagnosis and fix?
+ A Quiet Resolution: two sources disagreed and the document picked one. Add "flag contradictions and quote both sides" to the brief, and read the flag section before you send.
> Contradictions are information — often the most useful in the report. A document that resolves them silently removes the finding you most needed.
~ A Confident Gap: the week figure is invented.
> The quote is real; it is in a transcript. The failure is not invention but selection.
- Keep the shorter quote; it makes the product look better.
> That is how a report becomes an advert. It will also fall apart the first time someone from that account is in the room.
```

## Find the failures in the wild

This summary came back from a Product-lane run. Four sentences carry one of the six failures.

```spot
# Select each sentence that shows one of the six failures, then check.
We ran eight discovery interviews and all eight transcripts are included (source: `discovery/`). [[Seven of eight customers named reporting as their top pain.|A Silent Exclusion hides here: the theme table lists only six customers under "reporting". Count the rows behind the claim before you repeat it.]] [[Customers typically lose four hours a week to manual exports.|A Confident Gap: no transcript gives a weekly hours figure. "Typically" is doing the work of a source that does not exist.]] Acme and Borealis both asked for scheduled reports, with verbatim quotes in the appendix. [[Onboarding feedback was consistently positive.|A Quiet Resolution: the Northwind transcript calls onboarding "painful". Contradictions must be flagged, not averaged away.]] The three open questions for next round are listed at the end. [[Competitor pricing starts at $49 per seat, which makes us cheaper.|A Wrong Source: the brief allowed only the transcripts. This came from somewhere else and has no date — check it or cut it.]]
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: A real numerator over a shrunken denominator — which failure?
A: **Silent Exclusion.** Rows were dropped. Count rows in against rows out.

Q: Which failure can you only prevent, not repair?
A: **Eager Rewrite.** Overwritten or renamed sources cannot be rebuilt from the output. Work on copies and set a write boundary.

Q: Early and late items scored by different standards — which failure?
A: **Drift.** Ask for a consistency pass against one written rubric.

Q: Why is "no web" not enough to stop an invented benchmark?
A: The model's general knowledge is also a source. Say "use only these files; no general knowledge".

Q: What is the clinic's one question?
A: Which line in the brief, or which check, would have caught this?

Q: Two sources disagree and the report quotes one. What is it called?
A: **Quiet Resolution.** Ask for contradictions to be flagged with both sides quoted.
```

```quiz
Q: A deliverable's total does not match the source, and the document gives no reason. What is the fastest check?
+ Count the rows in and the rows out
- Ask Cowork whether it made any mistakes
- Re-run the same brief
- Read the narrative more carefully
> Row counts expose Silent Exclusions in seconds, and a narrative never will.

Q: Which failure is prevented mainly at plan review, before any work happens?
+ Wrong Source
- Drift
- Quiet Resolution
- Silent Exclusion
> "Wrong source" is the first point of the plan review because it invalidates the whole run, and the plan is where the sources are listed.

Q: Why teach diagnosis when the brief already prevents most failures?
+ Briefs are never perfect, and a failure you can name from its symptom is one you can fix in the brief for every future run
- Because Cowork fails on most runs
- Diagnosis replaces verification
- So you can blame the model accurately
> The loop is: symptom → name → brief line or check → saved brief. Naming is what turns one bad run into a better process.
```

:::try Next
You can now prevent, catch and diagnose failures. The last step is taking this to your team — without the failures coming with it.
:::

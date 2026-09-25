# Lab: Forecast, Board Pack & the Proofreading Pass

Twenty minutes. A small driver-based forecast with every assumption in an editable cell, a board deck where every number traces to the model — and the proofreading pass that checks it all before anyone else sees it.

This lab uses `output/variance-pack.xlsx` from Lab 1 (Parts 1–2) and `output/reconciliation-summary.md` from Lab 2 (Parts 1–2). If you skipped either, run those parts first.

## Part 1 — The driver-based mini-forecast (7 min)

The discipline here is **chaining**: decompose first, agree the drivers, then build. One mega-prompt for a finished forecast is where numeric errors breed.

:::lab Step 1 — Decompose first
```prompt
Read `output/variance-pack.xlsx` and `finance/budget-vs-actuals.csv`. Before building anything: propose the driver tree for a 12-month forecast of this P&L — which lines are driven by volume, which by rate, which are fixed, which are seasonal. List every assumption you would need from me, with the value you would default to and where that default comes from. Do not build the model yet.
```

- [ ] Read the driver tree and correct at least one assumption — there is always one
:::

:::lab Step 2 — Then build
```prompt
Good — with those corrections, build `output/forecast.xlsx`:
- Assumptions tab: every driver in a labelled, editable cell, with a one-line note on its source
- Forecast tab: 12 months, every line a LIVE FORMULA reading from the Assumptions tab and the actuals — no pasted values anywhere a formula could be
- Sensitivity tab: the two assumptions the outcome is most sensitive to, shown at low / base / high

Add a status line on the Assumptions tab: rows of actuals read, months forecast, and any line you could not model with the data available — stated, not smoothed over.
```

- [ ] Change one assumption cell and watch the forecast move — if it does not, the model is dead; re-brief with the live-formula instruction
:::

## Part 2 — The board pack (7 min)

:::lab Step 3 — The deck
```prompt
BACKGROUND. I present to the leadership team next week. Sources: `output/variance-pack.xlsx`, `output/reconciliation-summary.md`, `output/forecast.xlsx`.

RESULT. Produce `output/board-pack.pptx`, six slides:
1. The headline and the single number that matters
2. The month in numbers — budget vs actual with the waterfall
3. The five variances that matter and their drivers
4. Balance-sheet hygiene — reconciliation status, exceptions and their impact, plainly stated
5. The forecast — base case with the two sensitivities
6. What I want from the room: decisions, not information

INPUTS. Only the three source files above.

EDGES. Every number on every slide must come from the three source files — if a number is not in them, the slide does not get it. State every limitation plainly: no softening a miss into "broadly in line", no reframing a one-off as strategy. Speaker notes: three bullets a slide, maximum. Do not invent a trend the data does not show.

FLAG on a final hidden slide: every number you were tempted to round or simplify, and what the exact figure is.
```

- [ ] The deck opens and the numbers match the workbooks — spot-check slide 2 against the waterfall
- [ ] Slide 4 states the exceptions plainly rather than burying them
- [ ] The flag slide exists and is honest
- [ ] Check the **story order**: Cowork sometimes orders stories by magnitude, and the biggest number is not always the most strategically important one — reorder if the story demands it (a caveat straight from a finance leader's real close run: [F9 Finance](https://www.f9finance.com/claude-cowork-month-end-close/))
:::

## Part 3 — The proofreading pass (6 min)

Anthropic's finance team checks its board materials the same way: Claude is asked to *"validate that every number and claim reconciles to a single source of truth"* ([Anthropic](https://claude.com/blog/how-anthropics-finance-team-uses-claude-to-shape-the-narrative-behind-the-numbers)). Here you make it a **separate pass, fresh eyes, that traces every number to a verified source**. Run it as its own task so it is not marking its own homework.

:::lab Step 4 — Fresh-eyes audit
Start a **new** Cowork task with the deck, source files, and review criteria. Check shared project instructions and, for cloud tasks, enabled memory; a new task may still receive prior context. Then run:

```prompt
You are a proofreader with no stake in this deck being right. In `output/` you will find `board-pack.pptx` and its three sources: `variance-pack.xlsx`, `reconciliation-summary.md`, `forecast.xlsx`.

For EVERY number in the deck: state the number, the slide, the exact source cell or line it comes from, and MATCH or MISMATCH. For every claim that is not a number — "driven by", "one-off", "on track" — state the evidence for it or mark it UNSUPPORTED.

Produce `output/proofread-report.md`: the mismatches and unsupported claims first, then the full trace table. If everything checks out, say so — but only after actually tracing every number.
```

- [ ] The report traced every number, not a sample
- [ ] Fix anything it caught, then re-run it once — clean second pass or it does not go out
:::

:::concept Why a fresh session
A separate task reduces the influence of the builder's conversation. It can still share context and repeat the same model errors. Treat its trace table as review assistance: reconcile important figures yourself and retain the finance owner's sign-off. See [Claude's memory documentation](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context) for what can carry across chats.
:::

## Make it permanent

- [ ] Save the proofreading brief — in Module 8 it becomes your **first finance Skill**, and it should be built before any automation
- [ ] The whole chain — variance pack, reconciliation, pack, proofread — is your capstone candidate, and Module 8 puts the read-only parts on a schedule (writing to a connected Drive, OneDrive or SharePoint folder, as cloud scheduled tasks cannot reach local folders)

## Reflect

Answer about your own work, not the practice data. Your answers save to your notebook in this browser.

```reflect
What did the fresh-session proofread catch that the session which built the deck missed? Which of your real close documents most needs the same independent pass?
```

```reflect
Which slide in your real board pack would most tempt you to smooth a limitation, and what line in your brief will make that limitation explicit?
```

```quiz
Q: Why decompose the driver tree before building the forecast?
- It is faster
+ Multi-step numeric work is where errors breed — agreeing the drivers first catches the wrong assumption before it is buried under twelve months of formulas
- The xlsx format requires it
- To produce more files
> Chain the steps: decompose, agree, then build. Never one mega-prompt for a finished model.

Q: What is the test that the forecast model is actually alive?
- It has three tabs
+ Change one assumption cell and the forecast moves — if it does not, values were pasted and the model is dead
- The file opens without errors
- The sensitivity tab exists
> An editable assumption that changes nothing is the tell for hard-coded values.

Q: Why use a separate task for the proofreading pass?
- To save context space
+ It reduces reliance on the builder's conversation, while direct source checks and a finance reviewer remain necessary
- Fresh sessions are faster
- The pptx cannot be read twice in one session
> Fresh context can help, but it does not guarantee independent reasoning or correct results.

Q: Slide 4 must state the reconciliation exceptions "plainly". What failure mode is that guarding against?
- Overly long slides
+ Smoothing — a limitation softened into a positive framing, which in a board pack is a misrepresentation, not a style choice
- Duplicate numbers
- Missing speaker notes
> The brief forbids it and the proofread checks for it. Both layers exist because the model does it by default.
```

:::try Next
Your lane is done. Module 8 makes it repeatable: Skills, schedules, and handing the whole machine to a colleague.
:::

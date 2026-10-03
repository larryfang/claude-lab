# Capstone: The Revenue Review Machine

Forty minutes. One end-to-end build that uses every piece of this course: connectors, a Skill, a fan-out, a verification pass, and a schedule.

At the end you will have something that runs on Monday whether you remember it or not.

:::concept What you are building
A **review machine** for your lane: a repeatable, scheduled job that pulls from your real systems, produces a data artefact and a narrative artefact, flags what needs a human, and reports its own health.

Not a one-off deliverable. A thing that keeps producing.
:::

## Choose your build

:::details 💼 Sales — the Monday pipeline machine
**Produces:** a hygiene delta report, a forecast model, a two-page deal review, and a brief per at-risk account.

**Sources:** CRM, email, your notes folder.

**Cadence:** Monday 8am, into a draft folder.
:::

:::details 📣 GTM — the weekly market and funnel machine
**Produces:** a competitive-change digest with citations, a funnel model, a campaign readout, and a flag list of messaging claims that have gone stale.

**Sources:** campaign data, competitor pages (Research / web search; Chrome when interaction is needed), CRM.

**Cadence:** Monday 8am, into a draft folder.
:::

:::details 🧭 Product — the weekly evidence and update machine
**Produces:** a tracker reality check, three audience-specific updates, a backlog-evidence table, and a loop-closing list.

**Sources:** Jira or Linear, support tickets, feedback records.

**Cadence:** Monday 8am, into a draft folder.
:::

:::details 🧾 Finance — the weekly numbers machine
**Produces:** a debtors and cash delta report, a refreshed variance summary, an exception list from the latest reconciliation, and a proofread report on all of it.

**Sources:** your accounting/AR exports (Drive or M365), email, last week's files.

**Cadence:** Monday 8am, into a draft folder.
:::

## Stage 1 — Foundation (8 min)

:::lab Build the Project
- [ ] Create a Cowork **Project** for this work with **Start from scratch**, so it is saved to your Claude account (a Project made with **Use an existing folder** stays on this computer, which breaks the cloud schedule in Stage 7)
- [ ] Write its instructions: who you are, what you sell or build, your definitions (weightings, thresholds, taxonomies, currency), your **unreliable fields list**, standing rules, and your tone preferences
- [ ] For supervised practice, create a workspace with `sources/`, `reference/`, `output/weekly/` and `snapshots/`. Grant only the required files or folder. Check the task's execution setting and plan Stage 7's input access and report storage explicitly; a local folder does not imply local execution
- [ ] Connect the systems you need and run a **read-only smoke test** on each — a query whose answer you already know
- [ ] Record everything in `ACCESS-LOG.md`
:::

- [ ] Every connector returns data that matches the real system
- [ ] The Project instructions contain my actual definitions, not placeholders

:::warning Do not proceed on a failed smoke test
If any connector returns numbers that do not match its source system, fix that first. Everything above it inherits the error, and a scheduled job will inherit it silently, every week.
:::

## Stage 2 — The ground-truth pass (8 min)

Always the first stage of the chain. Data quality before analysis.

:::lab Build stage 2
Write and run a brief that produces `output/weekly/reality-YYYY-MM-DD.md`:

- [ ] The exact query run: systems, filters, date range, records matched, records returned
- [ ] Every data quality problem, itemised with its record ID
- [ ] Every record excluded from downstream analysis, and why
- [ ] A data-quality summary with evidence: completeness, freshness, reconciliation failures, and unresolved issues
- [ ] A status line at the top: date, record counts, and OK or PROBLEM

Rules to include: never estimate a missing value; account for every input record as included, excluded, or deduplicated with a reason; state input and output counts and explain any grouping. A model-generated confidence score is not a substitute for these checks.
:::

- [ ] I checked the reported issues against the source; if none were found, the report shows which checks ran
- [ ] The status line is glanceable

## Stage 3 — The model (8 min)

:::lab Build stage 3
Produce a spreadsheet in `output/weekly/` with:

- [ ] A **Data** tab: the cleaned records, header frozen
- [ ] A **Model** tab: your calculations as **live formulas**, with assumptions in labelled editable cells
- [ ] Outcome counts, cohort definitions and observation periods next to rankings; source row count alone is not statistical sample size
- [ ] An **Excluded** tab: every record not in the model, why, and the total value those records represent
:::

- [ ] I changed an assumption and the totals moved
- [ ] The Excluded tab tells me how much is unexplained
- [ ] Every ranking shows its sample size

## Stage 4 — The narrative (8 min)

:::lab Build stage 4
Produce your review document in `output/weekly/`. Two pages maximum, and it must include:

- [ ] A headline: one sentence, the honest state of things
- [ ] The numbers, in a compact table, each traceable to the model
- [ ] What needs attention, with the specific evidence for each item
- [ ] What is going well, with the evidence
- [ ] **What I need** — decisions, resources, air cover, stated as requests
- [ ] **What this cannot tell you** — the honest limits
- [ ] A paste-ready summary of four sentences
- [ ] A flag section: anything needing a human before this is used

Rules: every claim cites the model; every ranking states its sample size; never describe stalled or missing data as healthy; two pages maximum.
:::

- [ ] Two pages, and I would actually send it
- [ ] Every claim traces to the model

## Stage 5 — The fan-out (4 min)

:::lab Build stage 5
One file per item that needs individual attention — per at-risk deal, per competitor change, per stalled epic.

- [ ] Identical structure and unique record IDs in filenames, so items at the same account cannot overwrite each other
- [ ] An `_index.md` comparison table
- [ ] A final consolidation pass across the set, listing what was normalised
- [ ] Tested on **two** items before running on all of them
:::

## Stage 6 — Skill it (2 min)

:::lab Package the chain
- [ ] Turn the whole four-stage chain into one `SKILL.md`
- [ ] Its definitions section holds your company specifics
- [ ] Its rules section holds every correction you made during this build
- [ ] Description lists the main phrasings that should trigger it, within 200 characters
- [ ] **Cold test**: ask in natural language, without pasting anything. Does it fire and produce all four artefacts?
:::

## Stage 7 — Schedule it (2 min, after two more runs by hand)

:::lab Go unattended
- [ ] Add the explicit failure path: *"If a source is unreachable, incomplete or unexpectedly empty, still produce a PROBLEM report identifying the failure. A verified query with no matching records is an EMPTY result, not an invented failure. Never produce a normal-looking analysis from missing data."*
- [ ] Add the delta instruction: compare against last week's accessible file. With no baseline, report FIRST RUN and make no change claims
- [ ] Add the empty case: *"If nothing needs attention, say so in one line and stop."*
- [ ] Confirm it is **read-only** on every source system and writes only its own report file
- [ ] Test the scheduled task's actual input tools and execution setting (see Module 8's cloud transition guidance). Review downloadable reports in the task conversation. Use a connected `Cowork-Reports` folder only if its connector supports file creation and subsequent reads; enable only the required tool. If previous-run storage is unavailable, keep comparisons manual. Create the schedule inside the Project from Stage 1
- [ ] Run it **manually** twice more and read each output in full
- [ ] Then schedule it for Monday 8am
- [ ] After the second scheduled run, confirm it read the first run's file in `Cowork-Reports`
:::

:::warning Three runs by hand, then the schedule
Practise three runs by hand: the cold test in Stage 6 plus the two manual runs above. Review the first three scheduled outputs fully, then set a review cadence based on the consequences. Three clean runs do not establish that future reports can go unchecked.
:::

## Stage 8 — Verify and hand over (final)

:::lab The four-check pass
- [ ] Traced every decision-critical number plus an additional sample to source
- [ ] Included records, exclusions, duplicates, and group counts reconcile to the input
- [ ] Quotes for publication and decision-relevant external claims checked at source
- [ ] Read every flag and resolved it
- [ ] Every unverifiable number removed or marked
- [ ] I can explain every conclusion in my own words
:::

:::lab The handover
Generate `output/HANDOVER.md` covering: what this does, the Skill and its trigger phrases, the Project instructions and why each definition matters, the connectors and their smoke tests, three example requests, the known limitations, and what to review quarterly.

- [ ] Written, read, and corrected where it was wrong
- [ ] Given to one colleague who ran it without me
:::

## Show the evidence

Keep a short `output/REVIEW.md` with these four items. These are this lab's assessment criteria; ticking Complete records your progress, not an independent assessment.

| Evidence | Ready when |
|---|---|
| **One normal run** | The required files exist, open correctly, and reconcile to the source data |
| **One failure rehearsal** | On a copy of the practice inputs, a missing or empty source produces an explicit PROBLEM report rather than a reassuring summary |
| **One correction** | A specific finding is fixed and the affected check is rerun; if no fault was found, record the checks instead of inventing one |
| **One handover** | A colleague can run the workflow and knows which outputs still need human review |

If a required check is missing or failing, keep the workflow in supervised practice. For the failure rehearsal, use copied inputs or a dedicated test task; do not remove a production connector or alter shared source data.

## What you built

Look at what you built. Every concept in this course is in there:

| Module | Where it appears |
|---|---|
| The brief | Every stage's instructions |
| Deliverables | The spreadsheet with live formulas and the two-page narrative |
| Steering | The plan review at each stage |
| Connectors | Stage 1, with smoke tests and an access log |
| Your lane's play | Stages 2–5 |
| Skills | Stage 6, cold-tested |
| Schedules | Stage 7, with a failure path and delta reporting |
| Projects | Stage 1, holding your definitions |
| Verification | Stage 8, as a habit |
| Rollout | The handover |

:::concept What you actually learned
Not a tool. A way of delegating: describe the outcome precisely, name the sources, set the rules, ask to be told what you should decide, then verify before you trust.

That transfers to every agentic tool you will use, and to every person you will ever brief.
:::

## Reflect

```reflect
Which recurring job in your week does your review machine now do, and what will you check in its next three scheduled outputs before you trust it?
```

```reflect
Which field on your unreliable fields list would do the most damage if a Monday run used it without a flag?
```

:::try Last lesson
That is your **🏆 Capstone Champion** badge. One short lesson left: making it a habit.
:::

# Ask for Real Deliverables

Most people ask Cowork for "a summary" and get a nicely-written block of text they then spend twenty minutes putting into a deck. That is leaving the best part unused.

Cowork produces **real files** — the kind you attach to an email, present in a meeting, or hand to finance.

## What you can actually ask for

| Ask for | You get | Reach for it when |
|---|---|---|
| **Spreadsheet** (`.xlsx`) | Working formulas, multiple tabs, formatting | Anything numeric someone will want to re-cut |
| **CSV** | Clean, importable data | Feeding another system, or you want it diff-able |
| **Deck** (`.pptx`) | Slides with speaker notes | You have to present this |
| **Document** (`.docx`) | Headings, tables, styles | It goes to legal, a customer, or a formal review |
| **Markdown** (`.md`) | Plain, versionable text | Internal docs, wikis, anything going into Confluence or a repo |
| **Organised folders** | Files sorted, renamed, moved | The mess itself is the problem |
| **A set of files** | One per account / per customer / per region | Twelve pre-call briefs, one per opportunity |
| **Interactive artifact** | A live page — dashboard, calculator, tracker | The audience should *explore* the numbers, not read them |

:::tip The two-artefact rule
Ask for **data plus narrative** almost every time.

- The **CSV or spreadsheet** is the audit trail — where every number came from, what got flagged, which rows were excluded.
- The **document or deck** is the argument — what it means and what to do.

Ask for only the narrative and you cannot check it. Ask for only the data and you have not finished the job. Every lab in this course asks for both, deliberately.
:::

## Specifying a spreadsheet that is actually useful

Vague: *"Put the pipeline in a spreadsheet."*

Specific:

```prompt
Produce `output/pipeline-model.xlsx` with three tabs:

Tab "Data" — the cleaned opportunity rows, one per opp, with columns: opp_id, account, stage, amount, close_date, days_since_activity, data_quality_flag.

Tab "Model" — a weighted forecast that reads from the Data tab using live formulas (not pasted values), with stage weightings in labelled cells at the top so I can change them and watch the total move.

Tab "Issues" — every row that needs a human, with the opp_id and what is wrong with it.

Freeze the header row on every tab. Format currency as USD with no decimals. Do not hard-code any total that could be a formula.
```

That last sentence is the one that matters. **"Use live formulas, not pasted values"** is the difference between a spreadsheet and a picture of a spreadsheet — and it is what lets your CFO change an assumption without coming back to you.

## Specifying a deck that survives a real meeting

```prompt
Produce `output/qbr.pptx`, 8 slides:

1. Title + the single number that matters this quarter
2. Performance against plan — one table, actuals vs target
3. What worked — two examples, each with the number that proves it
4. What did not — same treatment, no hedging
5. Pipeline health — the risk-ranked view
6. The three decisions I need from this room
7. What I am doing about it regardless — owners and dates
8. Appendix pointer: which spreadsheet and tab each figure came from

Rules: no slide has more than 6 lines of body text. Every number appears somewhere in the source files — do not invent, round silently, or estimate. Speaker notes: 3 bullets maximum per slide, written as what I would say out loud.
```

Note slides 6, 7 and 8. **Ask for the decision, the commitment, and the audit trail.** Most decks fail because they inform a room that needed to decide something.

## Fan-out: one deliverable per thing

This is the pattern that saves whole afternoons, and most people never try it.

```prompt
For each of the 14 accounts in `opportunities.csv`, produce a separate file `output/briefs/<account-slug>-brief.md` containing:
- Account snapshot: industry, size, stage, amount, close date, owner
- Everything we know from our own notes, with the source file named
- The last recorded interaction and how long ago that was
- Three open questions specific to this account
- One suggested next step

Use the same section order and heading structure in every file so they are comparable side by side.

Then produce `output/briefs/_index.md` — a table of all 14 with account, stage, amount, days since contact, and a one-line "state of play".

After writing all 14, review them together and fix any place where the same situation was described inconsistently.
```

Two things to notice. **"Same structure in every file"** makes fourteen documents comparable instead of fourteen individual essays. And the final review pass fixes the parallel-subagent inconsistency problem from the last lesson.

## Formats and the tools around them

- Spreadsheets and decks come out as genuine Office files — they open in Excel, Sheets, PowerPoint, Keynote.
- If the deliverable is going into Confluence, Notion or a wiki, ask for **Markdown**. It pastes cleanly; a `.docx` does not.
- If it feeds a system, ask for **CSV** and specify the exact column headers that system expects.
- If a person will edit it collaboratively, ask for a format your team actually uses. There is no prize for a beautiful file nobody can open.
- If you live in a workbook all day, there is also the **Claude for Excel add-in**: it works on the open workbook directly, reads the live formulas, and edits without breaking cell dependencies. For heavy spreadsheet work — finance and RevOps especially — editing the real file often beats generating a new one. (On a company Microsoft 365 tenant the add-in is deployed by IT, not self-installed — until that approval lands, the export-into-Cowork path above does the same jobs.)

## When the deliverable should be alive

Files are snapshots. Sometimes the right deliverable is a page people interact with — and that is an **artifact**: an interactive dashboard, a what-if calculator with sliders, a filterable tracker ([artifacts guide](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)). Ask the same way you ask for a file: name the sections, the controls, and where each number must come from.

Cowork on desktop goes one step further with **live artifacts** — a dashboard that stays on your machine and **refreshes itself from your connectors**, so Monday's pipeline view is current without re-running anything ([live artifacts guide](https://support.claude.com/en/articles/14729249-use-live-artifacts-in-claude-cowork)). Desktop-only and local to that machine, so it is *your* cockpit, not the thing you send the CFO.

The choice is simple: **a file when someone needs to keep, attach, or audit it; an artifact when someone needs to explore it.** The two-artefact rule still applies — a dashboard without its underlying CSV is a claim you cannot check.

:::warning Charts, and being honest about them
Cowork can produce charts in spreadsheets and decks. Check the axes, the units, and whether the chart type matches the data — a line chart across unordered categories looks fine and means nothing. A chart is an argument in visual form, and a wrong one is more persuasive than a wrong sentence.
:::

## The specification checklist

Before you send a brief, has your Result section said:

- [ ] The **file name** and **path**
- [ ] The **format** (`.xlsx` / `.pptx` / `.docx` / `.md` / `.csv`)
- [ ] The **sections or tabs or columns**, in order
- [ ] Any **length limit** ("6 lines per slide", "4 sentences")
- [ ] For spreadsheets: **live formulas, not pasted values**
- [ ] For a set of files: **identical structure across all of them**
- [ ] The companion **data artefact** so you can check the narrative

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What is the two-artefact rule?
A: Ask for **data plus narrative**. The CSV or spreadsheet is the audit trail; the document or deck is the argument.

Q: Why say "use live formulas, not pasted values"?
A: It is the difference between a spreadsheet and a picture of one. Someone can change an assumption and watch the totals move.

Q: Which three things should a deck ask for that most decks miss?
A: **The decision**, **the commitment**, and **the audit trail**. Most decks inform a room that needed to decide something.

Q: What makes a fan-out of fourteen briefs comparable?
A: The **same section order and heading structure** in every file, plus a final review pass across all of them.

Q: The deliverable is going into Confluence or a wiki. Which format?
A: **Markdown.** It pastes cleanly; a `.docx` does not.

Q: When do you want a file, and when an artifact?
A: A **file** when someone needs to keep, attach or audit it; an **artifact** when someone needs to explore it.
```

```quiz
Q: What does "use live formulas, not pasted values" get you?
- A smaller file
+ A spreadsheet whose assumptions someone can change and see the totals update — rather than a static picture of a calculation
- Faster generation
- Better formatting
> It is the difference between a model and a screenshot of a model.

Q: Why ask for both a CSV and a written report from the same run?
- To have a backup
+ The data artefact is the audit trail for the narrative — without it you cannot check any claim the report makes
- Reports cannot contain tables
- CSVs are required for connectors
> Data plus narrative. One argues, the other proves.

Q: You need fourteen account briefs that a manager will compare side by side. What single instruction matters most?
- Make them short
+ Use the identical section and heading structure in every file
- Write them alphabetically
- Put them all in one document
> Comparability comes from a shared structure. Without it you get fourteen good, incomparable essays.

Q: The deliverable is going into your team's Confluence space. Which format should you ask for?
- .docx, so the formatting is preserved
+ Markdown — it pastes into a wiki cleanly
- .pptx
- .xlsx
> Match the format to where it lands. A beautiful file nobody can paste is not a deliverable.
```

:::try Next
You can specify a great result. Now: what to do while it is running.
:::

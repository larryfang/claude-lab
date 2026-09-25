# Lab: Month-End Variance Pack

Twenty-two minutes. Budget vs actuals in, a variance pack out: a live-formula workbook, a waterfall, and a commentary your CFO would actually read — then the verification pass that makes it safe to circulate.

:::note Works with practice or real data
This lab generates its own fictional data, like Module 1 did. If you would rather use a real (non-sensitive) budget-vs-actuals export, drop it in `finance/` and skip Part 1 — the briefs are identical.
:::

## Part 1 — Make the mess (4 min)

:::lab Step 1 — Generate a fictional close
```prompt
In the `finance/` subfolder, create realistic but entirely FICTIONAL practice data so I can learn on it. Invent all company, vendor and account names — do not use any real company.

Create:
- `budget-vs-actuals.csv` with 40 rows and columns: gl_code, gl_name, cost_centre, category (revenue / cogs / opex), month, budget_usd, actual_usd
  Make it deliberately imperfect: three rows with a blank actual_usd, one gl_name spelled two different ways on two rows, one amount stored as "12,400" with a comma, and a mix of favourable and unfavourable variances including two large ones driven by an obvious one-off.
- `vendor-detail.csv` with 25 rows: gl_code, vendor, invoice_id, date, amount_usd, description — the line-level detail behind the four largest opex variances.
- `last-month-commentary.txt` — 10 lines of plausible commentary from the previous close, mentioning one issue that should have recurred this month.

Leave everything loose in `finance/`. Do not organise it.
```

- [ ] Cowork created the files
- [ ] I opened them and confirmed they are really there
:::

## Part 2 — The variance pack (12 min)

Note the shape: outcome, named sources, exact format, the non-negotiables in EDGES, and the plan first.

:::lab Step 2 — The brief
```prompt
BACKGROUND. I am preparing the month-end variance pack for our leadership. The data is `finance/budget-vs-actuals.csv` with line-level detail in `finance/vendor-detail.csv` and last month's commentary in `finance/last-month-commentary.txt`.

RESULT. Produce two files in `output/`:

1. `variance-pack.xlsx` with three tabs:
   - Data — the source rows, cleaned: consistent gl_names, amounts as plain numbers, blank actuals left empty and marked "not recorded" in a status column, plus columns variance_usd and variance_pct AS LIVE FORMULAS referencing the budget and actual cells (blank where the actual is blank)
   - Summary — totals by category and cost centre, again as formulas reading from the Data tab, never pasted values
   - Waterfall — the bridge from budgeted profit to actual profit (revenue minus cogs minus opex): the five largest favourable and five largest unfavourable movements, with an "all other" line that makes the bridge tie exactly

2. `variance-commentary.md` — maximum two pages:
   - A status line: rows in, rows used, rows excluded and why, and OK or PROBLEM
   - The headline in one sentence
   - The five variances that matter, each decomposed into its driver — volume, rate, timing, or one-off — with the vendor-level evidence cited by invoice_id where it exists
   - Anything from last month's commentary that should have recurred and did or did not
   - A FLAGS section: every row you excluded, every blank you found, every place the detail file and the summary file disagree
   - "What I cannot tell you from this data" — stated plainly

EDGES. Sign convention: variance_usd = actual minus budget, so a positive variance is favourable on revenue and unfavourable on cogs and opex. Use only the files in `finance/`. Never estimate a missing value — write "not recorded". Use exact dollar amounts in the commentary — do not round. Label every driver call as evidence-based or hypothesis. State row counts in and out for every total. Read-only on the source files; write only to `output/`.

Show me your plan before you start.
```

- [ ] Both files appeared
- [ ] The Summary tab contains formulas, not pasted values — click a cell and check
- [ ] The waterfall ties exactly to budgeted and actual profit
- [ ] The commentary flags the blank actuals and the misspelled GL name
:::

:::tip If the workbook has no live formulas
Say so directly: *"Rebuild the Summary and Waterfall tabs so every figure is a formula referencing the Data tab. Do not hard-code any number a formula could produce."* A pasted-value workbook is a dead deliverable — next month it tells you nothing.
:::

## Part 3 — The verification pass (6 min)

This is the part that earns the lab its place. On practice data the stakes are zero, which is exactly why you build the habit here.

:::lab Step 3 — Trace, reconcile, interrogate
- [ ] **Trace three numbers** from the commentary back to source rows — pick the headline figure and two driver claims
- [ ] **Reconcile the totals**: does the Summary tab tie to the sum of the Data tab? Does the waterfall tie to budgeted and actual profit?
- [ ] **Check the row counts**: rows in vs rows used vs rows excluded — do they add up?
- [ ] Ask it to show its working on the largest variance:

```prompt
Walk me through the [GL NAME] variance row by row from the source files: which rows you included, which you excluded and why, and how you decided it was a one-off rather than a run-rate change. If the evidence does not support the one-off call, say so and reclassify it.
```

- [ ] Notice whether it defends the number or corrects it — both outcomes teach you something
:::

:::warning The smoothing check
Read the commentary once more, looking only for softened language: a miss described as "broadly in line", a one-off framed as "timing". If you find one, re-brief: *"State every unfavourable variance plainly, with the number. No softening."* In finance, smoothing is not a style problem — it is how a miss reaches the board unlabelled.
:::

## Make it permanent

- [ ] Save the working brief — it is your close-week template now. One finance leader who published his full close-day prompt trail got the package from **4 hours to under 1 hour**, and put the division of labour exactly right: *"Cowork did most of the building. I did the thinking about what to do with what it built."* ([F9 Finance](https://www.f9finance.com/claude-cowork-month-end-close/))
- [ ] Note the corrections you made; they become the rules section of your Skill in Module 8
- [ ] If you have the Finance plugin, run `/variance-analysis` on the same data and compare — now you know what it is doing under the hood, and where your version is stricter

## Reflect

Answer about your own work, not the practice data. Your answers save to your notebook in this browser.

```reflect
When you asked Cowork to show its working on the largest variance, did it defend the number or correct it? What does that tell you about the checks your real close needs?
```

```reflect
In your last real variance commentary, where might a miss have been softened into "broadly in line"? What would the plain version say, with the number?
```

```quiz
Q: Why must the Summary tab use live formulas instead of pasted values?
- It renders faster
+ So the model stays alive — next close you change the data and every total updates, and a reviewer can trace any figure by clicking it
- Formulas are required for xlsx export
- It reduces file size
> A pasted-value workbook is a screenshot wearing a spreadsheet costume.

Q: The waterfall must "tie exactly" to budgeted and actual profit. Why insist?
- It looks better in review
+ A bridge that does not tie means something was dropped or invented in between — the tie is the integrity check
- Waterfalls always tie automatically
- To avoid an "all other" line
> The "all other" line exists precisely so the bridge can tie without hiding anything.

Q: What does the status line (rows in / used / excluded, OK or PROBLEM) protect you from?
- Long documents
+ The Silent Exclusion — rows quietly dropped from totals without anyone knowing, which makes a clean-looking pack wrong
- Slow runs
- Formula errors
> Row counts are the cheapest reconciliation you will ever do. Demand them on every calculation.

Q: You ask Cowork to walk through its largest variance call row by row. What are you actually testing?
- Its politeness
+ Whether the driver call is evidence-based — and whether it corrects or defends itself when the evidence is thin
- The speed of the connector
- The xlsx formatting
> "Show your working" is the finance-lane version of citing sources. Use it on every number that matters.
```

:::try Next
One pack down. Now the reconciliation — where the deliverable is the exceptions, not the matches.
:::

# Lab: Campaign Readout & Funnel Story

Twenty minutes. Messy channel data goes in. A funnel model, an honest readout, and a list of the things this data genuinely cannot tell you comes out.

The last part is what makes it credible.

:::note Data
Use a real campaign export if you have one, or the practice `gtm/campaign-performance.csv` from Module 1. Real data is better — yours has more interesting problems.
:::

## Part 1 — Integrity before insight (7 min)

:::lab Step 1 — The data integrity pass
```prompt
BACKGROUND. I am a growth PMM. Our CMO does not trust marketing dashboards because the numbers never reconcile with the CRM. Before I analyse anything, I need to know exactly what is wrong with this data.

RESULT. Two files in `output/`:

`campaign-clean.csv` — every original row, plus:
- channel_normalised, with every variant mapped
- date_clean as YYYY-MM-DD
- ctr, cost_per_click, cost_per_mql, mql_to_sql_rate, sql_to_opp_rate, cost_per_opp
- data_quality_flags — a semicolon-separated list of every problem with this row

`data-integrity.md`:
1. Row count in, row count out. If they differ, explain exactly why
2. Every channel-name variant found and what you mapped it to
3. Every row where a rate cannot be computed (zero denominator) and how you marked it
4. Every row with spend but no clicks, or clicks but no spend — these are usually tracking failures unless the channel is unpaid (email, organic, referral); list them all and say which
5. Invalid negative counts, plus possible funnel-definition anomalies such as more SQLs than MQLs. Check whether lag, direct entry or different cohorts can explain them; if the export cannot answer that, mark the cause unverified
6. Every duplicate or near-duplicate row
7. Date coverage: the actual range, and any gaps
8. A trust score out of 10 for this dataset, with reasoning

INPUTS. Only the campaign data file.

EDGES. Do not drop a single row — flag it. Never compute a rate from a zero denominator; mark it "n/a". Never estimate a missing spend or conversion figure. Write only to `output/`.

FLAG: anything that looks like a tracking or attribution failure rather than a genuine zero.

Show me your plan first.
```

- [ ] Row counts match
- [ ] It checked anomalies and distinguished confirmed errors from unresolved definitions
- [ ] The trust score is justified
:::

:::tip Section 5 is where the real problems live
More SQLs than MQLs can reflect last month's leads converting now, direct entry, different definitions, or double counting. Counts from a monthly snapshot do not establish a single conversion cohort. Flag the row and check the definitions before treating it as an error or calculating a conversion rate.
:::

## Part 2 — The funnel model (6 min)

:::lab Step 2 — A model your CMO can interrogate
```prompt
BACKGROUND. Same CMO. She will click into any number she doubts.

RESULT. `output/funnel-model.xlsx`, with four tabs:

Tab "Data" — the cleaned rows. Header frozen, currency formatted.

Tab "Funnel" — by channel and by month: spend, impressions, clicks, MQLs, SQLs, opportunities, and rates between adjacent stages where the cohorts and definitions are comparable. Use LIVE FORMULAS reading from Data. Each aggregate rate is SUM(numerator) / SUM(denominator), not the average of row rates; a zero or unknown denominator is "n/a". Label ratios of period counts as such if cohort conversion cannot be established.

Tab "Efficiency" — channels ranked by cost per opportunity, with cost per MQL and cost per SQL alongside. Show total spend, the actual MQL, SQL and opportunity counts, date coverage, and number of source rows. Row count is a coverage check, not a statistical sample-size measure. Mark comparisons with unequal cohorts, definitions or attribution windows as limited.

Tab "Excluded" — every row not counted in the Funnel tab, with the reason and the total spend those rows represent.

INPUTS. Only `output/campaign-clean.csv`.

EDGES. No hard-coded totals where a formula would do. Put confirmed invalid rows and unresolved rows that prevent a comparable calculation in Excluded, with distinct reasons. Do not discard legitimate lag or direct-entry records as errors. Show known excluded spend plus the count with unknown spend, and label affected totals PARTIAL. Never fabricate a missing value or turn it into zero.

FLAG: rankings resting on few outcomes, uneven observation periods or unresolved attribution. Report the counts; do not use a five-row threshold as proof of statistical reliability.
```

- [ ] The spreadsheet opens and the formulas are live
- [ ] The Efficiency tab shows outcome counts, coverage and comparability limits
- [ ] I checked that aggregate rates use ratios of totals, not averages of row rates
- [ ] The Excluded tab shows how much spend is unexplained
:::

:::warning Check the denominator
Two opportunities and two hundred support different levels of confidence, regardless of how many CSV rows contain them. A row may represent a day, a campaign or an entire month.

Also check the aggregate formula: 20 SQLs from 100 MQLs plus 8 from 10 gives **28 / 110 = 25.45%**, not the **50%** average of the two row rates. A larger count alone does not establish statistical significance or causal impact.
:::

## Part 3 — The readout (7 min)

:::lab Step 3 — The document that survives scrutiny
```prompt
BACKGROUND. My CMO has 10 minutes, distrusts marketing numbers on principle, and will ask "how do you know that" about every claim. She wants a budget decision, not a dashboard tour.

RESULT. `output/campaign-readout.md`, two pages maximum:

1. HEADLINE — one sentence on what this quarter actually shows
2. THE NUMBERS — a compact table: spend, MQLs, SQLs, opportunities, cost per opportunity, and the same for the prior period if the data supports a comparison. If it does not, say so rather than comparing anyway
3. WHAT WORKED — two campaigns or channels, each with the specific numbers and the sample size behind the claim
4. WHAT DID NOT — two, same treatment, no hedging and no "learnings"
5. DATA INTEGRITY — what is wrong with this data, how much spend is affected, and what that does to the confidence in sections 3 and 4
6. THREE RECOMMENDATIONS — each with the number that justifies it, the amount of money involved, and what you would expect to happen
7. WHAT THIS DATA CANNOT TELL YOU — the honest limits. Attribution, view-through, brand effects, anything the tracking does not capture
8. WHAT I NEED — decisions or resources, stated as requests

INPUTS. `campaign-clean.csv`, `funnel-model.xlsx`, `data-integrity.md`.

EDGES. Every claim needs evidence from the model. For each ranking, state the outcome counts and comparability limits. Do not call a difference statistically significant without an appropriate stated analysis; describe observed differences and uncertainty instead. Separate observational associations from causal claims. Never present cost per opportunity without noting excluded or unknown spend. Two pages maximum.

FLAG: any recommendation where you are less than confident, and say why.
```

- [ ] Two pages
- [ ] Section 5 is specific about how much spend is affected
- [ ] Section 7 exists and is genuinely honest
- [ ] Every ranking claim states its sample size
:::

:::tip Section 7 is why she will believe sections 3 and 4
Counter-intuitive but reliable: **a readout that states its own limits is trusted more than one that does not.** A sceptical executive is looking for whether you know what you do not know. Section 7 answers that question before she has to ask it, and everything else in the document gets more credit as a result.
:::

## Part 4 — Verify

:::lab The verification pass
- [ ] Trace three numbers from the readout to the model, then to a source row
- [ ] Check the total spend in the readout against the total spend in the raw file — including excluded rows
- [ ] For every ranking claim, check the sample size yourself
- [ ] If you have CRM access, compare the opportunity count against the CRM's own number and find out why they differ
- [ ] Read section 7. Is anything missing that you know to be a limit of your tracking?
:::

:::warning The comparison that always disagrees
Marketing-sourced opportunity counts and CRM opportunity counts almost never match. Common causes: attribution windows, lead-to-opportunity conversion timing, opportunities created by sales without a marketing touch, and duplicate lead records.

Find out which of these explains your gap **before** you present. "Marketing says 40, the CRM says 27, and here is exactly why" is a strong position. Being asked and not knowing is not.
:::

## Part 5 — Make it a Monday job

This chain — integrity, model, readout — is a useful scheduled draft once input access has been tested. Check the task's execution setting and the actual tools available. Review the downloadable output in its conversation, or use a folder only when the connector supports creating files there. Local-folder tasks may require Claude Desktop to stay open; see Module 8 for the current cloud transition.

- [ ] Save all three briefs as a sequence
- [ ] Note your actual channel taxonomy and hard-code it, so it does not get re-derived each run
- [ ] Note your funnel stage definitions
- [ ] Module 8 puts this on a schedule and has it report its own failures

## Reflect

Answer about your own work, not the practice data. Your answers save to your notebook in this browser.

```reflect
In your own campaign data, which ranking claim rests on the fewest rows? Would you still move budget on it?
```

```reflect
Name one limit of your own tracking that belongs in "what this data cannot tell you". How would stating it change how your CMO reads the rest?
```

```quiz
Q: Why does every ranking claim need its sample size stated next to it?
- For completeness
+ Because "best cost per opportunity" from two opportunities and from two hundred are entirely different claims — and without the count you will reallocate budget on noise
- To make the table wider
- Because CMOs ask for it
> This is the single most common way a confident data readout misleads.

Q: A readout that includes "what this data cannot tell you" is…
- Weaker, because it undermines the analysis
+ More trusted, because a sceptical executive is checking whether you know what you do not know
- The same, but longer
- Only appropriate for internal use
> Stating your limits earns credit for everything else in the document.

Q: You find more SQLs than MQLs in a monthly export. What should you check?
- A rounding error
+ Conversion lag, direct entry, cohort definitions and double counting before deciding whether the row is an error
- The data is fine
- The campaign over-performed
> Monthly counts need not represent one conversion cohort. Establish their definitions before interpreting a ratio.

Q: Marketing reports 40 opportunities; the CRM says 27. What is the right move before presenting?
- Use the CRM number, it is authoritative
+ Find out exactly which of attribution windows, timing, sales-created opportunities or duplicates explains the gap
- Present both without comment
- Average them
> "Here is exactly why they differ" is a strong position. Being asked and not knowing is not.
```

:::try Module complete
That is your **📣 GTM Operator** badge. Next: the Product lane, or jump to Module 8 to make these repeatable.
:::

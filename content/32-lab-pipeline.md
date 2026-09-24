# Lab: Pipeline Hygiene & Deal Review Pack

Twenty minutes. A messy opportunity export goes in. A risk-ranked deal review, a working forecast model, and a list of exactly what a human needs to fix comes out.

:::note Data
Use your real CRM (connector or CSV export), or the practice `sales/opportunities.csv` from Module 1. Real data is more useful here because your CRM is messier than any practice file — that is the point of the lab.
:::

## Part 1 — Hygiene first, analysis second (7 min)

Never analyse before you have looked at the data quality. An analysis of dirty data is a confident wrong answer, and it is much harder to spot than a visible gap.

:::lab Step 1 — The hygiene pass
```prompt
BACKGROUND. I am an AE preparing for a deal review. Before we analyse anything, I need to know how much I can trust my own pipeline data.

RESULT. Two files in `output/`:

`pipeline-clean.csv` — one row per opportunity, with the original columns plus:
- stage_normalised — a consistent stage taxonomy, with every variant mapped
- amount_clean — as a plain number, no currency symbols or thousands separators
- close_date_clean — YYYY-MM-DD
- days_since_activity
- days_to_close (negative if the close date has passed)
- data_quality_flags — a semicolon-separated list of every problem with this row

`hygiene-report.md`:
1. Row count in, row count out. If they differ, explain exactly why
2. Every stage-name variant found and what you mapped it to
3. Every row with a missing or malformed value, by opp_id and field
4. Every close date in the past on an open deal, by opp_id
5. Every deal with no logged activity in over 21 days, by opp_id
6. Every deal with no next step recorded, by opp_id
7. A single "trust score" for this dataset out of 10, with your reasoning

INPUTS. Only the opportunity data. Nothing else.

EDGES. Do not drop any row — flag it instead. Never estimate a missing value. Never guess at a stage; if a value is unmappable, mark it "unknown" and list it. Write only to `output/`.

FLAG: anything that looks like a data-entry error rather than a missing value, and anything where the same account appears twice.

Show me your plan first.
```

- [ ] Row count out matches row count in
- [ ] I read the hygiene report and it found things I did not know about
- [ ] The trust score is justified, not arbitrary
:::

:::tip This report is the deliverable, not a step towards it
Most AEs have never seen an honest inventory of their own pipeline data. Send this one to your manager on its own and watch what happens — "here is exactly what is wrong with my pipeline data and here is what I am fixing this week" is a very strong position to be in during a review.
:::

## Part 2 — The forecast model (6 min)

:::lab Step 2 — A model, not a screenshot of a model
```prompt
Produce `output/forecast-model.xlsx` from `pipeline-clean.csv`, with three tabs:

Tab "Data" — the cleaned rows. Freeze the header. Format amounts as currency, no decimals.

Tab "Model":
- Stage weightings in labelled, editable cells at the top: Discovery 20%, Qualification 30%, Proposal 50%, Negotiation 75%, Verbal 90%
- A weighted forecast that reads from Data using LIVE FORMULAS referencing those weighting cells — so I can change a weighting and watch the total move
- Totals by stage, by month of close date, and by owner
- Two scenario rows: "only deals with activity in the last 14 days" and "only deals with a recorded next step"

Tab "Exclusions" — every row not included in the main total, the opp_id, and why.

EDGES. No hard-coded totals anywhere a formula could be used. Do not include rows flagged as unmappable in the main forecast — put them in Exclusions and show their total separately. Never invent a weighting for a stage I did not list; flag it instead.
```

- [ ] The spreadsheet opens correctly
- [ ] I changed a stage weighting and the total moved
- [ ] The Exclusions tab is populated and the numbers add up
:::

:::warning The two-scenario rows are the honest part
"Weighted pipeline" is a comforting number. "Weighted pipeline, counting only deals with activity in the last fortnight" is often a much smaller and much truer one. Look at the gap between them. That gap is your real risk, and it is the number worth walking into a review with.
:::

## Part 3 — The deal review pack (7 min)

:::lab Step 3 — The document a manager actually reads
```prompt
BACKGROUND. My manager runs a weekly deal review. She has 15 minutes for my pipeline and asks the same two questions: what is at risk, and what are you doing about it. She hates pipeline dumps.

RESULT. `output/deal-review.md`, maximum two pages:

1. HEADLINE — one sentence. Where my pipeline stands and the single thing she should worry about
2. THE NUMBERS — a compact table: total, weighted, weighted-with-recent-activity, count by stage, and the change I cannot show (say so if the data has no history)
3. AT RISK — the five highest-risk deals. For each: account, amount, stage, the specific evidence of risk (quote the data), the likely cause, and one action with a date and an owner
4. MOVING WELL — the three deals I feel best about and the specific evidence for that confidence
5. NEEDS A DECISION — anything where I need her help, air cover, or a resource, stated as a request
6. DATA I AM FIXING — the hygiene items, with the ones I will fix this week and the ones I need help with
7. SLACK SUMMARY — four sentences, paste-ready

INPUTS. `pipeline-clean.csv`, `forecast-model.xlsx`, `hygiene-report.md`, and any call notes in `sales/`.

EDGES. Every risk assessment must cite the specific data that supports it — never "this deal feels stalled". Never invent an action I have not plausibly got the ability to take. Never state a number that is not in the model. Two pages maximum; cut section 4 before you exceed it.

FLAG: any deal where the data is too thin for me to assess honestly — I would rather say "I do not know" in the review than be caught out.
```

- [ ] Two pages, not six
- [ ] Every risk claim cites specific data
- [ ] The actions are things I could actually do
- [ ] Section 5 asks for something specific
:::

## Part 4 — Verify, then use it

:::lab The verification pass
- [ ] Trace three numbers from `deal-review.md` back to `forecast-model.xlsx` and then to a source row
- [ ] Check the total pipeline figure against your CRM's own reported number. If they differ, find out why **before** the review
- [ ] Read the "at risk" list. Do you agree? Where you disagree, that is your judgement adding value — note why
- [ ] Check that no deal is described as at-risk purely because of missing data rather than a real problem
:::

:::tip Where the CRM number and your model disagree
This happens more often than you would expect, and the reason is usually informative: a currency conversion, a filter on record type, deals owned by a departed rep, a stage the CRM counts as open and you do not. Finding that discrepancy in the lab is a gift. Finding it live in a review is not.
:::

## Make it repeatable

You now have a three-step chain — hygiene, model, review — that you will want every week.

- [ ] Save all three briefs together as one sequence
- [ ] Note the stage weightings your company actually uses, and hard-code them into your saved version
- [ ] Note your CRM's field names, so the next run does not need to guess
- [ ] Module 8 turns this into one Skill and one scheduled Friday job

## Reflect

Answer about your own work, not the practice data. Your answers save to your notebook in this browser.

```reflect
Which problem in your real pipeline data did the hygiene report show that you did not know about? What will you fix before your next deal review?
```

```reflect
Did your model's total match your CRM's own pipeline number? If not, what explained the gap, and what would you have said if your manager had asked first?
```

```quiz
Q: Why run the hygiene pass before any analysis?
- To reduce file size
+ Because an analysis of dirty data is a confident wrong answer, and much harder to spot than a visible gap
- Because connectors require clean data
- To make the spreadsheet load faster
> Know how much you can trust the data before you build conclusions on it.

Q: What is the value of a "weighted pipeline counting only deals with recent activity" scenario?
- It is a smaller number, which is more conservative
+ The gap between it and the headline weighted number is your real risk, and it is the honest figure to bring to a review
- It is required by most CRMs
- It excludes closed deals
> Two numbers side by side tell the truth that either alone conceals.

Q: The brief said "never assess a risk without citing the specific data that supports it". What does that prevent?
- Long documents
+ Risk assessments that are actually just plausible narrative — unfalsifiable, and indistinguishable from insight until they are wrong
- Connector errors
- Duplicate rows
> "This deal feels stalled" cannot be checked. "No activity in 34 days and the close date passed" can.

Q: Your model's total differs from the CRM's own reported pipeline number. What should you do?
- Trust the model; it is cleaner
+ Find out exactly why before the review — the cause is usually informative and being caught out live is expensive
- Use whichever number is higher
- Ignore it; small differences are normal
> Currency, record-type filters, departed reps, stage definitions. Find it in the lab, not in the meeting.
```

:::try Next
The last sales lab: outreach at volume, and the RFP that lands on a Thursday.
:::

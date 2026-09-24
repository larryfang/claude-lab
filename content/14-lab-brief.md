# Lab: Fix a Bad Brief

Fifteen minutes, and the most useful fifteen in the module. You are going to run a lazy brief, feel the disappointment, then run the same job properly and see the gap.

Do not skip Part 1. The contrast is the lesson.

:::warning Setup
Use the `Cowork-Lab` folder and the practice data you generated in Module 1. If you deleted it, go back and regenerate your lane's data — three minutes.
:::

## Part 1 — Run the lazy brief (4 min)

Give Cowork exactly this. Nothing more. Resist the urge to help it.

:::details 💼 Sales
```prompt
Look at my pipeline data and tell me how we are doing.
```
:::

:::details 📣 GTM
```prompt
Analyse the campaign data and tell me what is working.
```
:::

:::details 🧭 Product
```prompt
Read the customer interviews and tell me what we should build.
```
:::

:::details 🧾 Finance
```prompt
Look at the expense data and tell me how our spend is tracking.
```
:::

- [ ] I ran it and read the output

Now score what came back. Be honest:

- [ ] Did it name **which files** it used?
- [ ] Can I **verify a single number** in it without re-reading every source myself?
- [ ] Did it say anything about **missing or messy data**?
- [ ] Did it produce a **file**, or just text in the window?
- [ ] Would I forward this to my manager **as-is**?
- [ ] Does it tell me what to **do**, or only what it **saw**?

:::tip What usually happens
The output is articulate, generically structured, and unfalsifiable. It reads well. It resolves every ambiguity silently in whichever direction seemed most natural. Nothing is wrong with the model — you asked for a vibe and it gave you an excellent vibe.

Most people's real-world Cowork usage looks like Part 1 and they conclude the tool is overrated.
:::

## Part 2 — Rebuild it with B.R.I.E.F. (6 min)

Same job, same data, five elements. Copy your lane's brief.

:::details 💼 Sales — the real brief
```prompt
BACKGROUND. I am an AE with 14 open opportunities. My manager runs a deal review on Monday and asks two questions: which deals are at risk, and what am I doing about them. I need to walk in with answers, not a pipeline dump.

RESULT. Two files in `output/`:

`pipeline-clean.csv` — one row per opportunity: opp_id, account, stage (standardised), amount_usd (plain number), close_date (YYYY-MM-DD), owner, days_since_activity, next_step, risk_score (1–5), risk_reason, data_quality_flag.

`deal-review.md`, in this order:
1. Headline — the state of my pipeline in one sentence
2. Table: total pipeline, count and value by stage, weighted forecast (Discovery 20%, Proposal 50%, Negotiation 75%)
3. The three highest-risk deals — for each: the evidence, the risk, and one specific action with a date
4. Data hygiene — every opp_id needing a human fix, and what is wrong
5. A four-sentence Slack summary I can paste

INPUTS. Only the files in `sales/`. Do not use the web. Do not use anything outside that folder.

EDGES. Never estimate a missing value — write "not recorded". Risk scores must be justified by something in the data, not by intuition. Write only to `output/`; do not modify anything in `sales/`.

FLAG separately rather than deciding: any inconsistent stage name and how you normalised it; any row excluded from a total and why; anywhere two files contradict each other about the same account.

Show me your plan before you start.
```
:::

:::details 📣 GTM — the real brief
```prompt
BACKGROUND. I am a growth PMM. Our CMO wants to know where next quarter's budget should go, and she distrusts marketing dashboards because the numbers never reconcile. I need a readout that survives her scrutiny.

RESULT. Two files in `output/`:

`campaign-clean.csv` — the performance data with channel names normalised, dates as YYYY-MM-DD, and calculated columns: ctr, cost_per_mql, mql_to_sql_rate, sql_to_opp_rate, cost_per_opp, data_quality_flag.

`campaign-readout.md`, in this order:
1. Headline — one sentence on what the quarter actually shows
2. Channels ranked by cost per opportunity, as a table
3. Two best and two worst campaigns, each with the specific numbers that justify the call
4. Data integrity — every problem found, especially rows with zero spend and non-zero clicks, and what each one does to the conclusions
5. Three budget recommendations, each tied to a number in the table
6. "What this data cannot tell you" — the honest limits

INPUTS. Only the files in `gtm/`. Do not use the web.

EDGES. Never estimate a missing value — write "not recorded". Do not compute a rate from a zero denominator; mark it "n/a". Write only to `output/`.

FLAG separately rather than deciding: how you normalised each inconsistent channel name; any row excluded from any calculation and why; any metric where the sample is too small to trust.

Show me your plan before you start.
```
:::

:::details 🧭 Product — the real brief
```prompt
BACKGROUND. I am a PM on a reporting product. Six discovery calls and a ticket export are the evidence base for our Q4 focus, and I have to defend the choice in a leadership review where two directors already have competing preferred answers.

RESULT. Two files in `output/`:

`themes.csv` — one row per theme: theme, customer_count, customer_names, supporting_ticket_ids, arr_affected, confidence (high/medium/low), confidence_reason.

`discovery-report.md`, in this order:
1. The five strongest themes ranked by weight of evidence, each with two verbatim quotes attributed to customer and source file
2. What the support tickets confirm or contradict for each theme
3. Contradictions — anywhere two customers disagreed, with both quotes, unresolved
4. One low-frequency theme you think is strategically important, flagged separately with your reasoning labelled as inference
5. "What we still do not know" — the three questions for the next call

INPUTS. Only the files in `product/`. Do not use the web.

EDGES. Every claim needs a verbatim quote or a ticket ID. Label anything you inferred as "inference". Never estimate ARR or counts — write "not recorded". Write only to `output/`.

FLAG separately rather than deciding: tickets with a blank category and how you handled them; any theme where the evidence is thinner than the ranking implies; anywhere a single loud customer drove a theme.

Show me your plan before you start.
```
:::

:::details 🧾 Finance — the real brief
```prompt
BACKGROUND. I own spend reporting. Our CFO asks two questions at month end: where are we over budget, and can I trust these numbers. I need answers that survive both.

RESULT. Two files in `output/`:

`expenses-clean.csv` — the expense data cleaned: consistent category names, amounts as plain numbers, the duplicate row removed and noted, plus a data_quality_flag column (blank category, missing receipt, duplicate, or other).

`spend-review.md`, in this order:
1. Headline — the state of spend in one sentence
2. Table: spend by category vs budget from `budget.csv`, variance in USD and %, flagged where over
3. The card-statement charges that never made it into the expense file, called out with dates and amounts
4. Data hygiene — every row needing a human fix, with enough detail to fix it
5. A four-sentence Slack summary I can paste

INPUTS. Only the files in `finance/`. Do not use the web.

EDGES. Never estimate a missing value — write "not recorded". State row counts in and out for every total. Write only to `output/`; do not modify anything in `finance/`.

FLAG separately rather than deciding: how you normalised each inconsistent category; every row excluded from any total and why; anything on the card statement you could not explain.

Show me your plan before you start.
```
:::

- [ ] Cowork showed a plan and I **found at least one thing to change in it**
- [ ] Both files appeared in `output/`
- [ ] I read them properly

### Check your rewrite before you run it

Paste the brief you are about to run. The checker looks for a signal of each B.R.I.E.F. letter and for a few common wishes that pretend to be instructions. It cannot tell whether your brief is *good* — only whether a part is missing.

```brief-check
```

- [ ] My brief shows all five letters, and I fixed every warning that applied

## Part 3 — Compare, then verify (5 min)

Put the two outputs side by side.

- [ ] Part 2 produced **real files**; Part 1 produced text
- [ ] I can **trace a number** in Part 2 to a specific source row
- [ ] Part 2 told me about **data problems** Part 1 never mentioned
- [ ] Part 2 gives me **actions**, not observations
- [ ] Part 2 is something I would actually **send**

Now the verification pass, which you will do for the rest of your career:

:::lab The three-number trace
- [ ] Pick three numbers at random from the narrative file
- [ ] Find each one in the CSV
- [ ] Find each CSV value in the original source file
- [ ] Note anything that does not reconcile

- [ ] Compare the row count in the output CSV to the row count in the input
- [ ] Read the "flagged" section — did it surface things you had not noticed?
:::

:::tip If you found a discrepancy
Good. You have just proved the value of asking for the data artefact alongside the narrative. Now ask Cowork about it directly:

> "In `deal-review.md` you state the weighted forecast is [X]. Walk me through that calculation row by row from `pipeline-clean.csv` and tell me which rows you included and excluded."

Notice whether it corrects itself or defends the number. Both are informative.
:::

## Part 4 — Name the missing letter

Look back at your lazy brief from Part 1. Which B.R.I.E.F. elements were missing?

- [ ] **B**ackground — it did not know who I am or who this is for
- [ ] **R**esult — I never said what artefact I wanted
- [ ] **I**nputs — I never scoped the sources
- [ ] **E**dges — I set no rules, so it made its own
- [ ] **F**lag — I never asked it to surface anything, so it surfaced nothing

Usually the honest answer is "all five". That is the point.

:::concept The transferable skill
You did not learn a prompt. You learned that **output quality is a function of brief quality**, and that when a run disappoints, the fix is upstream. That reflex — *"which letter was missing?"* — is what you take to every job in this course.
:::

```quiz
Q: The lazy brief produced fluent, well-organised, unverifiable text. Why is that the dangerous outcome rather than an obviously bad one?
- It takes longer to read
+ Because it reads like finished work, so it passes a casual review and gets forwarded
- It uses more tokens
- It cannot be saved
> Confident, unfalsifiable output is worse than visibly broken output. Broken output gets fixed.

Q: What is the fastest single check on a numeric deliverable?
- Read it twice
+ Compare the output row count to the input row count, then trace three numbers back to source
- Ask Cowork if it is correct
- Reformat it as a table
> Row counts catch silent exclusions; random traces catch confident gaps. Both take a minute.

Q: A run disappoints. Where should you make the fix?
- In the output document
+ In the brief — so every future run improves, not just this one
- In the connector settings
- In the folder structure
> Briefs are reusable assets. Hand-edited documents are not.
```

:::try Module complete
That is your **🧠 Brief Writer** badge. Next: give Cowork access to your actual systems, so the data stops being practice data.
:::

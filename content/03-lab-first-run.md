# Lab: Your First Cowork Job

Eighteen minutes. At the end there is a finished file on your disk that you did not write.

The clever bit: **Cowork generates its own practice data first**, so you do not need to find any. Nothing here touches real customer information.

:::warning Where to run this
In the `Cowork-Lab` folder from the last lesson. If you skipped it, go back — one lesson, four minutes.
:::

## Part 1 — Make the mess (5 min)

Pick the block for your lane. Copy it into Cowork.

:::details 💼 Sales — generate a fake pipeline
```prompt
In the `sales/` subfolder, create realistic but entirely FICTIONAL practice data so I can learn on it. Invent all company names, people and numbers — do not use any real company.

Create:
- `opportunities.csv` with 14 rows and columns: opp_id, account, industry, employees, stage, amount_usd, close_date, owner, last_activity_date, next_step, competitor
  Make it deliberately messy: 3 rows with a blank next_step, 2 with a close_date already in the past, inconsistent stage names (e.g. "Negotiation", "negotiate", "Neg"), and one amount stored as "45,000" with a comma.
- Three short call-notes text files with untidy filenames (e.g. `notes acme call FINAL.txt`), each 6–10 lines of plausible discovery notes referencing accounts from the CSV.
- `email-thread.txt` — a 5-message thread with a stalled prospect.

Leave everything loose in `sales/`. Do not organise it.
```
:::

:::details 📣 GTM — generate a fake campaign set
```prompt
In the `gtm/` subfolder, create realistic but entirely FICTIONAL practice data so I can learn on it. Invent all product, company and channel names.

Create:
- `campaign-performance.csv` with 30 rows and columns: date, channel, campaign_name, spend_usd, impressions, clicks, mqls, sqls, opportunities
  Make it messy: two channels spelled inconsistently ("Paid Social" / "paid-social"), three rows with 0 spend but non-zero clicks, one date in a different format.
- Two competitor pages saved as text: `competitor-northwind-pricing.txt` and `competitor-vertex-homepage.txt`, each 15–20 lines of plausible marketing copy and pricing tiers.
- `customer-quotes.txt` — 12 short verbatim quotes from fictional customers, mixed positive and critical.
- `launch-brief-rough.txt` — a messy 12-line brain-dump for an upcoming feature launch.

Leave everything loose in `gtm/`. Do not organise it.
```
:::

:::details 🧭 Product — generate fake discovery material
```prompt
In the `product/` subfolder, create realistic but entirely FICTIONAL practice data so I can learn on it. Invent all customer names and quotes.

Create:
- Six interview transcript text files with untidy filenames (e.g. `call w Dana 3rd.txt`), each 25–40 lines of a plausible customer discovery conversation about a reporting/analytics product. Give them overlapping but not identical pain points, and make two customers contradict each other.
- `support-tickets.csv` with 25 rows: ticket_id, date, customer, tier, summary, category, resolution_days. Include four rows with a blank category.
- `feature-requests.csv` with 18 rows: request, requested_by, arr_usd, votes, source.
- `roadmap-notes.txt` — a messy set of half-formed roadmap ideas.

Leave everything loose in `product/`. Do not organise it.
```
:::

:::details 🧾 Finance — generate a fake spend ledger
```prompt
In the `finance/` subfolder, create realistic but entirely FICTIONAL practice data so I can learn on it. Invent all vendor names and numbers — do not use any real company.

Create:
- `expenses.csv` with 30 rows and columns: date, vendor, category, amount_usd, cost_centre, receipt_attached (y/n)
  Make it deliberately messy: categories spelled inconsistently ("Software" / "software" / "SaaS"), three rows with a blank category, two amounts stored with commas (e.g. "1,250"), one exact duplicate row, and four rows with receipt_attached = n.
- `budget.csv` with 8 rows: category, monthly_budget_usd — using the tidy category names.
- `card-statement.txt` — a 12-line corporate-card statement excerpt that includes two charges not present in expenses.csv.

Leave everything loose in `finance/`. Do not organise it.
```
:::

- [ ] Cowork created the files
- [ ] I opened the folder in Finder/Explorer and confirmed they are **really there**

:::tip Sit with that for a second
Claude did not *describe* files. It **created real files on your computer**. That is the whole difference. Everything else in this course is learning to aim it.
:::

## Part 2 — The real job (10 min)

Now the thing you would actually want done. Note the shape of these briefs: an **outcome**, named **sources**, a specified **format**, and a request for the **plan** first.

:::details 💼 Sales — the deal review pack
```prompt
Act as my sales operations analyst.

Using everything in `sales/`, produce two files in `output/`:

1. `pipeline-clean.csv` — the opportunity data cleaned: standardised stage names, amounts as plain numbers, dates as YYYY-MM-DD, plus two new columns: `days_since_activity` and `data_quality_flag` (what is missing or suspicious about that row).

2. `deal-review.md` — a deal review pack containing:
   - A summary table: total pipeline, count by stage, weighted value (assume Discovery 20%, Proposal 50%, Negotiation 75%, Closed Won 100%)
   - The 3 deals most at risk, with the specific evidence for each (stale activity, past close date, missing next step, competitor named)
   - For each at-risk deal, one concrete next action
   - A "data hygiene" section listing every row that needs a human to fix it, with the row's opp_id
   - A 4-sentence summary I could paste into Slack

Rules: use only the data in `sales/`. Where a number is missing, say "not recorded" — never estimate. Show me your plan before you start.
```
:::

:::details 📣 GTM — the campaign readout
```prompt
Act as my growth analyst.

Using everything in `gtm/`, produce two files in `output/`:

1. `campaign-clean.csv` — the performance data cleaned: consistent channel names, consistent date format, plus calculated columns for CTR, cost per MQL, MQL→SQL rate and SQL→Opp rate.

2. `campaign-readout.md` — an exec readout containing:
   - A headline: what happened, in one sentence
   - A table of channels ranked by cost per opportunity
   - The two best-performing and two worst-performing campaigns, with the numbers that justify each call
   - Every data quality problem you found, listed explicitly (the zero-spend-with-clicks rows especially) and what it means for the conclusions
   - Three recommendations, each tied to a specific number
   - A "what I cannot tell you from this data" section

Rules: use only the data in `gtm/`. Never estimate a missing number. Show me your plan before you start.
```
:::

:::details 🧭 Product — the discovery synthesis
```prompt
Act as my product research partner.

Using everything in `product/`, produce two files in `output/`:

1. `themes.csv` — one row per theme with columns: theme, customers_who_raised_it (count), customer_names, supporting_ticket_ids, total_arr_affected, confidence (high/medium/low and why).

2. `discovery-report.md` — a synthesis containing:
   - The 5 strongest themes ranked by evidence, each with 2 verbatim quotes attributed to the customer and source file
   - Any place where two customers **contradicted** each other — quote both sides, do not resolve it for me
   - A single theme raised by only one customer that you think is strategically important, flagged separately with your reasoning
   - What the support tickets confirm or contradict about the interview themes
   - A "what we still do not know" section with the three questions I should ask on the next call

Rules: every claim needs a quote or a ticket ID. If you infer something, label it "inference". Show me your plan before you start.
```
:::

:::details 🧾 Finance — the spend review
```prompt
Act as my FP&A analyst.

Using everything in `finance/`, produce two files in `output/`:

1. `expenses-clean.csv` — the expense data cleaned: consistent category names, amounts as plain numbers, the duplicate row removed and noted, plus a `data_quality_flag` column (blank category, missing receipt, or anything else suspicious about that row).

2. `spend-review.md` — a spend review containing:
   - A table of spend by category against `budget.csv`, with the variance and a flag on anything over budget
   - The two charges on the card statement that never made it into the expense file, called out explicitly
   - A "needs a human" section: every row with a missing receipt or blank category, listed with enough detail to fix
   - A 4-sentence summary I could paste into Slack

Rules: use only the data in `finance/`. Where a value is missing, say "not recorded" — never estimate. Show me your plan before you start.
```
:::

- [ ] Cowork showed me a **plan** before acting
- [ ] Both output files appeared in `output/`
- [ ] I opened them and read them properly

## Part 3 — Push it further (3 min)

One follow-up, to feel the range:

```prompt
Good. Now also produce a 6-slide PowerPoint in `output/` presenting this to leadership. Slide 1 is the headline and the single number that matters. Slides 2–5 are the substance with one chart or table each. Slide 6 is what you want from the room — decisions, not information.

Keep the speaker notes to three bullets a slide. Do not invent any number that is not in the files.
```

- [ ] A `.pptx` appeared and opens correctly
- [ ] The numbers in the deck match the numbers in the CSV

:::warning Now find a mistake
Seriously — go looking. Pick three numbers in the deck and trace each one back to a row in the source CSV. On practice data the stakes are zero, which makes it the perfect place to build the habit. Most first-time users find at least one thing that is subtly off: a rounded figure, a mis-attributed quote, a "total" that quietly excluded the blank rows.

Did you find one? Note what kind of error it was. That class of error is the one you will need to watch for in real work.
:::

## Reflect

You wrote **two briefs**. Claude planned, read a dozen files, cleaned data, calculated, wrote three deliverables in three formats, and put them where you asked.

:::concept The Cowork loop
> **Describe the outcome → read the plan → let it work → verify the deliverable → refine.**

Same loop as chat, operating on whole jobs instead of single messages. The skill you are building is not "prompting". It is **briefing** — and Module 2 is entirely about that.
:::

```reflect
What was the first mistake you found in your deliverable, and which instruction in the brief would have prevented it?
```

```reflect
Name one real job from your week that fits this loop. What would "done" look like, as two files?
```

:::lab Clean up (optional)
- [ ] Keep `Cowork-Lab` — later labs reuse it
- [ ] Or delete it entirely; nothing here was real
:::

```quiz
Q: Why did the lab have Cowork generate its own fake data first?
+ To create a safe, realistic mess to practise on — and to prove Cowork creates real files, not chat text
- Because Cowork cannot read existing files
- To use up quota
- To test your typing
> Self-contained, zero-risk, and it demonstrates real file creation immediately.

Q: All the lane briefs shared four features. Which set?
- Role, length, tone, deadline
+ A named outcome, named sources, a specified output format, and a request for the plan first
- A greeting, a role, a threat, and a thank-you
- Model choice, temperature, token limit, and seed
> That is the B.R.I.E.F. shape, which the next module names properly.

Q: The brief said "never estimate a missing number — say 'not recorded'". Why does that instruction matter so much?
- It makes the output shorter
+ Because a plausible invented number is far more dangerous than a visible gap — it survives review and reaches a customer
- It speeds up the run
- It reduces cost
> Missing data that announces itself is safe. Missing data that has been quietly filled in is how bad decisions get made.
```

:::try Module complete
That is your **🐣 Day One** badge. Next: the craft — how to write a brief that works first time.
:::

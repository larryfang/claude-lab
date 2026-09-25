# Brief Library — Sales · GTM · Product · Finance

Copy, paste, replace the `[BRACKETS]`. Every brief follows B.R.I.E.F. and asks for two artefacts.

:::tip Before you use these
Put your company's definitions in a Cowork **Project** (Module 8) and these get shorter, because the definitions stop needing repetition. Everything below assumes no Project, so it is self-contained.
:::

## Universal — works in any lane

### The ground-truth pass — run this first, always

```prompt
Before analysing anything, give me an honest inventory of the data. Produce `output/reality-check.md`:
1. The exact query or files used — sources, filters, date range, records matched, records returned
2. Every data quality problem, itemised with its record ID
3. Every record you would exclude from analysis, and why
4. Every place two sources disagree
5. Date coverage and any gaps
6. A trust score out of 10 with your reasoning
7. An honest statement of what this data can and cannot support a decision about

Do not begin any analysis. Never estimate a missing value — write "not recorded". Do not drop a record without listing it. State row count in and row count out.
```

### The verification audit

```prompt
Audit the deliverable you just produced. For every factual claim: the exact source (filename and row, or URL and date read), whether it is an observation or an inference, and your confidence.

Then list separately: every claim you cannot source; every number you rounded, derived, or estimated rather than read; every record excluded from any calculation and why; and every ambiguity you resolved without telling me.

Be exhaustive. I would rather have a long list than a clean-looking document.
```

### The red-team pass

```prompt
You are the person most motivated to find a problem with this document — a sceptical executive, the competitor it describes, or the customer whose words it quotes.

Find: every claim you would challenge and how; every number you would demand the working for; every place the conclusion does not follow from the evidence; the single most awkward question I could be asked about this; and the claim that would do most damage if it turned out to be wrong.

Quote the document directly. Be specific. Do not be constructive.
```

### The three-reviewer attack

```prompt
Produce three separate hostile reviews of this document. Do not be constructive.

REVIEW 1 — THE PRACTITIONER who has to act on it: what is ambiguous enough that you would do the wrong thing? What is missing? Where would you have to come back and ask a question?

REVIEW 2 — THE SCEPTICAL EXEC: why is this not worth doing? What is the opportunity cost? Which metric is vanity? What would you cut to halve the scope?

REVIEW 3 — THE CUSTOMER: does this actually solve your problem? What would still be annoying? What was misunderstood about your situation?

End with the single strongest objection across all three.
```

---

## 💼 Sales

### Pre-call brief

```prompt
BACKGROUND. I am an AE. I have a call with [ACCOUNT] on [DATE] with [NAME, TITLE]. We sell [ONE SENTENCE].

RESULT. `output/briefs/[account]-brief.md`, two pages maximum: (1) Snapshot — industry, size, HQ, what they do, in four lines. (2) Why now — trigger events with source and date. (3) What we already know — CRM history, past email, prior notes, each with its source named. (4) The people — who I am meeting, what they likely own, who else is in the buying group. (5) Likely pain — a hypothesis tied to specific evidence, labelled as a hypothesis. (6) Three questions specific to this account. (7) Risks and unknowns. (8) Sources with dates.

INPUTS. Our CRM record, my email with their domain, notes in `sales/` (or your `accounts/` folder if you keep one), their public website. Nothing else.

EDGES. Every factual claim needs a URL with the date read or a named file. Never invent a headcount, revenue figure, funding round, or named person. Do not draft or send any email. Read-only on the CRM.

FLAG: where our records and their public information disagree; any sign we have talked to them before and it went badly; anything I should verify before saying it out loud.

Show me your plan and the URLs you intend to visit first.
```

### Pipeline hygiene

```prompt
Produce `output/pipeline-clean.csv` — every opportunity with stage normalised, amount as a plain number, close date as YYYY-MM-DD, plus days_since_activity, days_to_close, risk_score 1-5, risk_reason, and data_quality_flags.

And `output/hygiene-report.md`: row count in and out; every stage-name variant and its mapping; every missing or malformed value by opp_id; every past close date on an open deal; every deal with no activity in 21 days; every deal with no next step; every duplicated account; a trust score out of 10 with reasoning.

Do not drop any row — flag it. Never estimate a missing value. Write only to `output/`.
```

### Deal review pack

```prompt
BACKGROUND. My manager has 15 minutes for my pipeline and asks two questions: what is at risk, and what am I doing about it. She hates pipeline dumps.

RESULT. `output/deal-review.md`, two pages: (1) Headline — one sentence. (2) The numbers — total, weighted [YOUR WEIGHTINGS], weighted-with-recent-activity, count by stage. (3) At risk — five deals, each with the specific data evidencing the risk and one action with a date. (4) Moving well — three, with the evidence. (5) Needs a decision — what I need from her, as requests. (6) Data I am fixing. (7) A four-sentence Slack summary.

EDGES. Every risk assessment must cite the specific data — never "this deal feels stalled". Never state a number not in the source. Two pages maximum.

FLAG: any deal too thin on data for me to assess honestly.
```

### Outreach sequence

```prompt
BACKGROUND. I am an AE at [COMPANY] selling [ONE SENTENCE]. Target list of accounts with no meaningful prior contact. I want a reply, not a booked meeting from a cold email.

RESULT. Per account in `output/outreach.md`: the recipient; THE HOOK — the one specific verifiable thing this email is built on, with its source; EMAIL 1 — subject under 45 characters, body under 110 words, one ask, no bullets, no "I hope this finds you well"; EMAIL 2 (day 4) under 70 words adding new value; EMAIL 3 (day 11) under 50 words making it easy to say no; CONFIDENCE that the hook is real and current.

Plus `output/outreach-log.csv`: account, recipient, title, hook, hook_source, hook_confidence, ready_to_send.

EDGES. Every hook sourced to a URL with a date or a named file. If there is no genuine specific hook, write "NO HOOK FOUND" and skip the emails — do not substitute industry commentary or flattery. Never invent a mutual connection, a shared event, a statistic about their business, or a customer of ours. Do not send anything.

FLAG: hooks older than six months; recipients who look mis-levelled; accounts where our records suggest a previous bad experience.
```

### RFP answer bank

```prompt
Produce `output/answer-bank.md` — from my past RFP responses, security documentation, trust centre pages and policy documents, extract every distinct question asked of us and the best available answer. Group by topic. For each: the canonical question, the answer, the source document and date, and a freshness flag (current / needs review / stale).

Never write an answer you cannot source to one of my documents. Where sources disagree, show both and flag the conflict. Do not soften or strengthen a claim from its source wording.

FLAG: every topic with no source at all, and every answer whose source is over 12 months old.
```

### Mutual action plan

```prompt
From the call notes in `[FILE]`, produce `output/[account]-map.md`: a mutual action plan table with Step, Owner (us or them, named), Due date, Dependency, Status. Include only steps actually discussed or clearly implied — do not invent milestones.

Flag separately anything left vague and anything with an owner on their side who was not on the call. Then draft a short email to the champion proposing the plan, with the vague items as explicit questions.
```

---

## 📣 GTM

### Messaging house

```prompt
BACKGROUND. PMM at [COMPANY]. Launching [FEATURE] to [AUDIENCE] on [DATE]. Our market position: [ONE SENTENCE].

RESULT. `output/messaging-house.md`: (1) The one-liner, under 15 words, no adjective that could apply to any product. (2) The problem in the customer's own words, sourced. (3) Three pillars — each with the claim, the proof, the source of that proof, and what a sceptic would say back. (4) Who this is for, with disqualifiers. (5) What we are NOT claiming. (6) The competitive frame — how we want this compared and how we do not. (7) Proof inventory — every piece of evidence with source and date. (8) Evidence gaps — every claim we cannot currently prove.

EDGES. Never write a proof point you cannot source to a file I gave you. Never invent a customer name, statistic, benchmark or case study. If a pillar has no proof, keep it and list it in section 8.

FLAG: pillars where the proof is weaker than the claim; contradictions in my own brief; anything legal would want to see.
```

### Launch kit from the messaging house

```prompt
The reviewed `output/messaging-house.md` is the source of truth. Produce in `output/launch-kit/`: `one-pager.md` (one page, 90-second read), `faq.md` (twenty questions including the six awkward ones about price, migration, security, limitations, timeline and what happens to the old way), `talk-track.md` (a 3-minute pitch as spoken words), `objections.md` (twelve objections with a response and the proof point each rests on), `demo-flow.md`, `internal-announcement.md` (under 250 words), `launch-checklist.md` (with owner and blocked-by columns), and `enablement-deck.pptx` (10 slides, three bullets of speaker notes each).

EDGES. Every claim must trace to the messaging house. Introduce no new claim, statistic, customer name or competitor comparison. Where an artefact needs an unsupported claim, write "[NEEDS PROOF: description]" and list it at the end of that file. Keep the one-liner byte-identical everywhere.

Produce `_consistency-check.md`: every [NEEDS PROOF]; every claim worded differently across artefacts; anything in the messaging house no artefact used.
```

### Competitor research

```prompt
BACKGROUND. PMM at [COMPANY]. We lose deals to [COMPETITOR] and I need accuracy before writing anything reps will say out loud.

RESULT. `output/[competitor]-research.md`. In every section, structure each item as OBSERVED (what the source says, with URL and date read) then INFERRED (my reading, labelled): (1) What they sell. (2) Pricing — only prices visible on a page; otherwise "not public". (3) Positioning, quoted. (4) Recent changes with dates. (5) What their customers say publicly, with links, positive and negative. (6) What their documentation reveals that marketing does not mention. (7) Where their own materials contradict each other. (8) What I could not find out.

EDGES. Every claim needs a URL and date, or a filename. Never state a price you did not see. Never describe an undocumented feature. Read-only — click nothing that submits, purchases, signs up or contacts them, and fill in no form. Do not use general knowledge of this company.

FLAG: anything that looks recently changed; internal contradictions; anything a rep should verify with a human first.

Show me your plan and the exact URL list before you start.
```

### Battlecard

```prompt
Reps have 90 seconds before a call. Produce `output/battlecard-[competitor].md`, ONE page: (1) In one line — who they are and when we lose. (2) Where we win — three points, each with proof, source, and the exact words a rep should use. (3) Where they win — three, honestly, each with what a rep should say instead of arguing. (4) Their likely attack — three things they will say about us and the true response. (5) Three fair trap questions. (6) Disqualifiers. (7) DO NOT SAY — unverified, stale, or legally risky claims. (8) Sources, freshness dates, and a check-again date.

Use only `output/[competitor]-research.md`. If the research does not support a point, write "[NO EVIDENCE]". Never state their price without a URL for it. Section 3 must be genuinely honest.
```

### Campaign readout

```prompt
BACKGROUND. My CMO has 10 minutes, distrusts marketing numbers, and will ask "how do you know that" about every claim. She wants a budget decision.

RESULT. `output/campaign-readout.md`, two pages: (1) Headline. (2) The numbers, with the prior period only if the data supports a comparison. (3) What worked — two, with the numbers and the sample size. (4) What did not — two, no hedging, no "learnings". (5) Data integrity — what is wrong, how much spend is affected, and what that does to confidence in sections 3 and 4. (6) Three recommendations, each with its number and the money involved. (7) What this data cannot tell you. (8) What I need.

EDGES. Every claim needs a number from the model, and every ranking claim needs its sample size stated. Never call a difference significant if the sample cannot support it. Never present cost-per-opportunity without noting excluded spend. Two pages maximum.
```

### Voice of customer

```prompt
Produce `output/voc.md` from the reviews, tickets and churn notes I have given you: (1) The ten themes with the most evidence, each with a count and three verbatim quotes attributed to source and date. (2) How each has changed over the last four quarters, if the data supports that. (3) The language customers actually use for each theme — their words, as a list, not ours. (4) Where our current positioning claims something customers do not confirm. (5) What churned customers said that current customers do not.

Every claim needs a quote and a source. Never aggregate a sentiment score you cannot show the working for. Flag any theme driven by fewer than four distinct customers, and any theme evidenced by only one source type.
```

---

## 🧭 Product

### Discovery synthesis

```prompt
BACKGROUND. PM on [PRODUCT], deciding [DECISION]. I present to a leadership review where two directors already have competing preferred answers.

RESULT. `output/themes.csv` — one row per theme: theme, customer_count, customer_names, source_files, supporting_ticket_ids, arr_affected, first_mentioned_date, confidence, confidence_reason.

And `output/discovery-report.md`: (1) What we heard — one honest paragraph. (2) The five strongest themes ranked by weight of evidence, each with the theme in the customer's language, who raised it, two verbatim quotes attributed to customer and file, what tickets confirm or contradict, and confidence with reasoning. (3) Contradictions — quote both sides, do NOT resolve, add one line on what it suggests about segmentation. (4) The quiet signal — one low-frequency theme that matters, reasoning labelled as inference. (5) What I assumed that is not supported. (6) What we still do not know — three questions and who to ask. (7) How to attack this report — the three strongest objections a sceptical director could raise.

EDGES. Every claim needs a verbatim quote or ticket ID. Never invent or paraphrase a quote — if you cannot quote it exactly, do not claim it. Never estimate ARR or counts. Rank by weight of evidence, not rhetorical force.

FLAG: themes driven by one loud customer; themes whose quotes are weaker than the ranking implies; quotes that could support two different themes.
```

### Evidence-backed PRD

```prompt
BACKGROUND. My brain-dump is in `[FILE]`. My evidence is in `[FILES]`. I need a PRD engineering can estimate.

RESULT. `output/prd.md`: (1) Problem — my statement tightened but NOT changed in meaning. (2) Evidence — the specific customer evidence, with quotes and IDs; if thin, say so plainly. (3) Who — user and buyer, plus the segments that do NOT have this problem. (4) Success — 3-5 measurable criteria, each with a baseline or "no baseline — must be instrumented first". (5) Scope — numbered requirements R1, R2… each with a source column citing its evidence. (6) Out of scope, and why. (7) User flow. (8) Edge cases — no data, too much data, permission failure, concurrent edit, partial failure, offline. (9) Dependencies. (10) Open questions, with who decides each. (11) Requirements with no evidence. (12) Where I may be wrong.

EDGES. Every requirement must cite evidence or appear in section 11. Never invent a metric, baseline, quote or technical constraint. Do not add a requirement I did not ask for — put it in section 10 as a question. Do not soften my problem statement.

FLAG: requirements that come from my assumptions rather than evidence; success metrics we cannot measure; anywhere the evidence supports a different solution.
```

### Tracker reality check

```prompt
Produce `output/tracker-reality.md`: (1) Scope — project, issue types, date range, issues matched. (2) What moved in 14 days — key, summary, from status, to status, date. (3) Every Done issue with no resolution date or an inconsistent resolution. (4) Every In Progress issue with no update in 10 days. (5) Every issue with no assignee or an inactive one. (6) Every passed due date not Done. (7) Every epic whose children do not match its stated status. (8) A trust assessment and what I should check with a human.

Read-only — do not modify, transition, comment on, or create any issue. Never infer that work is done because it looks done. Never estimate a completion percentage. State the exact query you ran.
```

### Three-audience stakeholder update

```prompt
Three audiences. My VP wants: on track, what is at risk, what do you need — 60 seconds, on a phone. My team wants: what shipped, what is stuck, what is next, and to feel seen. Customers and CS want: what is new in benefit terms, no jargon, no issue keys.

RESULT. `output/updates/exec-update.md` (under 200 words: one-line status with an honest RAG rating and its reason; shipped, three bullets in outcome terms; at risk with impact; what I need from you or "nothing this week"). `output/updates/team-update.md` (under 400 words: what shipped with people named; what is stuck and what would unstick it; what is next and who; one specific thing worth celebrating). `output/updates/customer-update.md` (under 300 words: what is new, benefit-first; any action required of them; what is coming, with no dates the tracker does not support).

EDGES. Never claim something shipped unless it is Done with a resolution date. Never state an unsupported date. Never describe stalled work as on track. The RAG rating must be justified by data. Anything that cannot be described as a customer benefit stays out of the customer update.

FLAG at the end of each file: what you were unsure about including, and what I should verify with the team.
```

### Backlog evidence

```prompt
Cross-reference the open issues in [PROJECT] against our support tickets and customer feedback. Produce `output/backlog-evidence.md`: (1) A table of every open issue with current priority, linked complaint count, ARR of affected accounts, and the date of the most recent complaint. (2) Every issue whose priority looks inconsistent with the evidence — both under- and over-prioritised — with the specific evidence. (3) Every issue with no customer evidence at all. (4) Every recurring customer complaint with no issue at all. List anything you could not match and why.

Do not change any priority. Do not create or edit issues. This is analysis, not action.
```

### Release notes and loop closing

```prompt
For everything moved to Done in [PROJECT] in the last [N] days, produce: `output/release-notes-customer.md` — benefit-first, no internal jargon, no issue keys; `output/release-notes-internal.md` — the full list with keys and technical detail; and `output/loop-closing.csv` — one row per customer who requested any of these: customer, contact, the request, the date they asked, the resolving issue, days elapsed, and a two-sentence personalised note referencing their original words.

Use only the tracker and our linked feedback records. Never claim we shipped something not marked Done. Never claim a customer requested something without a record of it. Leave the note empty and flag the row if you cannot find their original wording.

Then tell me how many resolved items had a linked customer request and how many did not.
```

---

## 🧾 Finance

### Month-end variance pack

```prompt
BACKGROUND. Month-end variance pack for leadership, from [BUDGET-VS-ACTUALS FILE] with line detail in [DETAIL FILE].

RESULT. `output/variance-pack.xlsx` — Data tab (cleaned source rows, variance_usd and variance_pct as live formulas), Summary tab (totals by category and cost centre, formulas only), Waterfall tab (budget to actual: five largest favourable, five largest unfavourable, an "all other" line so the bridge ties exactly). And `output/variance-commentary.md`, two pages: status line (rows in/used/excluded, OK or PROBLEM); the headline; the five variances that matter, each decomposed into volume, rate, timing or one-off with line-level evidence cited; a FLAGS section; "what I cannot tell you from this data".

EDGES. Never estimate a missing value — write "not recorded". Label every driver call evidence-based or hypothesis. State row counts on every total. No pasted values where a formula could be. Read-only on sources.

Show me your plan first.
```

### Three-way reconciliation

```prompt
Reconcile [INVOICES], [PAYMENTS] and [BANK STATEMENT]. Produce `output/reconciliation.xlsx`: Matched tab (three-way matches with the fee explaining any gross-to-net gap); Exceptions tab (one row per item that does not tie: type, the row ids from each file, financial impact, what a human should check first); Control tab (totals and counts proving Matched + Exceptions accounts for every row in all three files).

NEVER force a match. Plausible but not certain goes to Exceptions as suspected, with reasoning. Never estimate a missing value. Read-only on sources.
```

### Debtors chase drafts

```prompt
From [INVOICES FILE], find every open invoice past due and group: 1–30, 31–60, 61–90, 91+ days. Draft one chase email per customer in `output/chase-drafts/` — friendly, firm, escalation, final notice by bucket. Every draft states the exact invoice ids and amounts. Top of each draft: a DO NOT SEND line listing anything to verify first, including any customer appearing in the latest reconciliation exceptions.

Do not send anything. Do not connect to email. Drafts on disk only.
```

### The proofreading pass

```prompt
You are a proofreader with no stake in this being right. Sources: [THE DELIVERABLE] and [ITS SOURCE FILES]. For EVERY number: the number, where it appears, the exact source cell or line, MATCH or MISMATCH. For every non-numeric claim ("driven by", "one-off", "on track"): the evidence, or UNSUPPORTED. Produce `output/proofread-report.md` — mismatches and unsupported claims first, then the full trace table. Run this in a fresh session that did not build the deliverable.
```

---

## Scheduled-job wrapper

Add this to any brief you put on a schedule. Remember: cloud scheduled tasks run against your connectors and the files in your Claude account — create the schedule inside a Project saved to your account (made with Start from scratch), which holds the instructions and knowledge only — Cowork does not change a Project's contents. Write the report to a connected Google Drive, OneDrive or SharePoint folder (unblock only that connector's create-file tool), not to a local folder. After the second run, confirm it read the first run's file.

```prompt
Every [DAY] at [TIME].

Compare against the previous report file in [CONNECTED REPORT FOLDER] and report only the DELTA — what is newly a problem and what has been fixed. If there is no previous file, say "first run, no comparison available".

Start the file with a status line: date, records queried, records returned, and OK or PROBLEM.

If any source is unreachable, returns zero records, or anything else prevents a normal run: still write the file, put PROBLEM in the status line, state exactly what failed, and write nothing else. Never write a normal-looking report from missing data.

If nothing needs attention, write "Nothing needs attention this week" plus the status line, and stop. Do not pad the file.

Read-only on every source system. Write only the report file, nothing else.
```

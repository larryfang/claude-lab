# The Skill Library — One per Function

You built *your* Skill in the last lab. This lesson hands you a starting Skill for **each function** — Sales, Marketing/GTM, Product, Finance — written in this course's house style: definitions first, artefacts always, rules from real corrections.

They are deliberately not finished. Each has `[BRACKETS]` where your company's specifics go, because **the definitions section is the value** — a Skill with generic definitions produces generic output, which is exactly what you already had without it.

:::concept Two ways to get these installed
**Path 1 — upload the file.** Save the skill as `SKILL.md` in a folder named after it, zip the folder, then **Customize → Skills → + → Create skill → Upload a skill** ([how to create custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)). The description field is capped at 200 characters, and it is how Claude decides when the skill fires — spend your best minute there.

**Path 2 — have Claude build it.** In a Cowork session, ask Claude to create the skill: it interviews you (what the job is, when it should trigger, what good output looks like) and produces the installable folder. Later you can say *"add a step that…"* and it updates the skill in place ([same guide](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)). Paste any template below as the starting point for that interview.

(There is also a third path for workflows easier to show than describe — **Record a skill**, Mac-only — covered in the lab lesson before this one.)
:::

## How they run: automatically, or as a slash command

Skills **fire on their own** when your request matches the description — that is the main path, and the cold test from the last lab proves it works. But every installed skill is also an explicit command: type **`/`** in Cowork and your skills appear as `/skill-name` — Cowork sessions run on the same engine as Claude Code, where skills and slash commands are one mechanism ([slash-commands docs](https://code.claude.com/docs/en/slash-commands)). Plugin skills namespace by function, like `/sales:call-prep` ([knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins)).

Explicit invocation is the right choice when the job has **side effects** or you want a guaranteed, exact run — `/variance-pack` on close day, not "hey, do the variance thing".

:::tip Plugin first, custom second — same rule as the lanes
Anthropic open-sourced complete plugins for **eleven functions** — sales, marketing, finance, product, legal and more — installable from the marketplace that ships enabled by default: **Customize → Plugins → Browse plugins** ([use plugins in Claude](https://support.claude.com/en/articles/13837440-use-plugins-in-claude) · [source](https://github.com/anthropics/knowledge-work-plugins)). Even better: select an installed plugin and hit **Customize** — Claude opens a session, inspects your connected tools, interviews you, and rewrites the plugin's skills for *your* stack ([Academy tutorial](https://academy.claude.com/tutorials/how-to-customize-plugins-in-cowork)).

So before adapting a template below, check whether the official plugin for your function already covers the job. The templates earn their keep where the plugin misses your standards — or where you want to *understand* what a good skill contains, which is the point of this lesson.
:::

## The library

Open your lane. Adapt the definitions before anything else.

:::details 💼 Sales — account-brief
The pre-call brief from Lab 4, permanently. (The other strong sales Skill, `deal-review`, is written out in full in the Skills lesson — steal it from there.)

```text
---
name: account-brief
description: >-
  Use when the user asks for an account brief, pre-call brief, call prep,
  meeting prep for a customer, or account research. Produces a one-page
  brief and an evidence appendix before a customer conversation.
---

# Account Brief

## Our definitions — use these, do not re-derive them
- Segments: [YOURS — e.g. Enterprise = 1,000+ seats, Mid-market = 100–999]
- A "warm thread" = any email or meeting with the account in the last 30 days
- Competitors we track: [LIST]
- Our current plays: [e.g. multi-product expansion, renewal-plus-uplift]

## Sources, in priority order
1. CRM record and open opportunities (connector)
2. Email and calendar history with the account (connector)
3. The `accounts/` folder notes
4. The live web for news — last 90 days only, cite every claim

## Always produce two artefacts
1. output/[account]-brief.md — one page: Where we stand, What changed
   recently, Their likely agenda, Landmines, Three questions to ask,
   The one thing to achieve in this meeting
2. output/[account]-evidence.md — every claim in the brief with its
   source: the CRM field, the email date, the URL

## Rules
- Never state a fact without a source I can click or check.
- Separate "what the data says" from "what I infer" — label inferences.
- If CRM and email disagree (stage says Negotiation, no contact in 40
  days), flag the contradiction. Do not smooth it over.
- Read-only on every connector. Draft nothing, send nothing, update nothing.

## Flag separately
- Data older than 90 days that the brief relies on
- Anything unsafe to say in front of the customer
```
:::

:::details 📣 Marketing / GTM — campaign-readout
The funnel story from Lab 4 of the GTM lane, with the reconciliation rule that makes marketing numbers survive a CRO's questions.

```text
---
name: campaign-readout
description: >-
  Use when the user asks for a campaign readout, campaign report, funnel
  story, channel performance review, or marketing QBR input. Produces a
  metrics file and a narrative readout with every claim tied to data.
---

# Campaign Readout

## Our definitions — use these, do not re-derive them
- Funnel stages and owners: [MQL = …, SQL = …, and which system owns each]
- Attribution model: [YOURS — and never blend two models in one table]
- "Working" = [YOUR THRESHOLDS — e.g. CAC payback < 12 months, MQL→SQL > 15%]
- Reporting currency and date convention: [X]

## Always produce two artefacts
1. output/campaign-metrics.csv — one row per campaign/channel: spend,
   MQLs, SQLs, opportunities created, pipeline $, closed-won $, plus a
   data_quality column
2. output/campaign-readout.md — two pages max: Headline, What worked
   (with the numbers), What did not (with the numbers), What we cannot
   tell from this data, Recommended next bets

## Rules
- Marketing-sourced pipeline must reconcile to CRM opportunity records.
  State both numbers and the gap — never just ours.
- No adjective without a number. "Strong performance" needs the metric.
- State the attribution model used, in the document.
- Read-only on all sources.

## Flag separately
- Campaigns with spend but no trackable outcome
- Any metric where two systems disagree, with both values shown
```
:::

:::details 🧭 Product — stakeholder-update
The tracker-to-update fan-out from Lab 3 of the product lane — including the sequencing-principles rule, because without it the update invents a plausible-sounding rationale that is not yours.

```text
---
name: stakeholder-update
description: >-
  Use when the user asks for a stakeholder update, roadmap update, status
  update for execs, sales or customers, or a "where are we" summary from
  the tracker. Produces audience-specific updates from live tracker data.
---

# Stakeholder Update

## Our definitions — use these, do not re-derive them
- Tracker: [Jira project KEY / Linear team]; statuses meaning "active": [LIST]
- "Stalled" = In Progress with no update in [14] days. Never report it on track.
- Our sequencing principles: [DEPENDENCIES, CAPACITY, STRATEGIC BETS — yours]
- Audiences: execs (outcomes + risks), sales (dates + customer-safe wording),
  team (full detail + blockers)

## Always produce three artefacts
1. output/update-exec.md — half a page: shipped, slipped, at risk,
   decisions needed
2. output/update-sales.md — what changed for customers, safe-to-share
   dates, what NOT to promise
3. output/update-team.md — full detail, with tracker links

## Rules
- Every status claim cites the tracker item and its last-updated date.
- Stalled items are reported as stalled, with days since last update.
- Any "why this order" statement uses my sequencing principles above —
  never an invented rationale.
- A date is a commitment only if the tracker says so; otherwise "targeting".
- Read-only on the tracker.

## Flag separately
- Items whose status contradicts their recent activity
- Anything I am asked about that is not in the tracker at all
```
:::

:::details 🧾 Finance — variance-pack
Close week from Lab 1 of the finance lane, as a permanent asset — exact dollars, no softened language, a bridge that ties.

```text
---
name: variance-pack
description: >-
  Use when the user asks for a variance pack, budget vs actuals, month-end
  variance commentary, or close-week variance analysis. Produces a
  live-formula workbook and CFO-ready commentary with exact figures.
---

# Variance Pack

## Our definitions — use these, do not re-derive them
- Materiality: variances over [$X or Y%] get commentary; below, table only
- Account groupings: [YOUR ROLLUPS — which GL accounts roll to which line]
- Currency: [X]. Exact amounts in commentary — never round.
- "Explained" = tied to a driver with evidence. Anything else is "unexplained".

## Always produce two artefacts
1. output/variance-model.xlsx — tabs Data / Variance / Bridge. Live
   formulas only, never pasted values. The bridge ties to the summary
   total exactly.
2. output/variance-commentary.md — one page: The month in three
   sentences, Material variances (driver, evidence-based or hypothesis,
   owner), FLAGS, "What I cannot tell you from this data"

## Rules
- Never estimate a missing value — write "not recorded".
- Label every driver call as evidence-based or hypothesis.
- State row counts in and out for every total.
- A miss is a miss, not a "timing nuance" — unless the evidence shows timing.
- Read-only on source files; write only to output/.

## Flag separately
- Every excluded row, and why
- Anywhere the detail file and the summary disagree
```
:::

## Make them yours — the 15-minute adaptation

:::lab Adapt one now
- [ ] Copy your function's template into a Cowork session
- [ ] Fill every `[BRACKET]` — real segments, real thresholds, real project keys
- [ ] Ask: *"Read this SKILL.md as a new colleague — what would you not know, and what did I assume?"* (the colleague test from the last lab)
- [ ] Install it, then run the **cold test**: ask in natural language, no brief
- [ ] Run it once more as an explicit `/skill-name` and confirm both paths work
:::

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: Why do the templates ship with `[BRACKETS]`?
A: The definitions section is the value. Generic definitions produce generic output, which is what you already had without the Skill.

Q: What are the two ways to get a Skill installed?
A: **Upload the file**: zip the Skill's folder and upload it. Or **have Claude build it**: it interviews you in a Cowork session and produces the installable folder.

Q: When is `/skill-name` better than letting a Skill auto-fire?
A: When the job has side effects, or you want a guaranteed, exact run: `/variance-pack` on close day, not "hey, do the variance thing".

Q: What should you check before adapting a template?
A: Whether the official plugin for your function already covers the job. The templates earn their keep where the plugin misses your standards.

Q: What does the plugin **Customize** flow do?
A: Claude opens a session, inspects your connected tools, interviews you, and rewrites the plugin's skills for your stack.

Q: What is the cold test?
A: Install the Skill, then ask for the job in natural language, with no brief. It proves the Skill fires on its own from its description.
```

```quiz
Q: Why do the templates ship with [BRACKETS] instead of finished definitions?
- To make them shorter
+ Because the definitions section is where the value lives — generic definitions produce the generic output you already had
- Skills require brackets
- To avoid copyright issues
> Stage weightings, thresholds, project keys, sequencing principles: those are yours, and they are the whole point.

Q: When is explicit /skill-name invocation better than letting the skill auto-fire?
+ When the job has side effects or must run exactly and predictably — like /variance-pack on close day
- Always; auto-fire is unreliable
- Never; slash commands are for developers
- Only on Enterprise plans
> Auto-fire is the everyday path and the cold test proves it. Explicit invocation is for deliberate, exact runs.

Q: Before adapting a template, what should you check first?
+ Whether the official plugin for your function already covers the job — then customise where it misses your standards
- Whether you have admin rights
- Whether your teammates approve
- Nothing; always build custom
> Anthropic ships open-source plugins for eleven functions, and the Customize flow rewrites them for your stack.
```

:::try Next
A skill that runs every week without you asking is a schedule away.
:::

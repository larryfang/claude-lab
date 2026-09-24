# The Product Plays

PM work splits cleanly into two categories, and Cowork is transformative for one and dangerous for the other.

:::concept The split
**Synthesis** — reading a lot of things and producing a coherent account of what they say. Interview transcripts, tickets, feedback, tracker data, competitor changelogs. This is most of the volume of PM work, most of what gets skipped, and exactly what Cowork excels at.

**Judgement** — deciding what to build, what to cut, what to tell an executive, whose problem to solve first. This is the actual job, it is what you are accountable for, and Cowork must not do it for you.

The failure mode is not Cowork doing judgement badly. It is that Cowork's synthesis is so fluent that a prioritisation it generated *reads* like a decision you made.
:::

## Play 1 — Discovery synthesis · the highest-value play

**The job:** eight interviews become a themed, quote-backed insight report you can defend in a review.

**Why it matters:** most discovery is under-synthesised. Recordings pile up, one or two vivid quotes get remembered, and the decision gets made on the loudest customer rather than the weight of evidence.

**The critical instruction:** *"Every claim needs a verbatim quote and its source. Where two customers contradicted each other, quote both and do not resolve it."* Contradiction is signal — usually about segmentation — and a synthesis that smooths it away has destroyed the most useful thing in the data.

**Lab 1 builds this.**

## Play 2 — The evidence-backed PRD

**The job:** a spec where every requirement traces to a piece of evidence.

**Why it works:** PRD structure is stable, so the writing is mechanical. The valuable part is the traceability — and then having Cowork attack its own document.

**The rule:** you write the problem statement and the decisions. Cowork writes the structure, the evidence links, the edge cases, and the open questions. If you find yourself accepting a scope decision because it appeared in a generated PRD, stop.

**Lab 2 builds this.**

## Play 3 — Stakeholder updates from the tracker

**The job:** the weekly update, in three versions, for three audiences who want different things.

**Why it works:** the data is structured, the audiences are stable, and it is the task PMs most reliably skip when busy — which is exactly when stakeholders most need it.

**Lab 3 builds this.**

## Play 4 — Backlog triage and evidence linking

**The job:** connect the backlog to the customer evidence, so priority arguments become checkable.

```prompt
Cross-reference the open issues in [PROJECT] against our support tickets and customer feedback. Produce `output/backlog-evidence.md`: (1) a table of every open issue with its current priority, the count of linked customer complaints, the ARR of affected accounts, and the date of the most recent complaint; (2) every issue whose priority looks inconsistent with the evidence — both under- and over-prioritised — with the specific evidence for each; (3) every issue with no customer evidence at all; (4) every recurring customer complaint with no issue at all. List anything you could not match and why.

Do not change any priority. Do not create or edit issues. This is analysis, not action.
```

Section 4 — **complaints with no issue** — is the one that finds the real gaps. It is the work nobody has time to do.

## Play 5 — Competitive and market changelog watching

**The job:** knowing when a competitor shipped something relevant, without checking manually.

**Why it works:** public changelogs and release notes are structured and boring, which makes them ideal for a schedule.

```prompt
Every Monday: read the public changelogs and release notes for [COMPETITORS] and compare against the snapshots in `snapshots/`. Write `output/competitor-changelog-YYYY-MM-DD.md` covering only what is new, with a quote and URL for each item, and for each: which of our roadmap items it relates to, and whether it closes or widens a gap. Save fresh snapshots. If nothing shipped, say so in one line. Never infer a release you cannot show with quoted text.
```

## Play 6 — Release notes and the feedback loop

**The job:** close the loop — the customer who asked for something in March should hear about it when it ships.

**Why it works:** the mapping from shipped issues back to the customers who requested them is pure data work, and almost nobody does it.

```prompt
For everything that moved to Done in [PROJECT] in the last two weeks, produce three files: `output/release-notes-customer.md` — customer-facing notes, benefit-first, no internal jargon, no issue keys; `output/release-notes-internal.md` — the full list with keys and technical detail; and `output/loop-closing.csv` — one row per customer who requested any of these items: customer, contact, the request, the date they asked, the issue that resolved it, and a two-sentence personalised note they could be sent.

Use only the tracker data and our linked feedback records. Never claim we shipped something that is not marked Done. Flag any Done item you could not describe as a customer benefit — those are usually internal work that should not appear in customer notes.
```

## The judgement calls Cowork must never make

Write these on something you will see:

- **What to build next.** It can rank by evidence weight. It cannot know your strategy, your technical debt, your team's capacity, or the deal that closes if you ship a specific thing.
- **What a metric means.** A retention dip has ten possible causes. Cowork will confidently pick one.
- **What to tell an executive.** It can draft. What you emphasise, what you flag early, and what you take responsibility for is your job.
- **Whose problem matters most.** Three customers want three different things. Choosing is the job.
- **Whether the evidence is enough.** It will produce a confident report from six interviews. Whether six is enough for this decision is your call.

:::warning The specific PM failure mode
A generated roadmap looks exactly like a considered roadmap. Same headings, same rationale-shaped paragraphs, same confident tone. Six weeks later someone asks why item three is above item four and the honest answer is "because it appeared in that order".

The defence is simple and you must actually do it: **make the evidence traceable and then form your own view.** If you cannot explain a ranking without re-reading the document that produced it, it is not your ranking.
:::

:::tip Plugin first, custom second
Anthropic ships an official **Product Management plugin** (availability varies by plan — look under **Customize → Plugins**): `/write-spec` for PRDs, `/roadmap-update` in Now/Next/Later, quarterly or OKR formats, `/stakeholder-update`, `/synthesize-research`, `/competitive-brief` and `/metrics-review`. Install it and run the commands on your own material — then use the labs here to understand what a good version does, and customise where the ready-made one misses your evidence standards.

Anthropic's own PMs go one step further: they **stack plugins** — productivity (calendar and personal context) + data (live analytics) + sales (customer calls and tickets) + product (PRD structure) in one session — so *"PRDs get written from real data and customer context… The PM's job shifts from gathering to deciding"* ([deployment guide](https://claude.com/blog/new-guide-deploying-claude-across-the-enterprise-with-claude-cowork)).
:::

## Pick your play

- [ ] Which of these six do I do worst because there is never time?
- [ ] Which do I do at all, but a week later than I should?
- [ ] Which one, if it happened automatically every Monday, would change my stakeholders' opinion of me?

That last one goes on a schedule in Module 8.

## Make the call

Choose what you would do, read the consequence, then try the other options.

```scenario
S: Cowork's synthesis of six discovery interviews ranks one theme clearly first. You present your recommendation tomorrow.
Q: What do you do before you present?
+ Trace the top theme's quotes to their sources, decide whether six interviews are enough for this decision, and form your own view of the ranking.
> Whether the evidence is enough is your call. A ranking you can explain without re-reading the document is one you can defend.
~ Check that the quotes are real, then present the ranking as written.
> The evidence is now traceable, but the ranking is still the document's. When someone asks why item one beats item two, the honest answer is "it appeared in that order".
- Present the ranking. The report is well argued and every theme has quotes.
> Fluent synthesis reads like a decision you made. Cowork will produce a confident report from six interviews; nobody asked whether six was enough.

S: Your backlog-evidence report flags a low-priority issue as under-prioritised: many linked complaints, from large accounts.
Q: What do you do?
+ Treat it as evidence, weigh it against your strategy, capacity and technical debt, and make the priority call yourself.
> Cowork can rank by evidence weight. It cannot know your strategy, your team's capacity, or the deal that closes if you ship a specific thing.
~ Raise the priority because the evidence is strong, and say the report recommended it.
> The evidence may well be right, but the decision now belongs to the report. If "the analysis said so" is your only reason, it is not your call.
- Ask Cowork to change the priority in the tracker so the backlog matches the evidence.
> The brief says it plainly: do not change any priority, do not create or edit issues. This is analysis, not action, and what to build next is your job.
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What is the split in PM work?
A: **Synthesis** — reading many sources and reporting what they say — is Cowork's strength. **Judgement** — what to build, cut, and tell an executive — stays yours.

Q: What is the real PM failure mode with Cowork?
A: Not bad judgement from Cowork. Its synthesis is so fluent that a prioritisation it generated *reads* like a decision you made.

Q: What is the critical instruction in a discovery synthesis brief?
A: "Every claim needs a verbatim quote and its source. Where two customers contradicted each other, quote both and do not resolve it."

Q: In an evidence-backed PRD, what do you write yourself?
A: The problem statement and the decisions. Cowork writes the structure, the evidence links, the edge cases and the open questions.

Q: Name three judgement calls Cowork must never make.
A: Any three of: what to build next, what a metric means, what to tell an executive, whose problem matters most, whether the evidence is enough.

Q: How do you defend against a generated roadmap?
A: **Make the evidence traceable, then form your own view.** If you cannot explain a ranking without re-reading the document, it is not your ranking.
```

```quiz
Q: What is the correct division of labour between you and Cowork in PM work?
- Cowork drafts, you approve
+ Cowork does synthesis — reading many sources and reporting faithfully. You do judgement — what to build, cut, emphasise, and take responsibility for
- You do research, Cowork writes
- Cowork handles everything except customer contact
> Synthesis is volume work and it is where the leverage is. Judgement is the job.

Q: Two customers contradicted each other in discovery. What should the synthesis do?
- Resolve it in favour of the larger account
+ Quote both and leave it unresolved — contradiction is signal, usually about segmentation
- Exclude both as unreliable
- Average the positions
> A synthesis that smooths away contradiction has destroyed the most useful thing in the data.

Q: In a backlog-evidence analysis, which section finds the real gaps?
- Issues with the highest complaint counts
+ Recurring customer complaints that have no issue at all
- Issues with no customer evidence
- The priority mismatches
> Nobody has time to look for the missing tickets. That is exactly why they are missing.

Q: Why is a generated roadmap ranking specifically dangerous?
- It is usually wrong
+ It looks identical to a considered ranking, so six weeks later the real reason for the order is "it appeared that way"
- It cannot be edited
- Stakeholders distrust AI output
> Make the evidence traceable, then form your own view. If you cannot explain the ranking, it is not yours.
```

:::try Next
Discovery synthesis — the highest-value play in the lane.
:::

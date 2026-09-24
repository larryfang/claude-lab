# The GTM Plays

GTM work has a structural problem: the volume of artefacts required for a launch is roughly constant regardless of how many people you have, and it is always more than you have time for. So things get cut — usually the enablement, always the FAQ, often the honest retrospective.

Cowork changes the economics of artefact production. It does not change the economics of judgement, and confusing the two is the main way this goes wrong in this lane.

## Play 1 — The launch kit

**The job:** messaging house, one-pager, FAQ, sales script, objection handling, enablement deck, internal announcement, and a launch checklist. Eight artefacts that must all say the same thing.

**Why Cowork is unusually good at it:** the hard part of a launch kit is not writing any one artefact — it is **consistency across all of them**. When the one-pager, the sales script and the FAQ drift apart, reps say three different things. Generating them together from a single messaging foundation is exactly how to prevent that.

**Lab 1 builds this.**

## Play 2 — Competitive battlecards

**The job:** what they claim, what they actually do, where we win, where we lose, and what a rep should say.

**Why it works:** it is a research-and-synthesis job across many public sources with a very specific output format.

**Why it is the most dangerous play in this lane:** a battlecard is a document whose entire purpose is to be repeated out loud, by someone who was not in the room when it was written, to the person best placed to contradict it. Every made-up detail eventually becomes a rep being corrected by a prospect.

**Lab 2 builds this, with a stress-test pass.**

## Play 3 — Campaign readouts

**The job:** turn channel data into an honest story about what worked, what did not, and where the budget should go.

**Why it works:** the analysis is mechanical and the narrative structure is stable. What makes an AI readout better than a dashboard is that it can be made to state its own limitations.

**The part that matters:** ask for the data problems and the "what this cannot tell you" section. A readout that admits its attribution is unreliable is more useful — and much more credible with a sceptical CMO — than one that does not.

**Lab 3 builds this.**

## Play 4 — Voice of customer synthesis

**The job:** across reviews, support tickets, sales call notes, churn interviews and NPS comments — what are customers actually saying?

**Why it works:** the volume is genuinely beyond a human, the sources are unstructured, and the output is the evidence base for positioning.

```prompt
Using the review exports in `reviews/`, the support tickets in `tickets.csv`, and the churn interview notes in `churn/`, produce `output/voc.md`: (1) the ten themes with the most evidence, each with a count and three verbatim quotes attributed to source and date, (2) how each theme has changed over the last four quarters if the data supports that, (3) the language customers actually use for each theme, as a list of their words not ours, (4) where our current positioning claims something customers do not confirm, and (5) what churned customers said that current customers do not.

Every claim needs a quote and a source. Never aggregate a sentiment score you cannot show the working for. Flag any theme driven by fewer than four distinct customers, and any theme where the evidence is only from one source type.
```

Section 3 is the sleeper. **The words customers actually use** is the most directly usable output in this list — it goes straight into your copy, your SEO, and your sales scripts.

## Play 5 — Enablement that gets used

**The job:** the training material, the certification quiz, the call script, the demo narrative.

**Why it works:** enablement is high-volume derivative work from a source of truth you already have.

```prompt
From `output/messaging-house.md` and `output/battlecard-northwind.md`, produce an enablement pack in `output/enablement/`: (1) `talk-track.md` — a 3-minute pitch as spoken words, not bullets, (2) `objections.md` — the twelve objections a rep will actually hear with a response each, sourced to something real, (3) `discovery-questions.md` — fifteen questions that qualify for this product specifically, (4) `certification.md` — a twenty-question quiz with an answer key, where every answer is findable in the source documents, (5) `demo-flow.md` — the demo narrative in the order that makes the value obvious.

Keep every artefact consistent with the messaging house. Where the source documents do not support a claim, leave it out and list it under "gaps in our own messaging".
```

That final instruction turns an enablement exercise into a messaging audit. The gaps it finds are usually real.

## Play 6 — Competitive and market monitoring

**The job:** knowing when a competitor changed their pricing, positioning or packaging, without checking manually.

**Why it works:** it is repetitive, low-judgement, and perfectly suited to a schedule. Module 8.

```prompt
Every Monday at 8am: visit the pricing and product pages of [COMPETITOR LIST], compare each against the saved snapshot in `snapshots/`, and write `output/competitive-watch-YYYY-MM-DD.md` listing only what changed, with before-and-after quotes and the URLs. Save fresh snapshots. If nothing changed, say so in one line. Never infer a change you cannot show with quoted text from both versions.
```

## The two places GTM must not trust Cowork

**1. Positioning strategy.** Cowork can synthesise every input to a positioning decision — the customer language, the competitive gaps, the win/loss patterns. It cannot decide who you are choosing not to serve. That is a strategy call with consequences, and it needs a human who will own it.

**2. Anything competitive that is customer-facing.** Comparison pages, competitor claims, "unlike vendor X" language. The legal and credibility exposure is real, the sources go stale fast, and the person you are describing is highly motivated to find the error. Draft with Cowork, verify every claim against a dated source, get a human sign-off.

:::warning The consistency trap
Cowork's greatest strength in GTM is that it makes all eight launch artefacts say the same thing. That is also the risk: if the messaging foundation is wrong, it is now wrong in eight places, expressed fluently, and it looks deliberate.

Get one human to argue with the messaging house **before** generating anything from it. That review is the highest-leverage thirty minutes in the whole launch.
:::

:::tip Plugin first, custom second
Anthropic ships an official **Marketing plugin** (availability varies by plan — look under **Customize → Plugins**): `/campaign-plan`, `/draft-content`, `/brand-review` against your uploaded style guide, `/competitive-brief`, `/performance-report`, `/email-sequence` and `/seo-audit`. Install it and run the commands on your own material — then use the labs here to understand what a good version does, and customise where the ready-made one misses your voice and definitions.
:::

## Make the call

Choose what you would do, read the consequence, then try the other options.

```scenario
S: Your launch is in two weeks. Cowork has written the messaging house, and you want to generate all eight launch artefacts from it this afternoon.
Q: What do you do next?
+ Get one human to argue with the messaging house first, fix what they find, then generate the kit.
> That review is the highest-leverage thirty minutes in the whole launch. Every artefact inherits the foundation, so one fix now saves eight fixes later.
~ Generate the kit now, and ask a colleague to review all eight artefacts at the end.
> A review still happens, but a flaw in the foundation is now in eight fluent documents, and it looks deliberate. That is slower to find and harder to fix.
- Generate the kit and ship it. All eight artefacts agree with each other, so they must be right.
> Consistency is not correctness. If the messaging house is wrong, it is now wrong in eight places at once.

S: Your head of sales wants an "unlike vendor X" comparison page live by Friday. Cowork has drafted it from the competitor's public pages.
Q: What happens before it goes live?
+ Verify every claim against a dated source, then get a human sign-off.
> Customer-facing competitive content carries real legal and credibility exposure, its sources go stale fast, and the vendor you describe is highly motivated to find the error.
~ Check the claims that look surprising, and publish the rest as drafted.
> Better than nothing, but ordinary-looking claims go stale too — and the vendor will read every one of them.
- Publish it. Cowork read the vendor's own pages, so the page is accurate.
> The draft is only as current as the day it was read, and nobody checked it. The person you are describing is the one most likely to find the mistake.
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What is the hard part of a launch kit?
A: **Consistency across all eight artefacts.** Generating them together from one messaging foundation stops reps saying three different things.

Q: Why is the battlecard the most dangerous GTM play?
A: It is repeated out loud, by someone who was not there, to the person best placed to contradict it. Every made-up detail ends with a rep corrected by a prospect.

Q: What makes a campaign readout credible to a sceptical CMO?
A: Asking for the data problems and a "what this cannot tell you" section. A readout that admits its attribution is unreliable earns more trust.

Q: Which voice-of-customer output is the sleeper?
A: **The words customers actually use** for each theme. They go straight into your copy, your SEO and your sales scripts.

Q: What are the two places GTM must not trust Cowork?
A: **Positioning strategy** — deciding who you choose not to serve — and **anything competitive that is customer-facing**.

Q: What is the highest-leverage thirty minutes in a launch?
A: One human arguing with the messaging house **before** anything is generated from it. A wrong foundation becomes wrong in eight places.
```

```quiz
Q: What is Cowork's structural advantage in producing a launch kit?
- It writes faster
+ Consistency — generating all artefacts together from one messaging foundation prevents the drift that makes reps say three different things
- It knows your market
- It can publish directly
> The hard part of a launch kit was never writing one artefact. It was making eight agree.

Q: Why are battlecards the most dangerous GTM artefact to generate?
- They are long
+ Their whole purpose is to be repeated out loud by someone who was not there, to the person best placed to contradict it
- Competitors read them
- They go stale quarterly
> Every invented detail eventually becomes a rep being corrected by a prospect.

Q: In a VoC synthesis, which output is most directly usable?
- The sentiment score
+ The actual words customers use for each theme — they go straight into copy, SEO and sales scripts
- The theme count
- The quarterly trend
> Their language, not yours. It is the cheapest positioning improvement available.

Q: What is the risk in Cowork's consistency strength?
- Output becomes repetitive
+ A wrong messaging foundation becomes wrong in eight places at once, fluently and apparently deliberately
- Files get too large
- Reps stop reading it
> Have a human argue with the messaging house before generating anything downstream from it.
```

:::try Next
Let us build the launch kit — all of it, in one run.
:::

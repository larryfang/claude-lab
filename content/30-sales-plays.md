# The Six Sales Plays

Sales is the lane where Cowork's value is easiest to measure, because everything an AE does that is not talking to a customer is overhead — and most of it is exactly the multi-step, file-touching, deliverable-producing work Cowork is built for.

Here are the six plays, ranked by hours returned per rep per week.

:::concept Where the time actually goes
Studies vary, but most put the share of a seller's week spent actually selling at **under a third**. The rest is research, admin, CRM hygiene, internal reporting, and writing.

Cowork does not make you a better closer. It gives you back the hours in which you could be closing.
:::

## Play 1 — The pre-call brief · ~3 hrs/week

**The job:** before every first call, know the company, the person, the trigger, and what we already know about them.

**Why it is the best starting play:** it is the highest-frequency research task, it is genuinely tedious, and the quality difference between a researched call and an unresearched one is immediately obvious to both sides.

**Shape of the brief:** cross-reference the CRM record, your own past email and notes, the company's own website and news, then a page per account with a snapshot, the history, three specific questions, and one hypothesis about why they would buy.

**Lab 1 builds this.**

## Play 2 — Pipeline hygiene and the deal review · ~2 hrs/week

**The job:** turn the CRM into an honest answer to "which deals are at risk and what are you doing about them".

**Why it works:** the data is already structured, the analysis is mechanical, and the output is a document you currently write by hand under time pressure every week.

**The part people miss:** ask it to flag the **data quality problems**, not just analyse the data. Half of a stale pipeline is stale logging, and knowing which half is which is the actual insight.

**Lab 2 builds this.**

## Play 3 — Follow-up and sequences · ~2 hrs/week

**The job:** the personalised follow-up you know you should send to twenty accounts and send to four.

**Why it works:** personalisation at volume is a genuine constraint that Cowork removes — *if* the personalisation is real. Which means it must come from your notes and their public signals, not from a template with a merge field.

**The honest limit:** volume without substance is spam, and it burns your domain and your brand. Twenty genuinely specific emails beat two hundred generated ones, and Cowork is equally capable of producing either.

**Lab 3 builds this.**

## Play 4 — RFPs and security questionnaires · ~4 hrs, unpredictably

**The job:** the 200-question spreadsheet that lands on a Thursday and blocks a deal.

**Why it is transformative:** the answers almost all exist — in past responses, your docs, your security policies, your trust centre. The work is retrieval and formatting, which is exactly what Cowork is for.

**The rule:** Cowork drafts, and flags every answer it could not source. A human — often security or legal — signs off. Never send a generated compliance answer unreviewed. That is a contractual representation, not a piece of marketing copy.

**Lab 3 covers this too.**

## Play 5 — Mutual action plans and next steps · ~1 hr/week

**The job:** from a call transcript or notes, produce the mutual action plan — what happens next, who owns it, by when, and what each side needs.

**Why it works:** the information is all in the conversation and it almost never makes it into a shared document. A MAP that exists is worth more than a MAP that is well-written.

```prompt
From the call notes in `calls/acme-2026-08-20.txt`, produce `output/acme-map.md`: a mutual action plan table with columns Step, Owner (us or them, named), Due date, Dependency, Status. Include only steps actually discussed or clearly implied — do not invent milestones. Flag separately anything that was left vague, and anything that has an owner on their side who was not on the call. Then draft a short email to the champion proposing the plan, with the vague items as explicit questions.
```

## Play 6 — Territory and account planning · ~quarterly, high leverage

**The job:** the annual or quarterly plan you write in a rush.

**Why it works:** it needs synthesis across CRM history, market signals, and product fit — lots of sources, one document, no ambiguity about the format.

```prompt
Using our CRM data for my territory plus the account notes in `sales/` (or your `accounts/` folder if you keep one), produce `output/territory-plan.md`: (1) my book segmented by ARR and expansion potential with the evidence for each judgement, (2) the ten accounts with the strongest expansion signal and what the signal is, (3) the five most likely churn risks and why, (4) whitespace — products they do not have that similar accounts do buy, (5) a ranked list of where I should spend my time next quarter. Every judgement needs a data point behind it. Flag any account where the CRM data is too thin to assess.
```

:::concept In the field: scoring 4,000 accounts overnight
Anthropic's own head of US mid-market GTM runs Play 6 at scale: he gave Cowork two five-dimension scoring rubrics, had it score a **test territory**, spot-checked the output, adjusted the weights ("D4 is a little heavy; bring it down a bit") — then let it score all 4,000 accounts overnight, each with a written per-dimension rationale. His words: *"None of the prompts were technical"* and *"Claude builds the what; I do the why."* The pattern to copy is **calibrate small, then scale**: criteria → a handful of examples → human keeps/rejects with reasons → the full run.
([claude.com](https://claude.com/blog/how-an-anthropic-sales-leader-uses-claude-cowork-to-run-a-4-000-account-book))
:::

## What Cowork must not do in sales

Being clear about this protects you.

- **It does not decide your forecast.** It can compute weighted values and flag risk. Calling the number is your job, and your judgement is what you are paid for.
- **It does not send anything unreviewed.** Not an email, not a proposal, not a CRM update that a manager will act on.
- **It does not make compliance or contractual statements.** Draft yes. Send, never.
- **It does not read a room.** It cannot tell you the CFO went quiet when you mentioned the migration. Transcripts capture words, not the meeting.
- **It does not replace discovery.** A brilliant pre-call brief and no curiosity in the call is worse than the reverse.

:::warning The credibility risk
The fastest way to lose a deal with AI-assisted selling is a confidently wrong detail in a customer-facing document — a competitor's price that is out of date, a compliance claim your product does not support, a "we understand your team of 400" when they have 90.

One wrong fact in a customer-facing doc costs more than the ten hours the tool saved you that week. Module 9 is the discipline that prevents it, and it is not optional in this lane.
:::

:::tip Plugin first, custom second
Anthropic ships an official **Sales plugin** (availability varies by plan — look under **Customize → Plugins**): `/pipeline-review` flags stale deals and drafts a weekly action plan, `/forecast` produces a weighted best/likely/worst view, `/call-summary` turns a transcript into actions and a follow-up draft. Install it and run the commands on your own data — then use the labs here to understand what a good version does, and customise where the ready-made one misses your definitions.
:::

## Pick your first play

You are about to do three labs. Before that, decide which of the six is worth most **to you**:

- [ ] Which of these six do I spend the most time on?
- [ ] Which do I most often skip because there is no time?
- [ ] Which one, if it were reliably good, would change my week?

That third answer is your first Skill in Module 8.

## Make the call

Choose what you would do, read the consequence, then try the other options.

```scenario
S: It is Thursday afternoon. A 200-question security questionnaire has just landed, and the deal is blocked until it goes back.
Q: How do you use Cowork on it?
+ Have Cowork draft every answer from your past responses, docs, security policies and trust centre, flag each one it could not source, and send the draft to security or legal for sign-off.
> The answers almost all exist, so retrieval and formatting is the leverage. Sign-off stays with a human because each answer is a contractual representation, not marketing copy.
~ Have Cowork draft only the easy questions, and write the hard ones yourself.
> Safer than sending unreviewed, but you give away most of the leverage. And the easy answers are still compliance statements: they need a human sign-off too.
- Let Cowork answer the lot and send it tonight, so the deal moves by Friday.
> A generated compliance answer sent unreviewed is a contractual statement nobody checked. One confidently wrong claim costs more than every hour the tool saved.

S: Your territory plan is due. You want Cowork to score every account in your book against your own criteria.
Q: What do you do first?
+ Give it the criteria, have it score a small test territory, spot-check the results and adjust the weights, then run the full book.
> Calibrate small, then scale. The spot-check is where your "why" goes in; the full run then repeats a scoring you have already checked.
~ Run the full book at once, then spot-check a few accounts at the end.
> You may catch a problem, but every score rests on weights nobody checked, so any fix means running the whole book again.
- Run the full book and use the ranked list as next quarter's plan, unchanged.
> Nothing checked the weights, and deciding where you spend your time is your judgement. You would be working a quarter from a ranking you never calibrated.
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: Which sales play is the best one to start with?
A: **The pre-call brief.** It is the highest-frequency research task, genuinely tedious, and the quality gap is obvious to both sides of the call.

Q: What must a pipeline analysis also flag?
A: The **data quality problems**. Half of a stale pipeline is stale logging, and knowing which half is which is the actual insight.

Q: Where must real outreach personalisation come from?
A: Your notes and their public signals — not a template with a merge field. Twenty genuinely specific emails beat two hundred generated ones.

Q: Who signs off a security questionnaire that Cowork drafted?
A: A human, often security or legal. Cowork drafts and flags every answer it could not source; it never sends a compliance answer.

Q: Who calls the forecast number?
A: You. Cowork can compute weighted values and flag risk. Calling the number is judgement, and judgement is what you are paid for.

Q: What does one wrong fact in a customer-facing doc cost?
A: More than the ten hours the tool saved you that week. That is why verification is not optional in this lane.
```

```quiz
Q: Why is "flag the data quality problems" the crucial addition to a pipeline analysis brief?
- It makes the report longer
+ Because much of a stale-looking pipeline is stale logging, and knowing which is which is the actual insight
- CRM connectors require it
- It speeds up the analysis
> An analysis of bad data is a confident wrong answer. Separating "deal is stuck" from "deal is unlogged" is the value.

Q: What is the correct division of labour on a security questionnaire?
- Cowork answers and sends it
+ Cowork drafts from your existing sources and flags every answer it could not source; a human — often security or legal — signs off
- A human writes it all
- Cowork answers only the easy questions
> These are contractual representations. Drafting is the leverage; sign-off is non-negotiable.

Q: What is the risk of using Cowork for outreach personalisation at volume?
- It is slower than templates
+ Cowork is equally good at producing genuine specificity and at producing plausible spam — volume without substance burns your domain and brand
- It cannot access your CRM
- Emails will look identical
> Twenty genuinely specific emails beat two hundred generated ones. The tool does not make that choice for you.

Q: Which of these is explicitly NOT a job for Cowork in sales?
- Producing a pre-call brief
- Cleaning a pipeline export
+ Deciding what to commit to the forecast
- Drafting a mutual action plan
> It can compute and flag. Calling the number is judgement, and judgement is the job.
```

:::try Next
Enough theory. Let us build the pre-call brief.
:::

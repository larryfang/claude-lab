# Verify Before You Send

The labs produce output that can look finished before it has been checked. This lesson gives you a review method whose depth matches the consequences of an error.

:::concept The asymmetry
Cowork saves you hours. One confidently wrong number in a customer-facing document costs more than a week of those hours — in credibility, in a lost deal, in a decision made on a figure that was never real.

The maths is not close. Verification is not overhead; it is what makes the time saving real.
:::

## The four-check pass

Use all four checks. A small practice sample helps you learn the method; important deliverables need broader coverage. Anthropic's [guidance on inaccurate responses](https://support.claude.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses-what-s-going-on) recommends checking factual claims against reliable sources.

### Check 1 — Trace the important numbers, then sample

Start with every number that drives the decision: the headline total, a price, a forecast, or a material variance. Follow each to its calculation and source records. Then select three additional numbers from different sections as a practice sample. If fewer exist, check all of them. For a high-stakes pack, define wider coverage with the responsible reviewer.

- Does it reconcile exactly?
- Was it rounded? By how much?
- Is it the metric it claims to be?

A clean sample does not establish that the other numbers are correct. If one fails, investigate the cause and expand the check to every affected calculation. Keep a data artefact alongside the narrative so the calculation is inspectable.

### Check 2 — Count the rows

Account for every input record. In a one-record-per-row transformation, included records plus documented exclusions must reconcile to the input. Deduplication and aggregation change output row counts; keep record IDs and a mapping or group counts so those transformations can be reconciled too.

For example: **100 input records = 94 included + 4 excluded + 2 duplicate records removed**. A summary may have only five rows, one per region; its group counts should still account for the 94 included records. Equal row counts alone do not prove the records or values are right.

### Check 3 — Verify quotes and claims at the source

For quotes you will publish: find each in the source, **word for word**, with the right speaker and surrounding context. In a practice lab, start with three. A paraphrase should be labelled as a paraphrase, without quotation marks.

For external claims — a competitor's price, a market figure, a company's headcount — open the source, check its date and scope, and confirm it supports the exact claim. Prioritise claims that affect the decision; three arbitrary citations are not a sign-off. Different facts become stale at different rates.

### Check 4 — Read the flags

You asked Cowork to flag things. Read that section properly. Every flag is either resolved, or acknowledged in the output, or a reason not to send yet.

An unread flag section is the same as not having asked.

## The claims you must never take on trust

| Claim type | Why | What to do |
|---|---|---|
| **A number going to an exec or a customer** | It will be repeated and acted on | Trace it to source, personally |
| **A verbatim quotation** | Misrepresents a real person | Match it character by character |
| **A competitor's price or capability** | Goes stale fast; they will correct you | Open the page, check the date |
| **A compliance, security or legal statement** | A contractual representation | Named human sign-off, always |
| **A causal claim** — "X caused Y" | Correlation stated as cause | Ask what else could explain it |
| **A statistical significance claim** | Sample size is usually the problem | Check the sample yourself |
| **Anything about a named person** | Reputational and factual risk | Verify title, role, spelling |
| **A date or a commitment** | Becomes a promise | Check the source system |

## Practise the review

The table above is only useful if you can spot those claims in a fluent paragraph. This draft came back from a well-briefed run. Five sentences should not reach the VP as written.

```spot
# Select every sentence you would not send without checking or changing it, then choose Check.
Q3 closed with 42 opportunities in the export (source: `pipeline-q3.csv`, rows 2–43). [[Win rate improved to 31% because the new discovery script works.|A causal claim. The data shows the win rate rose while the script was in use; it does not show the script caused it. Ask what else changed in the quarter.]] The three largest open deals are in the table on page 2, with close dates taken from the CRM. [[Northwind cut its list price by 40% last month, so expect pressure on renewals.|A competitor price with no source and no date. Open the page, check the date and cite it, or cut the sentence.]] [[Average deal size was about $48k.|A number going to an executive with no source row, and "about" hides whether it was rounded, derived or estimated. Trace it before it is repeated.]] Two opportunities were excluded from the totals because their amount field is blank; both are listed in the Issues tab. [[The trend is statistically significant, so it will continue into Q4.|A significance claim on 42 deals, and a forecast stated as a fact. Check the sample yourself and label the forecast as an inference.]] [[Priya Shah, CFO at Acme, confirmed they will sign in October.|A commitment attributed to a named person. Verify her title and find the commitment in the CRM or in email before it becomes a promise in your forecast.]]
```

The unmarked sentences provide evidence locations or disclose exclusions. They are easier to verify, not automatically true: open those sources too before using the report. This exercise spots missing support; it does not verify the fictional underlying data.

## Forcing verifiability up front

Verification is far easier if you designed for it. Three instructions, in every brief that matters:

**1. Define the permitted sources.** *"Use only these files as evidence. Do not use the web. Flag unsupported claims."* This gives you a bounded evidence set, but does not prevent invention or misreading. Inspect the cited source yourself.

**2. Demand citations inline.** *"Every factual claim needs its source — a filename and row, or a URL and the date read — stated in the text, not in a bibliography."* Citations at the end get skimmed. Citations inline get checked.

**3. Separate observation from inference.** *"Structure each finding as OBSERVED (what the source says, quoted) then INFERRED (your reading, labelled). Never merge them."* Most bad conclusions are inferences that got typeset as observations.

## Making Cowork check itself

Useful, and not a substitute for the four checks.

```prompt
Audit the deliverable you just produced. For every factual claim, tell me: the exact source (filename and row, or URL and date), whether it is an observation or an inference, and your confidence. Then list separately: every claim you cannot source, every number you rounded or derived rather than read, every row you excluded from any calculation and why, and every place you resolved an ambiguity without telling me.

Be exhaustive. I would rather have a long list than a clean-looking document.
```

:::warning Why self-audit is not enough
A self-audit can find real problems, but it can also repeat the same mistaken reading. A confident answer or confidence score is not evidence. Reopen the original source, recompute important totals independently, and involve a qualified reviewer where the work requires one.
:::

## The fresh-eyes upgrade

Start a **new** task with the output, original sources, and acceptance criteria. Ask it to test the claims without giving it the builder's explanation first. This reduces dependence on the earlier conversation, but it is still an AI review and can repeat the same mistakes.

A new task is not necessarily a blank slate. Project instructions can recur, and [Claude's memory features](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context) share context between chat and cloud Cowork tasks when enabled. That shared memory is not available in local Cowork sessions. Check the task's environment, settings, and supplied context; retain the human review and direct source checks.

Anthropic's marketing-ops team describes a separate auditor that **test-registers for an event and checks Gmail for the confirmation email**, helping catch problems such as a cloned page's wrong city name ([case study](https://claude.com/blog/how-anthropics-marketing-operations-team-uses-claude-cowork-to-automate-reporting-and-campaign-builds)). The useful pattern is to test the actual outcome. The finance lane's board-pack lab applies a separate source-tracing pass, which you can later package as a Skill. Allow time for that review and for resolving its findings.

## The red-team pass, for high-stakes work

For anything going to a board, a customer, or a decision you cannot reverse:

```prompt
You are the person in the room most motivated to find a problem with this document — a sceptical executive, or the competitor it describes, or the customer whose words it quotes.

Find: every claim you would challenge and how; every number you would ask to see the working for; every place the argument does not follow from the evidence; the single question that would be most awkward to be asked about this; and the claim that, if wrong, would do the most damage.

Be specific and quote the document. Do not be constructive.
```

Then answer the awkward question before the meeting rather than during it.

## The habit that makes this stick

:::lab Your standing checklist
Save this somewhere you will see it before sending anything.

- [ ] Traced decision-critical numbers and an additional sample to source; expanded coverage after any error
- [ ] Accounted for input records, exclusions, duplicates, and any aggregation
- [ ] Quotes intended for publication match their sources and context
- [ ] Decision-relevant external claims checked at source, with dates
- [ ] Read the flag section and resolved every item
- [ ] Every number I could not verify is either removed or marked unverified
- [ ] Anything compliance, legal or security related has a named human reviewer
- [ ] I can explain every conclusion in my own words without re-reading the document
:::

That last box is the real test. If you cannot explain a conclusion without the document open, you are forwarding someone else's reasoning with your name on it.

:::tip Keep a short review record
Record what you checked, the source version or date, what failed, and what remains unverified. Review time depends on complexity and consequences. Repeated work can become faster when the same reconciliations are automated and you inspect exceptions.
:::

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What are the four checks in the four-check pass?
A: Trace important numbers plus a sample, account for input records, verify quotes and claims, and read the flags.

Q: Is checking three numbers enough to approve a report?
A: No. Check the numbers driving the decision, then sample additional numbers. Expand the review if an error appears or the consequences require it.

Q: Why is counting the rows worth doing every time?
A: It exposes missing or duplicated records. Reconcile inclusions, exclusions, and group counts; a summary legitimately has fewer rows than its input.

Q: Which three instructions make a deliverable verifiable by design?
A: Restrict the sources, demand citations inline, and separate OBSERVED from INFERRED.

Q: What can a self-audit miss?
A: A misread source or faulty assumption it repeats. Check the original evidence and independently recompute important calculations.

Q: What is the fresh-eyes upgrade?
A: Give a new task the output, sources, and acceptance criteria. Check shared memory and instructions, and treat its findings as additional review rather than proof.
```

```quiz
Q: A report groups 94 included records into five regions. What record check is useful?
- Reading it twice
+ Reconcile group counts to included records, then account for exclusions and duplicates against the input
- Asking Cowork to verify it
- Checking the formatting
> Aggregation legitimately changes row counts. The mapping and totals must still account for every source record.

Q: Why is a self-audit insufficient on its own?
- It is too slow
+ It may repeat the same source misreading or mistaken assumption
- It only checks formatting
- It requires connectors
> A second pass can help. Direct source inspection and independent recalculation provide stronger evidence than confidence alone.

Q: Which three instructions make a deliverable verifiable by design?
- Be accurate, be concise, be honest
+ Restrict the sources; demand inline citations; separate OBSERVED from INFERRED
- Use tables; add a summary; number the sections
- Show the plan; write to output; flag exclusions
> "Be accurate" is a wish. These three are mechanisms.

Q: What is the real test in the standing checklist?
- The row count
+ Whether you can explain every conclusion in your own words without re-reading the document
- The quote match
- The flag review
> Otherwise you are forwarding someone else's reasoning with your name on it.
```

:::try Next
You can prevent and catch errors. Next, the Failure Clinic: six broken runs to diagnose from the symptom alone — then getting a team to actually use this.
:::

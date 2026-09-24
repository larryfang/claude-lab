# Verify Before You Send

Everything in this course produces output that looks finished. This lesson is about the ten minutes between "looks finished" and "is safe to send".

:::concept The asymmetry
Cowork saves you hours. One confidently wrong number in a customer-facing document costs more than a week of those hours — in credibility, in a lost deal, in a decision made on a figure that was never real.

The maths is not close. Verification is not overhead; it is what makes the time saving real.
:::

## The four-check pass

Ten minutes, every deliverable that leaves your hands.

### Check 1 — Trace three numbers

Pick three numbers at random from the narrative. Not the headline number — random ones, because those are the ones nobody checks. Follow each to the data artefact, then to the source row.

- Does it reconcile exactly?
- Was it rounded? By how much?
- Is it the metric it claims to be?

This is why every lab asked for a data artefact alongside the narrative. Without it, this check is impossible.

### Check 2 — Count the rows

Compare records in against records out. If they differ, the deliverable must say why.

This is the fastest and highest-yield check there is. Silent exclusions are the most common serious error and they are invisible in the narrative.

### Check 3 — Verify three quotes and three claims

For quotes: find each in the source, **word for word**. A paraphrase in quotation marks is a misrepresentation of a real person, and you will repeat it with quotation marks in your voice.

For external claims — a competitor's price, a market figure, a company's headcount — open the source and check. Web-sourced facts go stale within weeks.

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

Notice what the good sentences have in common: a named source, a stated exclusion, a pointer to where the evidence is. That is what your briefs should ask for.

## Forcing verifiability up front

Verification is far easier if you designed for it. Three instructions, in every brief that matters:

**1. Restrict the sources.** *"Use only these files. Do not use the web. Do not use general knowledge."* If a claim could only have come from a source you also have, it is checkable. If it could have come from anywhere, it is not.

**2. Demand citations inline.** *"Every factual claim needs its source — a filename and row, or a URL and the date read — stated in the text, not in a bibliography."* Citations at the end get skimmed. Citations inline get checked.

**3. Separate observation from inference.** *"Structure each finding as OBSERVED (what the source says, quoted) then INFERRED (your reading, labelled). Never merge them."* Most bad conclusions are inferences that got typeset as observations.

## Making Cowork check itself

Useful, and not a substitute for the four checks.

```prompt
Audit the deliverable you just produced. For every factual claim, tell me: the exact source (filename and row, or URL and date), whether it is an observation or an inference, and your confidence. Then list separately: every claim you cannot source, every number you rounded or derived rather than read, every row you excluded from any calculation and why, and every place you resolved an ambiguity without telling me.

Be exhaustive. I would rather have a long list than a clean-looking document.
```

:::warning Why self-audit is not enough
A self-audit will find real problems — genuinely, it is worth running. It cannot find the error where Cowork misread a source and remains confident about it, because the misreading is what it will audit against.

Your three-number trace catches that. Nothing else does.
:::

## The fresh-eyes upgrade

The strongest version of the self-audit is not to let the same session mark its own homework. Start a **new** Cowork session — one with no memory of building the deliverable — point it at the output and the sources, and run the same audit brief. The builder session re-reads its own reasoning as confirmation; a fresh instance can only see what an outside reviewer sees.

This builder-plus-independent-auditor pattern is how Anthropic's own teams check work before it ships — their campaign-ops pipeline has a fresh Claude instance actually **test-register for the event and check Gmail for the confirmation email** before a task can be marked complete, which caught bugs like wrong city names in confirmation emails ([claude.com](https://claude.com/blog/how-anthropics-marketing-operations-team-uses-claude-cowork-to-automate-reporting-and-campaign-builds)). It costs one extra prompt. The finance lane's board-pack lab walks through it end to end — and in Module 8, that audit brief is worth turning into your first Skill, so the proofread happens by name, every time, before anything goes out.

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

- [ ] Traced three random numbers to source
- [ ] Row count in equals row count out, or the difference is explained
- [ ] Three quotes matched word for word
- [ ] Three external claims checked at source, with dates
- [ ] Read the flag section and resolved every item
- [ ] Every number I could not verify is either removed or marked unverified
- [ ] Anything compliance, legal or security related has a named human reviewer
- [ ] I can explain every conclusion in my own words without re-reading the document
:::

That last box is the real test. If you cannot explain a conclusion without the document open, you are forwarding someone else's reasoning with your name on it.

:::tip Ten minutes, and it gets faster
The first time this feels slow. By the fifth deliverable you will do it in four minutes, because you learn where errors cluster in your particular kind of work — usually one or two specific places.

And you will find things. Everyone does. That is what tells you the check is working.
:::

```quiz
Q: What is the fastest, highest-yield check on any data deliverable?
- Reading it twice
+ Comparing record count in against record count out
- Asking Cowork to verify it
- Checking the formatting
> Silent exclusions are the most common serious error and are invisible in the narrative.

Q: Why is a self-audit insufficient on its own?
- It is too slow
+ It cannot catch a source Cowork misread and remains confident about — it audits against its own misreading
- It only checks formatting
- It requires connectors
> Worth running, but your own three-number trace is what catches that class of error.

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
The last piece: getting a team to actually use this.
:::

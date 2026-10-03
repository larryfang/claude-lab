# Lab: Battlecard from Live Sources

Twenty minutes. A competitor battlecard with a citation on every claim, then an adversarial pass that tries to break it.

The second half is the point. A battlecard is repeated out loud to the person best placed to contradict it, so an unverified battlecard is worse than no battlecard.

:::note Setup
Start with **Research / web search** for public pages (Module 3). Use Claude in Chrome only when the task needs browser interaction, on a dedicated profile with access limited to the sites you will research.

Without web access: save the competitor's pricing page, homepage and docs pages as text and point the brief at those files. The practice `gtm/competitor-*.txt` files from Module 1 also work. Also supply approved documentation for **your own product**; competitor research alone cannot establish where you win or lose.
:::

## Part 1 — Research, with sourcing enforced (8 min)

:::lab Step 1 — The research pass
Note that this brief does **not** ask for a battlecard yet. Research first, synthesis second — because mixing them is how unsourced claims get laundered into confident copy.

```prompt
BACKGROUND. I am a PMM at [COMPANY]. We lose deals to [COMPETITOR] and I need to understand them accurately before I write anything our reps will say out loud.

RESULT. `output/[competitor]-research.md` with these sections. In every section, structure each item as OBSERVED (what the source says, with the URL or filename and the date) then INFERRED (my reading of it, explicitly labelled).

1. WHAT THEY SELL — products, packaging, what is in which tier
2. PRICING — every price, unit and tier you can actually see on a page. If pricing is not public, write "not public" and say what you could determine
3. POSITIONING — their own words on who they are for and what they claim to be better at. Quote them
4. RECENT CHANGES — anything that has visibly changed in the last six months, with dates
5. WHAT THEIR CUSTOMERS SAY PUBLICLY — themes from review sites and forums, with a quote and link each. Both positive and negative
6. WHAT THEIR DOCUMENTATION REVEALS — limits, requirements, missing features that marketing does not mention
7. WHERE MARKETING AND DOCS DISAGREE — anything their own materials contradict
8. WHAT I COULD NOT FIND OUT — explicitly

Also produce `output/[competitor]-sources.csv` with columns section, observed_claim, source, date_read.

INPUTS. Only pages you actually visit on their own domains, their docs site, their status page, and public review sites — or only the files I have given you. Do not use the model's general knowledge of this company. Do not visit anything behind a login.

EDGES. Every factual claim needs a URL and the date read, or a filename. If you cannot source it, leave it out — do not fill gaps from general knowledge. Never state a price you did not see on a page. Never describe a feature you did not see documented. Read-only: do not click anything that submits, signs up, purchases or contacts them, and do not fill in any form.

FLAG: anything that looks like it changed recently; anything where two of their own sources disagree; anything a rep should verify with a human before repeating.

Show me your plan and the exact list of URLs you intend to visit before you start.
```

- [ ] I reviewed the URL list before it went
- [ ] Every claim has a URL or filename and a date
- [ ] Section 8 records the research limits, including whether our own product evidence is available
- [ ] OBSERVED and INFERRED are visibly separated
:::

:::tip Save the sources
Save the page text into `snapshots/[competitor]/[date]/`, with its URL and date read. This makes later comparisons traceable. For a scheduled run, confirm that the next run can read the previous snapshot and that the destination supports creating files; otherwise download it from the task conversation and provide it to the next run. On the first run, label the result BASELINE rather than claiming a change.
:::

## Part 2 — The battlecard (6 min)

:::lab Step 2 — Synthesis, from evidence on both products
```prompt
BACKGROUND. Reps have 90 seconds to read this before a call. They need things they can say out loud without being contradicted.

RESULT. `output/battlecard-[competitor].md`, ONE page maximum:

1. IN ONE LINE — who they are and when we lose to them
2. WHERE WE WIN — three points. Each with the proof, the source, and the exact words a rep should use
3. WHERE THEY WIN — three points, stated honestly, each with what a rep should say instead of arguing
4. THEIR LIKELY ATTACK — the three things they will say about us, and the true response to each
5. TRAP QUESTIONS — three questions a rep can ask that favour us and are fair
6. DISQUALIFIERS — when we should walk away from this deal
7. DO NOT SAY — claims that are unverified, stale, or that legal would not want repeated
8. SOURCES AND FRESHNESS — every claim keyed to its source and date, plus a "check again after" date

Also produce `output/battlecard-[competitor]-claims.csv` with columns claim, section, source, date_read, check_after.

INPUTS. Only `output/[competitor]-research.md` and the approved own-product documentation or capability matrix I supply, with version and date. If I have not supplied our product evidence, ask for it; do not invent our capabilities from general knowledge.

EDGES. Every comparison in sections 2–5 must cite evidence for both products, with comparable tier, version and use case. If the evidence does not support a point, write "[NO EVIDENCE]" rather than filling it. An undocumented feature is unknown, not proof that it is absent. Never state their price unless the research has a URL for it. Name only the advantages the evidence supports, even if there are fewer than three.

FLAG: any claim resting on a source over three months old; anything you had to mark [NO EVIDENCE].
```

- [ ] One page, and readable in 90 seconds
- [ ] Section 3 (where they win) is honest, not token
- [ ] Section 7 exists and is specific
- [ ] Every claim keys to a source
:::

:::warning Section 3 is the credibility test
If "where they win" is three soft non-answers, the battlecard is marketing rather than enablement — and reps will stop trusting it after the first call where the competitor demonstrably did something better.

Push back:

> "Check section 3 against the competitor research and our approved product evidence. Identify supported advantages for comparable tiers and use cases. Treat gaps in documentation as unknowns. If the evidence supports only two advantages, give me two and say so."
:::

## Part 3 — The adversarial pass (6 min)

This is the half that makes the difference.

:::lab Step 3 — Break your own battlecard
```prompt
You are now [COMPETITOR]'s competitive lead, and you have obtained this battlecard. Produce `output/battlecard-attack.md`:

1. Every claim about you that is factually wrong or out of date. For each, quote the battlecard, state what is actually true, and cite the source
2. Every claim that is technically true but misleading in context — and how you would reframe it in front of a prospect
3. The single claim you would most enjoy a rep saying to a customer of yours, because of how you would respond
4. Where their honest "where they win" section understates you
5. The claim that would most damage their credibility if a prospect fact-checked it live on the call

Use only the research file, our supplied product documentation and sources cited in the battlecard. Be specific and quote directly. If a section has no supported finding, record "none found"; do not invent an attack to fill it. This is a simulated critique, not evidence of what the competitor actually thinks.
```

- [ ] I checked the critique against the cited sources
- [ ] I fixed confirmed problems, or recorded that none were found
:::

:::lab Step 4 — Final safety check
```prompt
Final pass. For every claim, record: (a) a direct source a rep can check, (b) the source date and whether freshness is adequate for this type of claim, (c) fact, inference or opinion, and (d) any potential legal or policy concern that needs human review. Do not present your judgement as approval from our legal team.

Move unsupported, stale or misleading claims into DO NOT SAY, with the reason. Hold claims needing legal review there until the authorised reviewer approves them. Report how many claims were retained or held, and mark the document with today's date and a review-by date no more than three months out; use a shorter interval for volatile prices or availability.
```

- [ ] The battlecard has a date and a review-by date
- [ ] Everything unverifiable moved to DO NOT SAY
- [ ] I know what proportion survived
:::

:::tip Check the review evidence
A clean review is possible. Inspect the citations and a few consequential claims yourself; the proportion rejected does not measure review quality. Do not ask the model to invent problems merely to lower the survival rate.
:::

## Part 4 — Keep it alive

A battlecard's real failure mode is going stale silently. Someone reads a six-month-old price out loud.

- [ ] Every claim carries its source date
- [ ] The document has a review-by date on it
- [ ] Snapshots of the source pages are saved
- [ ] Module 8 puts the monitoring on a schedule so you learn when their pricing page changes

## Reflect

Answer about your own work, not the practice data. Your answers save to your notebook in this browser.

```reflect
Which claim about a real competitor have you heard a rep repeat that nobody could verify in under a minute? Where would it go on your battlecard now?
```

```reflect
What proportion of your battlecard survived the final safety check, and what does that tell you about the claims your team repeats today?
```

```quiz
Q: Why separate the research pass from the battlecard pass?
- To produce more files
+ Mixing them lets unsourced claims get laundered into confident copy — research first forces every claim to have a source before it becomes something a rep says
- Because research takes longer
- To use fewer tokens
> Two passes, one direction of dependency. The battlecard can only use what the research sourced.

Q: The "where they win" section came back with three soft non-answers. What is the consequence?
- The document is shorter
+ Reps stop trusting the battlecard after the first call where the competitor demonstrably did something better
- Legal will reject it
- Nothing; that section is optional
> An enablement document that only flatters you is marketing, and reps can tell.

Q: What does OBSERVED / INFERRED labelling in the research file achieve?
- Better formatting
+ It keeps what a page actually said separate from the researcher's reading of it, so inference cannot be repeated as fact
- It shortens the document
- It is required by review sites
> The two get merged silently otherwise, and inference is what gets contradicted on calls.

Q: Your review rejected no claims. What should you do next?
- Declare the battlecard perfect
+ Inspect the sources and consequential claims yourself; a clean result alone neither proves nor disproves review quality
- Require the model to invent three problems
- Delete half the claims to make the review look rigorous
> Judge the review by its evidence, not by how many claims it rejects.
```

:::try Next
The last GTM lab: the campaign readout that survives a sceptical CMO.
:::

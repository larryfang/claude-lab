# Lab: A Whole Launch Kit in One Run

Twenty-two minutes. You will produce eight consistent launch artefacts from one messaging foundation — and, more importantly, learn the sequence that makes them agree with each other.

:::warning The sequence matters more than the briefs
**Foundation first, artefacts second.** Get one human to attack the messaging house before you generate anything from it. If you generate all eight artefacts from a flawed foundation, you now have eight fluent, mutually consistent, wrong documents — which is harder to fix than one bad draft, because it looks deliberate.
:::

## Part 1 — The messaging house (8 min)

Use a real upcoming launch if you have one. Otherwise use the practice `gtm/launch-brief-rough.txt` from Module 1.

:::lab Step 1 — The foundation
```prompt
BACKGROUND. I am a PMM at [COMPANY]. We are launching [FEATURE / PRODUCT] to [AUDIENCE] on [DATE]. Our position in the market is [ONE SENTENCE]. The launch has to do two things: give reps something to sell, and give the market a reason to care.

RESULT. `output/messaging-house.md` with these sections:

1. THE ONE-LINER — under 15 words, no adjectives that could apply to any product, no "seamless", "powerful", "next-generation", "AI-powered"
2. THE PROBLEM — in the customer's own words, sourced to something real in my inputs. If my inputs do not contain customer language, say so explicitly
3. THE THREE PILLARS — three claims we can support, each with: the claim, the proof point, the source of that proof, and what a sceptic would say back
4. WHO THIS IS FOR — the specific buyer and user, with the disqualifiers (who this is NOT for)
5. WHAT WE ARE NOT CLAIMING — the boundaries. What this does not do
6. THE COMPETITIVE FRAME — how we want this compared, and how we do not
7. PROOF INVENTORY — every piece of evidence available to us: metrics, quotes, benchmarks, case studies. With source and date
8. EVIDENCE GAPS — every claim in sections 1–3 that we cannot currently prove

INPUTS. Only the files I have provided. Do not use general knowledge about this market or invent customer quotes, metrics, benchmarks or case studies.

EDGES. Never write a proof point you cannot source to a file I gave you. Never invent a customer name or a statistic. If a pillar has no proof, keep the pillar and list it in Evidence Gaps rather than fabricating support.

FLAG: any pillar where our proof is weaker than the claim; any place where my rough brief contradicts itself; anything that sounds like a claim legal would want to see.

Show me your plan first.
```

- [ ] The messaging house was produced
- [ ] The one-liner is specific, not generic
- [ ] Section 8 (Evidence Gaps) is populated — if it is empty, be suspicious
- [ ] Section 3 includes what a sceptic would say
:::

:::lab Step 2 — The adversarial review (do not skip)
```prompt
Now attack this messaging house. You are a sceptical analyst who has seen forty launches in this category. For each pillar: what is the weakest word in the claim, what would a competitor say in response, and what evidence would I need to make it undeniable? Then tell me which single pillar to cut, and why. Be specific and be harsh — I would rather fix it now than after generating eight documents from it.
```

- [ ] It identified real weaknesses
- [ ] I edited the messaging house by hand before continuing
- [ ] The evidence gaps have owners and dates, or the claims are gone
:::

:::tip Why the human edit is mandatory here
Everything downstream inherits this file. Thirty minutes arguing with the foundation saves a launch. This is the one point in the whole course where "read it properly and change it yourself" is a hard requirement rather than good practice.
:::

## Part 2 — Generate the kit (10 min)

:::lab Step 3 — All eight artefacts
```prompt
BACKGROUND. The reviewed and edited `output/messaging-house.md` is now our source of truth for this launch. Everything below must be consistent with it.

RESULT. Produce these in `output/launch-kit/`:

1. `one-pager.md` — a single page for a prospect: the problem, what it does, three pillars, one proof point each, a call to action. No jargon, readable in 90 seconds.
2. `faq.md` — the twenty questions a customer will actually ask, including the six awkward ones about price, migration, security, limitations, timeline and what happens to the old way. Answer each honestly from the messaging house. Where the answer is "not yet", say "not yet".
3. `talk-track.md` — a 3-minute pitch written as spoken words, not bullet points. It should sound like a person talking.
4. `objections.md` — the twelve objections a rep will hear, with a response each, and for each response the proof point it rests on.
5. `demo-flow.md` — the demo in the order that makes the value obvious, with what to say at each step and the one moment that lands the value.
6. `internal-announcement.md` — the Slack or email post to the company: what shipped, who it is for, what to do about it, where the assets are. Under 250 words.
7. `launch-checklist.md` — everything that must happen before, on, and after launch day, with an owner column left blank for me to fill and a "blocked by" column.
8. `enablement-deck.pptx` — 10 slides for a rep training session: the problem, who it is for, the three pillars, the demo moment, the objections, the disqualifiers, what to do on Monday. Three bullets of speaker notes per slide.

EDGES. Every claim in every artefact must trace to the messaging house. Do not introduce a new claim, proof point, statistic, customer name or competitor comparison anywhere. Where an artefact would naturally need a claim the messaging house does not support, write "[NEEDS PROOF: description]" and list it at the end of that file. Keep the one-liner byte-identical everywhere it appears.

FLAG in a file `output/launch-kit/_consistency-check.md`: every place you had to write "[NEEDS PROOF]", every claim that appears in more than one artefact with different wording, and anything in the messaging house that no artefact ended up using.
```

- [ ] All eight artefacts exist
- [ ] `_consistency-check.md` was produced and I read it
- [ ] The one-liner is identical in every file
- [ ] The FAQ actually answers the six awkward questions
:::

## Part 3 — The consistency audit (4 min)

:::lab Step 4 — Check the thing Cowork is best at
- [ ] Search all eight files for the one-liner. Byte-identical?
- [ ] Pick one pillar. Is it described consistently in the one-pager, the talk track, the objections doc and the deck?
- [ ] Pick three proof points from the artefacts and trace each to the messaging house's Proof Inventory
- [ ] Read `_consistency-check.md`. Every `[NEEDS PROOF]` is either a task or a claim to delete — decide which, now
- [ ] Read the FAQ's answer on pricing and on limitations. Is it honest, or has it been smoothed?
:::

:::warning The smoothing failure
The most common problem with generated launch material is not invention — it is **smoothing**. A limitation stated plainly in the messaging house ("does not support on-premise deployment") becomes "designed for cloud-first organisations" in the FAQ. Nothing is technically false, and a rep now cannot answer the question.

Check specifically for this: find every limitation in your messaging house and read how each artefact expresses it. Then re-brief:

> "In the FAQ and objections doc you softened three limitations from the messaging house into positive framings. List each one, show the original and the softened version, and rewrite them to state the limitation plainly. Reps need to be able to answer 'does it do X' with 'no, and here is what we do instead'."
:::

## Part 4 — Make it yours

- [ ] Save the messaging-house brief — it is the reusable half
- [ ] Note which of the eight artefacts your team actually uses, and cut the rest from your saved version
- [ ] Note the artefacts you needed that were not in the list, and add them
- [ ] Module 8 makes this a Skill you run per launch in one line

## Reflect

Answer about your own work, not the practice data. Your answers save to your notebook in this browser.

```reflect
Think of your last real launch. Where did the one-pager, the sales script and the FAQ drift apart, and what would a reviewed messaging house have caught?
```

```reflect
Pick one limitation of a product you are launching. Would each artefact state it plainly, or smooth it into a positive framing? How will you check?
```

```quiz
Q: Why must the messaging house be reviewed by a human before generating the rest of the kit?
- To check spelling
+ Because every downstream artefact inherits it — a flawed foundation becomes eight fluent, mutually consistent, wrong documents
- Because Cowork cannot produce eight files at once
- To satisfy legal review
> Thirty minutes of argument with the foundation is the highest-leverage time in the launch.

Q: What is "smoothing", and why does it matter?
- Making the prose flow better
+ A plainly-stated limitation becoming a positive framing in a downstream artefact — nothing false, but a rep can no longer answer the question
- Reducing document length
- Removing jargon
> "Does not support on-premise" becoming "designed for cloud-first organisations" is the classic case.

Q: The messaging house's Evidence Gaps section came back empty. What should you conclude?
- The messaging is well supported
+ Be suspicious — it more likely means unsupported claims were quietly given plausible-sounding proof
- The brief was too long
- Nothing; empty is the goal
> An honest proof inventory almost always has gaps. An empty one is a signal, not a triumph.

Q: What does "keep the one-liner byte-identical everywhere" protect against?
- File size
+ The drift that makes the one-pager, the deck and the talk track say three slightly different things
- Formatting errors
- Duplicate files
> Consistency is the whole reason to generate the kit together.
```

:::try Next
The battlecard — and how to stress-test it before a rep says it out loud.
:::

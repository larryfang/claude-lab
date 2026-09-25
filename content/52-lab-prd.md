# Lab: The Evidence-Backed PRD

Twenty-two minutes. A brain-dump plus real evidence becomes a PRD where every requirement traces to something a customer actually said — and then Cowork attacks it.

This lab uses `output/discovery-report.md` and `output/themes.csv` from Lab 1. If you skipped it, run Lab 1 Parts 1–2 first.

:::warning You write the problem statement
This is one of the two things you must not delegate — the other is the decisions. A generated problem statement produces a spec that solves a problem nobody has, expressed beautifully. Write two or three honest sentences yourself, in your own words, before you start.
:::

## Part 1 — Your input (3 min)

:::lab Step 1 — The brain-dump
Create `product/prd-braindump.md` and write, badly and quickly:

- [ ] The problem, in your own words, two or three sentences
- [ ] Who has it and how you know
- [ ] What you think the solution roughly is
- [ ] What you are deliberately not doing
- [ ] What you are unsure about
- [ ] Any constraint you already know — a deadline, a dependency, a technical limit

Messy is fine. Bullet fragments are fine. Do not polish it — that is what the next step is for.
:::

## Part 2 — The PRD (9 min)

:::lab Step 2 — Structure and traceability
```prompt
BACKGROUND. I am a PM at [COMPANY]. My brain-dump is in `product/prd-braindump.md`. My discovery evidence is in `output/discovery-report.md` and `output/themes.csv`. I need a PRD that engineering can estimate and that survives a design review — where every requirement traces to evidence.

RESULT. `output/prd.md`:

1. PROBLEM — my problem statement, tightened but NOT changed in meaning. If you think it is wrong, note that separately in section 12 rather than silently improving it
2. EVIDENCE — the specific customer evidence for this problem: quotes, ticket IDs, theme rows, ARR affected. If the evidence is thin, say so here in plain terms
3. WHO — the user and the buyer, with the segments that do NOT have this problem
4. SUCCESS — three to five measurable criteria. Each needs a current baseline; where we have no baseline, write "no baseline — must be instrumented first"
5. SCOPE — what is in, as a numbered requirement list. Each requirement gets an ID (R1, R2…) and a source column citing the evidence for it
6. OUT OF SCOPE — what we are explicitly not doing, and why
7. USER FLOW — the main path, step by step, in prose
8. EDGE CASES — what happens with no data, too much data, a permission failure, a concurrent edit, a partial failure, an offline client. Be exhaustive; this is where specs leak
9. DEPENDENCIES — other teams, systems, data, or decisions this needs
10. OPEN QUESTIONS — what must be decided before build, and who decides each
11. REQUIREMENTS WITH NO EVIDENCE — every requirement in section 5 whose source column is empty
12. WHERE I MAY BE WRONG — your honest assessment of the weakest parts of my thinking, including the problem statement

Also produce `output/prd-requirements.csv` with columns id, requirement, evidence_ref, evidence_type (quote / ticket / theme / none).

INPUTS. Only `product/prd-braindump.md`, `output/discovery-report.md`, `output/themes.csv`, and the transcripts and tickets in `product/`.

EDGES. Every requirement in section 5 must cite its evidence or appear in section 11 — no requirement without one or the other. Never invent a metric, a baseline, a customer quote or a technical constraint. Do not add a requirement I did not ask for; if you think one is missing, put it in section 10 as a question. Do not soften my problem statement into something more comfortable.

FLAG: any requirement that seems to come from my assumptions rather than the evidence; any success metric we cannot currently measure; anywhere the evidence supports a different solution than the one I proposed.
```

- [ ] Section 5 requirements all have IDs and source citations
- [ ] Section 11 is populated — if it is empty, be suspicious
- [ ] Section 12 tells me something uncomfortable
- [ ] The problem statement still means what I meant
:::

:::tip Section 11 is the honest one
Requirements with no evidence are not automatically wrong — plenty come from strategy, from technical necessity, from a commitment you have already made. But you should know **which** requirements are in that category, because they are the ones to cut first when the estimate comes back too big.

If section 11 is empty on a first pass, that almost always means unsupported requirements were quietly given plausible-sounding evidence. Check three citations in section 5 against the actual source.
:::

## Part 3 — The adversarial pass (6 min)

:::lab Step 3 — Three attacks, in one go
```prompt
Produce `output/prd-attack.md` with three separate reviews of `output/prd.md`. Do not be constructive. Each reviewer should be someone who has seen this go wrong before.

REVIEW 1 — THE ENGINEER. What is ambiguous enough that you would build the wrong thing? What edge cases are missing? What is technically much harder than this document implies? Which requirements are actually three requirements? Where would you have to come back and ask me a question?

REVIEW 2 — THE SCEPTICAL EXEC. Why is this not worth doing? What is the opportunity cost? Which success metric is a vanity metric? Where has the PM confused a customer request with a customer problem? What would you cut to halve the scope, and what would you lose?

REVIEW 3 — THE CUSTOMER FROM THE RESEARCH. You said the things quoted in the evidence section. Does this solution actually solve your problem? What would still be annoying? What did the PM misunderstand about your situation? What would make you not adopt this?

For each review, be specific and quote the PRD directly. End with the single strongest objection across all three.
```

- [ ] At least one attack landed
- [ ] I edited the PRD in response
- [ ] The strongest objection is either addressed or explicitly accepted
:::

:::tip Review 3 is the one people skip
The customer review is uncomfortable and it is the most valuable, because it is the only one that checks whether you solved the problem rather than the request. "You asked for a bulk export because the report is too slow — this PRD gives you a faster export and the report is still slow" is exactly the kind of finding that saves a quarter.
:::

## Part 4 — Estimation readiness (4 min)

:::lab Step 4 — Is this actually buildable?
```prompt
You are the tech lead who has to estimate this. Produce `output/prd-readiness.md`:
1. Every requirement you could NOT estimate without asking a question, and the question
2. Every requirement that is underspecified — quote it and say what is missing
3. Every place two requirements could conflict
4. Every assumption you would have to make to give a number
5. A readiness verdict: could you estimate this today, or do you need another round?

Use only the PRD. Do not estimate anything — just tell me what is blocking an estimate.
```

- [ ] I know exactly what is underspecified
- [ ] I fixed the top three items myself
:::

:::concept The pattern across all three labs in this lane
Generate → attack → fix. Every time.

Cowork produces fluent, well-structured documents on the first pass. Fluency is not correctness, and a well-structured document is harder to critique than a rough one because the structure itself feels like rigour.

The adversarial pass is not optional politeness towards the process. It is the only reliable way you find out that a beautifully-written spec is ambiguous in four places.
:::

## Make it repeatable

- [ ] Save the PRD brief with your team's actual PRD section names
- [ ] Save the three-reviewer attack brief — it works on any document, not just PRDs
- [ ] Note which section your engineers always ask about, and expand it in the template
- [ ] Module 8 makes this a Skill: "PRD this brain-dump against this evidence"

## Reflect

Answer about your own work, not the practice data. Your answers save to your notebook in this browser.

```reflect
Which requirement in your PRD had no evidence behind it? Is it there for strategy, technical necessity or a commitment, or only because you assumed it?
```

```reflect
What did the customer review say you misunderstood? For a real feature you are specifying now, are you solving the problem or only the request?
```

```quiz
Q: Why must you write the problem statement yourself?
- Cowork writes them badly
+ A generated problem statement produces a spec that beautifully solves a problem nobody has
- It is faster
- Legal requires it
> The problem and the decisions cannot be derived from the artefacts. The structure, evidence links and edge cases can.

Q: Section 11 lists requirements with no supporting evidence and comes back empty. What should you do?
- Nothing; the PRD is well evidenced
+ Check three citations in section 5 against their sources — an empty section 11 usually means unsupported requirements were given plausible evidence
- Delete the section
- Add more requirements
> An honest first pass nearly always has some. Empty is a signal.

Q: Which of the three adversarial reviews do people most often skip, and why does it matter most?
- The engineer — it is too technical
+ The customer — it is the only one that checks whether you solved the problem rather than the request
- The exec — it is discouraging
- None; all three are equally used
> "Faster export, report still slow" is the class of finding that saves a quarter.

Q: Why is a well-structured generated document harder to critique than a rough one?
- It is longer
+ The structure itself feels like rigour, so fluency gets mistaken for correctness
- It uses more jargon
- It has more sections
> This is precisely why generate-attack-fix is the pattern, not generate-approve.
```

:::try Next
The last product lab: three stakeholder updates for three audiences, straight from the tracker.
:::

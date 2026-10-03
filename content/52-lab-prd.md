# Lab: The Evidence-Backed PRD

Twenty-two minutes. A brain-dump plus evidence becomes a PRD where each requirement traces to customer research, a documented constraint or an explicit assumption — and then Cowork critiques it.

This lab uses `output/discovery-report.md` and `output/themes.csv` from Lab 1. If you skipped it, run Lab 1 Parts 1–2 first.

:::warning You own the problem statement
Write or confirm two or three honest sentences about the problem before you start. Claude can help tighten the wording; you must check it against the evidence and own the decisions and tradeoffs. Fluent wording does not establish that the problem is real or worth solving.
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

Also produce `output/prd-requirements.csv` with columns id, requirement, evidence_ref, evidence_type (quote / ticket / theme / documented constraint / strategic decision / assumption / none).

INPUTS. Only `product/prd-braindump.md`, `output/discovery-report.md`, `output/themes.csv`, and the transcripts and tickets in `product/`.

EDGES. Every requirement in section 5 must cite its evidence or appear in section 11 — no requirement without one or the other. Never invent a metric, a baseline, a customer quote or a technical constraint. Do not add a requirement I did not ask for; if you think one is missing, put it in section 10 as a question. Do not soften my problem statement into something more comfortable.

FLAG: any requirement that seems to come from my assumptions rather than the evidence; any success metric we cannot currently measure; anywhere the evidence supports a different solution than the one I proposed.
```

- [ ] Section 5 requirements all have IDs and source citations
- [ ] Section 11 accurately records unsupported requirements, or says none were found
- [ ] I checked the concerns in section 12 against the evidence
- [ ] The problem statement still means what I meant
:::

:::tip Section 11 is the honest one
Customer research is one evidence source. Technical constraints, compliance obligations and explicit strategic decisions can also justify requirements; supply those records and label the basis. An assumption may be worth testing, but it should not be disguised as a customer quote. Decide what to cut using value, dependencies and obligations, not just whether a requirement has a quote.

Check decision-critical citations and an additional sample against the source. An empty section 11 can be correct; it does not prove that the citations are sound or that the review failed.
:::

## Part 3 — The adversarial pass (6 min)

:::lab Step 3 — Three attacks, in one go
```prompt
Produce `output/prd-attack.md` with three separate reviews of `output/prd.md`. Do not be constructive. Each reviewer should be someone who has seen this go wrong before.

REVIEW 1 — THE ENGINEER. What is ambiguous enough that you would build the wrong thing? What edge cases are missing? What is technically much harder than this document implies? Which requirements are actually three requirements? Where would you have to come back and ask me a question?

REVIEW 2 — THE SCEPTICAL EXEC. Why is this not worth doing? What is the opportunity cost? Which success metric is a vanity metric? Where has the PM confused a customer request with a customer problem? What would you cut to halve the scope, and what would you lose?

REVIEW 3 — THE CUSTOMER FROM THE RESEARCH. You said the things quoted in the evidence section. Does this solution actually solve your problem? What would still be annoying? What did the PM misunderstand about your situation? What would make you not adopt this?

For each review, quote the PRD and distinguish evidence-backed findings from hypotheses. If no supported objection is found, say so. End with the strongest supported objection, if any. These are simulated perspectives, not feedback from the actual engineer, executive or customer.
```

- [ ] I checked the critique against the source evidence
- [ ] I fixed confirmed problems, or recorded that none were found
- [ ] The strongest objection is either addressed or explicitly accepted
:::

:::tip Review 3 is the one people skip
The simulated customer perspective can expose a hypothesis such as "a faster export still leaves the slow report unresolved". Check it against the research and, where consequential, ask real customers. A role-play does not establish that customers would adopt the solution.
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
- [ ] I resolved the most consequential confirmed gaps with the appropriate owner
- [ ] Our actual engineering lead reviewed readiness; the simulated verdict is a preparation aid
:::

:::concept The pattern across all three labs in this lane
Generate → attack → fix. Every time.

Cowork produces fluent, well-structured documents on the first pass. Fluency is not correctness, and a well-structured document is harder to critique than a rough one because the structure itself feels like rigour.

A simulated critique is one review aid. Source checks, engineering review and customer validation provide evidence the model cannot create by adopting a role.
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
Q: Why must you own and confirm the problem statement?
- Cowork writes them badly
+ You must check that it reflects the evidence and own the decisions; fluent wording does not establish the problem's value
- It is faster
- Legal requires it
> Drafting can be delegated; responsibility for the problem and tradeoffs remains with you.

Q: Section 11 lists requirements with no supporting evidence and comes back empty. What should you do?
- Nothing; the PRD is well evidenced
+ Check consequential citations and an additional sample against their sources; an empty section alone proves nothing
- Delete the section
- Add more requirements
> Judge traceability by the actual evidence, not by requiring a minimum number of findings.

Q: What is the value and limit of the simulated customer review?
- The engineer — it is too technical
+ It can suggest a problem-versus-request gap to check against research; it does not replace actual customer feedback
- The exec — it is discouraging
- None; all three are equally used
> Treat the model's role-play as a hypothesis, then validate it with evidence and people.

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

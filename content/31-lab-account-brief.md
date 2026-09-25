# Lab: Account Research → Pre-Call Brief

Twenty minutes. You will produce a pre-call brief good enough to walk into a real first call with — and then the fan-out version that produces one for every open opportunity.

:::note Works with or without connectors
If your CRM connector is live, use it. If not, export your opportunities to CSV and drop it in `Cowork-Lab/sales/`. Every brief here works either way — swap "using the CRM connector" for "using `opportunities.csv`".
:::

## Part 1 — One account, done properly (8 min)

Pick a real account you have a call with soon. If you would rather not use real data, use one of the fictional accounts from your Module 1 practice CSV — the brief is identical, except: delete "and their public website" from INPUTS (here and in Step 2), because an invented name can match a real company.

:::lab Step 1 — The single-account brief
```prompt
BACKGROUND. I am an AE. I have a first call with [ACCOUNT NAME] on [DATE] with [NAME, TITLE]. We sell [ONE SENTENCE ON WHAT YOU SELL]. I want to walk in knowing more about them than they expect, and with three questions that make them think.

RESULT. Produce `output/briefs/[account]-brief.md`, maximum two pages, with these sections in order:

1. SNAPSHOT — industry, rough size, HQ, what they actually do, in four lines
2. WHY NOW — any trigger event: funding, leadership change, hiring pattern, product launch, regulatory pressure. With source and date for each
3. WHAT WE ALREADY KNOW — everything from our own records: CRM history, past email, prior notes, previous evaluations, any past churn. Name the source for each item
4. THE PEOPLE — who I am meeting, what their role likely owns, who else is probably in the buying group
5. LIKELY PAIN — a hypothesis about why they would care about us, tied to something specific you found. Label it as a hypothesis
6. THREE QUESTIONS — specific to this account, not generic discovery. Each one should be impossible to ask without having done the research
7. RISKS AND UNKNOWNS — what I do not know that could derail this call
8. SOURCES — every URL and file you used, with dates

Also produce `output/briefs/[account]-sources.csv`: one row per factual claim, with columns section, claim, source, date_read.

INPUTS. Our CRM record for this account, my email history with anyone at their domain, any notes in `sales/` (or your `accounts/` folder if you keep one), and their public website. Nothing else.

EDGES. Every factual claim needs a source — a URL with the date read, or a named file. If you cannot source something, leave it out rather than filling the gap. Never invent a headcount, a revenue figure, a funding round, or a named person. Do not send or draft any email. Read-only on the CRM.

FLAG separately: anything where our CRM record and their public information disagree; anything that suggests we have talked to them before and it went badly; any claim I should verify before saying it out loud.

Show me your plan and the URLs you intend to visit before you start.
```

- [ ] The brief was produced
- [ ] Every claim has a source
- [ ] It is genuinely two pages, not eight
:::

## Part 2 — Grade it honestly (4 min)

This is the part that teaches you something. Score the brief:

- [ ] **Sourcing** — can I trace every factual claim to a URL or a file?
- [ ] **Specificity** — could this brief only be about this account, or would it fit any company in the sector?
- [ ] **The questions** — are they questions I could not have asked without the research? (This is the sharpest test. Generic questions mean the research was shallow.)
- [ ] **Hypothesis** — is the "likely pain" tied to evidence, or is it a guess dressed as insight?
- [ ] **Honesty** — did it tell me what it could not find?
- [ ] **Length** — is it short enough that I will actually read it before the call?

:::tip If the questions are generic, the brief failed
"What are your current challenges with reporting?" is not a research-derived question. "You have posted four data-engineer roles in the last two months and your careers page mentions consolidating three warehouses — who owns that project now?" is.

Push back and re-run:

> "The three questions are generic. Replace them with questions that reference something specific you actually found — a trigger event, a job posting, a line on their site, something in our own history with them. If the research does not support three such questions, give me two and say so."
:::

:::warning Verify before the call, not after
Pick the two most consequential facts in the brief and check them yourself — the headcount, the funding, the name and title of the person you are meeting. A wrong title in the first thirty seconds of a call costs you the credibility that the rest of the research bought.
:::

## Part 3 — The fan-out (8 min)

Now the part that saves the afternoon. One brief per account, all at once.

:::lab Step 2 — Brief every open deal
```prompt
BACKGROUND. Same role and product as before. I have a deal review on Monday and I want a brief for every open opportunity in my pipeline.

RESULT. For each open opportunity, produce a separate file `output/briefs/<account-slug>-brief.md` using the exact same eight-section structure and heading text as the brief we just built. Identical structure in every file — I need to read these side by side.

Then produce `output/briefs/_index.md`: a table of all accounts with columns account, stage, amount, close date, days since last contact, state of play in one line, and the single most important open question. Sort by close date.

INPUTS. The CRM (or `opportunities.csv`), my email history, notes in `sales/` (or your `accounts/` folder), and each company's public website.

EDGES. Same rules: source every claim, never invent a figure or a person, read-only, write only to `output/briefs/`. Where an account has thin data, produce a short brief that says so rather than padding it out.

FLAG in the index: any account where I have had no contact in over 30 days; any where the CRM stage looks inconsistent with the actual activity; any where I appear to be talking to someone too junior to buy.

After writing every brief, review them all together and make the depth, tone and structure consistent — then tell me which three accounts have the weakest evidence base.
```

- [ ] One brief per account appeared, all with the same structure
- [ ] The index table is accurate against my real pipeline
- [ ] The final consistency pass happened
- [ ] The flags told me something I did not know
:::

:::concept Why the last paragraph matters
Two instructions in there do a lot of work.

**"Identical structure in every file"** makes fifteen documents comparable. Without it you get fifteen individually reasonable, mutually incomparable essays.

**"After writing every brief, review them all together"** fixes the Drift failure mode. Parallel subagents wrote these; they did not share notes. The consolidation pass is what makes the set coherent.
:::

## Make it permanent

- [ ] Save your working brief into a note — this is your template now
- [ ] Note which sections you always delete, and cut them from the template
- [ ] Note which section you always wish were longer, and expand it
- [ ] In Module 8, this becomes a Skill you invoke with a single line

## Reflect

Answer about your own work, not the practice data. Your answers save to your notebook in this browser.

```reflect
Think of your next real first call. Which two facts in its brief would you check yourself before you say them out loud, and where would you check them?
```

```reflect
Which of your real open deals has the weakest evidence base? What would you need to find out before your next call with them?
```

```quiz
Q: What is the sharpest test of whether an account brief is genuinely researched?
- Its length
+ Whether the three suggested questions could only have been asked about this specific account
- Whether it has a snapshot section
- How fast it was produced
> Generic questions are the tell. Real research produces questions that are impossible to ask without it.

Q: Why insist on identical section structure across fifteen account briefs?
- It looks tidier
+ So they are comparable side by side — otherwise you get fifteen good, mutually incomparable documents
- It is faster to generate
- Connectors require it
> Comparability is the whole point of a set. It comes from shared structure.

Q: The brief states a prospect's title. What should you do before the call?
- Trust it; it came from the CRM
+ Verify the two most consequential facts yourself — a wrong title in the first thirty seconds costs you all the credibility the research bought
- Ask Cowork to double-check
- Nothing, titles rarely matter
> Verification is cheapest and most valuable on the facts you will say out loud first.

Q: What does the instruction "after writing every brief, review them all together" fix?
- Formatting inconsistencies only
+ The Drift failure mode — parallel subagents wrote each brief without sharing context, so depth and judgement vary
- Connector timeouts
- File naming
> Ask for a consolidation pass whenever cross-consistency matters.
```

:::try Next
Research done. Now the deal review your manager actually wants.
:::

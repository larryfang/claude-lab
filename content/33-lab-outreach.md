# Lab: Outreach & RFP Answers at Scale

Two jobs in twenty minutes, both of which currently eat your evenings.

## Part A — Outreach that is actually personalised (10 min)

:::warning Read this before you run anything
Cowork can produce two hundred emails that look personalised and are not. That is spam with better grammar, and it damages your domain reputation, your brand, and your own credibility with the people you most want to reach.

The rule for this lab: **every email must contain at least one thing that could only be true of that recipient**, sourced from your notes or their public signals. If Cowork cannot find that one thing, it should tell you rather than pad the gap with flattery.

Twenty genuinely specific emails beat two hundred generated ones. The tool will not make that choice for you.
:::

:::lab Step 1 — A sequence for a real target list
Use a real target list of 8–15 accounts, or the practice accounts from Module 1.

```prompt
BACKGROUND. I am an AE at [COMPANY], selling [ONE SENTENCE]. I have a target list of accounts I have had no meaningful contact with. I want a first-touch email per account that is genuinely specific, plus a two-step follow-up. My aim is a reply, not a meeting booked from a cold email.

RESULT. For each account, a section in `output/outreach.md`:
- Account and recipient (name and title)
- THE HOOK — the one specific, verifiable thing about them that this email is built on, with its source
- EMAIL 1 — subject line under 45 characters, body under 110 words, one clear ask, no bullet points, no "I hope this finds you well", no "quick question"
- EMAIL 2 (day 4) — under 70 words, adds a new piece of value, does not simply "bump"
- EMAIL 3 (day 11) — under 50 words, a genuine close-the-loop that makes it easy to say no
- CONFIDENCE — high / medium / low that this hook is real and current

Then `output/outreach-log.csv`: account, recipient, title, hook, hook_source, hook_confidence, ready_to_send (yes/no).

INPUTS. My CRM records, my past email with that domain, notes in `sales/` (or your `accounts/` folder if you keep one), and each company's public website and news. Nothing else.

EDGES. Every hook must be sourced to a URL with the date, or a named file. If you cannot find a genuine, specific hook for an account, write "NO HOOK FOUND" and skip the emails for it — do not substitute generic industry commentary or flattery. Never invent a mutual connection, a shared event, a stat about their business, or a customer of ours. Do not use my company's customer names unless they appear in a file I gave you. Do not send anything.

FLAG separately: any account where the only hook I could find is over six months old; any where the named recipient looks too junior or too senior for this message; any where our own records suggest a previous bad experience.
```

- [ ] Every email has a sourced, specific hook
- [ ] Some accounts came back as "NO HOOK FOUND" — good, that is honesty
- [ ] The emails are short enough that I would read them
- [ ] Nothing invented a mutual connection or a customer name
:::

:::tip The "NO HOOK FOUND" count is your quality metric
If Cowork found a genuine hook for all fifteen accounts, be suspicious — go and verify three of them. Real research on a cold list turns up nothing useful for a meaningful share of accounts.

That is not a failure of the tool. It is information: those accounts are not ready for a personalised approach, and pretending otherwise is what makes outreach feel like spam to the person receiving it.
:::

:::lab Step 2 — The critique pass
Before you send anything, have Cowork attack its own work:

```prompt
Review every email you just wrote as if you were the recipient — a busy senior person who gets forty of these a week. For each: would you reply, and why or why not? Identify every sentence that is filler, every claim that is unverifiable, and every phrase that reveals this was generated. Rewrite the three weakest emails. Be harsh; I would rather send eight good emails than fifteen mediocre ones.
```

- [ ] It found real weaknesses
- [ ] I sent the good ones and dropped the rest
:::

## Part B — The RFP / security questionnaire (10 min)

The 200-question spreadsheet that lands on a Thursday and blocks a deal.

:::warning The non-negotiable rule
Answers to security, compliance, legal and contractual questions are **representations your company makes to a customer**. Cowork drafts and sources them. A human — usually security or legal — signs off.

Never send a generated compliance answer unreviewed. Not once, not for a small deal, not because it is Friday.
:::

Put your past responses, policies and the questionnaire in `sales/rfp/`. No RFP material to hand? Generate some first.

:::details 💼 No RFP files? Generate a practice set
```prompt
In the `sales/rfp/` subfolder, create realistic but entirely FICTIONAL practice data so I can learn on it. Invent all company names, policies and certifications — do not use any real company.

Create:
- `questionnaire.xlsx` — 30 security and procurement questions in one column, with an empty answer column.
  Make it deliberately messy: two questions that ask the same thing in different words, one question with two parts, and three questions on topics that none of the files below cover.
- `past-response-2025.txt` and `past-response-2026.txt` — two past RFP answers, 15–20 question-and-answer pairs each. Date the 2025 one more than 12 months ago, and make the two disagree on one answer (for example, the data retention period).
- `security-policy.txt` — a 20-line security policy that describes one control as "partially implemented".

Leave everything loose in `sales/rfp/`. Do not organise it.
```
:::

:::lab Step 3 — Build the answer bank first
The reusable asset is not the response. It is the answer bank.

```prompt
BACKGROUND. I answer the same security and procurement questions repeatedly and rewrite them each time.

RESULT. `output/answer-bank.md` — from every source I have given you, extract each distinct question that has been asked of us and the best available answer. Group by topic (data handling, encryption, access control, availability, subprocessors, certifications, support, commercial terms). For each entry: the canonical question, the answer, the source document and date, and a freshness flag (current / needs review / stale) based on the source's date.

INPUTS. Past RFP responses, our security documentation, our trust centre pages, and any policy documents in `sales/rfp/`. Nothing else — do not use general knowledge of what companies typically answer.

EDGES. Never write an answer you cannot source to one of my documents. Where sources disagree, show both and flag the conflict rather than picking one. Do not soften or strengthen a claim from its source wording — quote or closely paraphrase.

FLAG: every topic where I have no source at all, and every answer whose source is over 12 months old.
```

- [ ] The answer bank was produced
- [ ] Every answer has a source and a date
- [ ] The gaps are listed explicitly
:::

:::lab Step 4 — Answer the actual questionnaire
```prompt
BACKGROUND. This questionnaire is blocking a deal. It has [N] questions. I need a first pass I can hand to our security lead for review, with the easy ones done and the hard ones clearly marked.

RESULT. `output/rfp-response.xlsx` with the original questions and these columns added: draft_answer, source_document, source_date, confidence (high / medium / low), needs_human_review (yes/no), reviewer (security / legal / product / commercial), notes.

Then `output/rfp-summary.md`:
- How many questions you answered with high confidence, medium, low, and not at all
- Every question you could NOT answer, grouped by who needs to answer it
- Every question where our answer is likely to be a problem for this customer, and why
- The three questions that most need a human before this goes back

INPUTS. Only the questionnaire in `sales/rfp/` and `output/answer-bank.md`.

EDGES. Never invent a certification, a control, an SLA, a subprocessor, or a compliance status. If the answer bank does not cover it, mark it "NO SOURCE — requires human answer" and leave draft_answer empty. Do not upgrade a "partially" into a "yes". Mark every answer needs_human_review = yes for anything touching security, compliance, legal or a contractual commitment.

FLAG: any question where a truthful answer is likely to lose us the deal — I need to know that now, not after we submit.
```

- [ ] The spreadsheet has drafts and clear gaps
- [ ] Nothing was invented — check five answers against the answer bank
- [ ] Everything security-related is marked for human review
- [ ] The "likely to be a problem" flags are genuinely useful
:::

:::tip The third flag is the strategic one
"Which truthful answers will hurt us" turns a compliance chore into deal intelligence. Knowing on Thursday that you will fail their data-residency requirement is worth far more than a beautifully formatted response submitted on Friday that fails it anyway.
:::

## Verify

- [ ] Five outreach hooks traced to their sources — all real?
- [ ] Five RFP answers traced to the answer bank — all faithful to the source wording?
- [ ] Nothing customer-facing left without a named human reviewer
- [ ] The answer bank saved somewhere permanent — it is now a team asset

## Reflect

Answer about your own work, not the practice data. Your answers save to your notebook in this browser.

```reflect
How many accounts on your real target list came back NO HOOK FOUND? What does that tell you about which of them are ready for a personalised approach?
```

```reflect
Which answer your team gives on security questionnaires is most likely to be stale, and which named human should review it before the next one goes out?
```

```quiz
Q: Cowork found a specific hook for all fifteen accounts on a cold list. What should you do?
- Send them all
+ Be suspicious and verify three — genuine research on a cold list turns up nothing useful for a meaningful share of accounts
- Ask for more accounts
- Nothing; that is a good result
> A "NO HOOK FOUND" count of zero usually means the gaps were filled with plausible generic commentary.

Q: What is the reusable asset in RFP work?
- The finished response document
+ The sourced, dated answer bank — the response is disposable, the bank compounds
- The spreadsheet template
- The list of reviewers
> Build the bank once; every future questionnaire gets cheaper.

Q: A questionnaire asks about a certification that your answer bank does not mention. What must the draft answer say?
- The nearest equivalent certification
+ "NO SOURCE — requires human answer", with draft_answer left empty
- That it is in progress
- Nothing; skip the row
> Never invent a compliance status. An empty flagged cell is safe; a plausible sentence is a false representation.

Q: Why ask Cowork to flag "questions where a truthful answer is likely to lose us the deal"?
- To help write around them
+ Because it turns a compliance chore into deal intelligence — you learn about a blocking gap now rather than after submission
- To reduce the number of questions
- It is required for security review
> Knowing you will fail their data-residency rule on Thursday is worth more than a tidy response on Friday.
```

:::try Module complete
That is your **💼 The Closer** badge. Now either carry on to the GTM lane, or jump to Module 8 to make these plays repeatable.
:::

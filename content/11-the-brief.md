# The B.R.I.E.F. Framework

A useful brief makes the task, sources, and review criteria explicit. It reduces avoidable back-and-forth, though access to the right data and tools still matters.

This course uses **B.R.I.E.F.** as a checklist for that description. It is a course mnemonic, not an official Claude command or a guarantee of quality. For small tasks, one clear sentence can cover several parts.

:::concept B.R.I.E.F.
| Letter | Means | The question it answers |
|---|---|---|
| **B** | **Background** | Who are you, what is the situation, who is this for? |
| **R** | **Result** | What exactly do I get at the end — file names, formats, sections? |
| **I** | **Inputs** | Which sources may it use, and which may it not? |
| **E** | **Edges** | What are the rules, limits, and things it must never do? |
| **F** | **Flag** | What should it tell me about rather than silently decide? |
:::

## The five parts, one at a time

### B — Background

Cowork does not know your company. Two or three sentences of context change the output more than any other single thing.

> ❌ "Write a competitive battlecard for Northwind."
>
> ✅ "I am a PMM at a mid-market payments company. Our AEs lose deals to Northwind on price and win on integration depth. This battlecard is for AEs to read in the 90 seconds before a call — not for marketing."

The second version already knows the deals it needs to help win, the reader, and the reading time.

### R — Result

Name the artefact. Name the sections. Name the file.

> ❌ "Give me a summary."
>
> ✅ "Produce `output/deal-review.md` with four sections in this order: (1) a one-sentence headline, (2) a table of deals ranked by risk, (3) the three deals needing a decision this week with the specific evidence, (4) a paste-ready Slack summary of four sentences or fewer."

If you cannot describe the result, you are not ready to delegate it. That is useful information, not a failure.

### I — Inputs

Be explicit about what to read — and, when it matters, what to ignore.

> ✅ "Use only the transcripts in `discovery/` and the ticket export `support-tickets.csv`. Do not use the web. Do not use anything in `archive/` — that data is from a different product."

:::tip "Do not use the web" is a real instruction
Restricting sources gives you a defined evidence set to check. Claude can still infer or invent a claim, so ask for a source location and verify that it actually supports the claim. The instruction does not switch off the model's general knowledge.
:::

### E — Edges

The rules. This is where you prevent the specific failure modes that hurt in your job.

The five that earn their place in almost every brief:

- **"Never estimate a missing number — write 'not recorded'."**
- **"Every claim about a customer needs a verbatim quote and its source file."**
- **"Do not invent company names, prices, or dates."**
- **"Write only to `output/`. Do not modify anything in the source folders."**
- **"Show me your plan before you start."**

### F — Flag

The most-skipped letter, and the one that turns output from a document into a decision aid.

Cowork may resolve ambiguity without asking. Say which decisions need your input.

> ✅ "Flag separately, rather than deciding for me: anywhere two sources contradict each other; anywhere you had to infer rather than read; any row you excluded from a total and why; anything that looks like a data-entry error."

That last instruction is what surfaces the four blank rows you would otherwise never have known were excluded from the total.

## Before and after

**A prompt:**

```prompt
Summarise the customer interviews and tell me what to build.
```

**A brief:**

```prompt
I am a PM on a reporting product. We ran eight discovery calls to decide our Q4 focus, and I have to defend the choice to a leadership review on Thursday.

Using only the transcripts in `discovery/` and the ticket export `support-tickets.csv`, produce two files in `output/`:

1. `themes.csv` — one row per theme: theme, customer_count, customer_names, supporting_ticket_ids, arr_affected, confidence (high/medium/low) and one line on why that confidence.

2. `discovery-report.md`:
   - The five strongest themes, ranked by weight of evidence, each with two verbatim quotes attributed to customer and source file
   - What the support tickets confirm or contradict about each theme
   - A "what we still do not know" section with the three questions to ask next

Rules: every claim needs a quote or a ticket ID. Never estimate a missing number — write "not recorded". Do not use the web. Write only to `output/`.

Flag separately rather than resolving: any two customers who contradicted each other (quote both), anything you inferred rather than read, and any theme where the evidence is thinner than it looks.

Show me your plan before you start.
```

This version names the inputs, output, and unresolved decisions. You can inspect its result against those requirements; time saved will depend on the task and the quality of the inputs.

## Define what would count as done

Add one observable acceptance check before you run the brief. For the discovery report above: **every theme has traceable evidence; unsupported themes stay in an open-questions section; the report does not decide the roadmap for you.**

When the method matters, describe it too: deduplicate by customer before counting, separate quotations from interpretation, and ask before changing the grouping. This applies the [Description–Discernment loop](https://academy.claude.com/courses/ai-fluency-framework-foundations/the-description-discernment-loop): describe, inspect, give specific feedback, and inspect again.

:::tip Have Claude write your brief
Genuinely the fastest way to get good at this. In ordinary chat:

> "I want to delegate this job to Claude Cowork: [messy description of what you want]. Write me a brief using Background / Result / Inputs / Edges / Flag. Ask me any question you need answered first."

The questions it asks are the parts of your own thinking that were vague.
:::

:::tip The gap-analysis opener
For anything built from scattered sources, one sentence at the top of the brief pays for itself: *"Before producing anything, list the information you found and any gaps that would weaken the result. Wait for my response."* It surfaces the missing input — or the two stakeholders pointing in different directions — before it gets baked into a fluent document ([practitioner pattern](https://thecreatorsai.com/p/claude-cowork-for-marketing-a-playbook)).
:::

## Three habits that compound

1. **Save your good briefs.** A brief that worked is an asset. Keep a note file. Module 8 turns the best of them into Skills.
2. **Improve the result and the reusable brief.** Give specific feedback on a weak result. If the cause was a missing requirement, add it to the saved brief; if it was bad data or a tool failure, fix that cause.
3. **Ask for the thing you actually want.** People ask for a summary when they want a decision, a report when they want a list of what is broken. Say the real thing.

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What does each letter of **B.R.I.E.F.** stand for?
A: **B**ackground, **R**esult, **I**nputs, **E**dges, **F**lag.
Q: Which letter is skipped most often, and what does it do?
A: **Flag.** It tells Cowork what to surface to you instead of deciding silently.
Q: Why write "do not use the web" in a brief?
A: It defines the permitted evidence set. You must still check the cited source; the instruction does not prevent unsupported claims.
Q: A run disappoints. What do you inspect first?
A: Compare the result with your acceptance checks. Diagnose the cause: missing instruction, bad data, tool failure, or a specific output error. Save reusable corrections in the brief.
Q: What does a good **Result** name?
A: The artefact, its sections in order, and the file name and format.
Q: What is the gap-analysis opener?
A: "Before producing anything, list the information you found and any gaps that would weaken the result. Wait for my response."
```

```quiz
Q: Which part of B.R.I.E.F. prevents Cowork silently resolving an ambiguity it should have escalated?
- Background
- Result
+ Flag
- Inputs
> Flag tells Cowork what to surface rather than decide. It is the most-skipped and highest-value letter.

Q: Why is "do not use the web; use only these three files" a useful constraint?
- It makes runs cheaper
+ It defines a permitted evidence set whose citations you can check
- Web access is unreliable
- It avoids copyright issues
> Source limits help you review. They do not guarantee the model used only those sources or interpreted them correctly.

Q: A run produces a report with a total that quietly excluded four rows with blank values. Which instruction would have caught it?
- "Be accurate"
- "Use a table"
+ "Flag any row you excluded from a total, and why"
- "Show me your plan"
> Exclusions are invisible unless you ask for them. "Be accurate" is not an instruction, it is a wish.

Q: Your brief produced a well-written document that answered the wrong question. What is the right response?
- Rewrite the document by hand
+ Work out which B.R.I.E.F. element was missing and fix the brief, so every future run improves
- Try a different model
- Split it into ten smaller prompts
> Fix the brief, not the artefact. Briefs are reusable; hand-edited documents are not.
```

:::try Next
You know the five parts. Now: what to ask for as the Result — because "a document" is leaving most of the value on the table.
:::

# Lab: Transcripts → Insight Report

Twenty-two minutes. Six or eight interviews become a themed, quote-backed report you could defend in a leadership review where two directors already have preferred answers.

:::note Data
Use real transcripts if you have them — anonymise first if that is your policy. Otherwise use the practice `product/` transcripts from Module 1, which include two customers who deliberately contradict each other.

Want real-world scale instead? All 320 transcripts of Lenny's Podcast are open-sourced ([github.com/ChatPRD/lennys-podcast-transcripts](https://github.com/ChatPRD/lennys-podcast-transcripts)) — Lenny Rachitsky himself ran this exact synthesis over the full set with Cowork in about 15 minutes ([his account](https://x.com/lennysan/status/2010840092865413254)). Download a dozen into `product/` for a bigger practice run.
:::

## Part 1 — Inventory before synthesis (5 min)

Do not jump to themes. First find out what you actually have, because synthesis quality is capped by evidence quality and you want to know that up front.

:::lab Step 1 — The evidence inventory
```prompt
BACKGROUND. I am a PM deciding our Q4 focus. Before you synthesise anything, I need an honest inventory of the evidence base.

RESULT. `output/evidence-inventory.md`:
1. A table of every source file: filename, who it appears to be, their apparent role and segment, rough length, and the date if determinable
2. Coverage assessment — which segments, roles and company sizes are represented, and which are conspicuously absent
3. Quality assessment — which transcripts are substantive and which are thin, with a one-line reason each
4. Leading questions — anywhere the interviewer appears to have led the customer to an answer. Quote them
5. Any transcript that is mostly us talking rather than them
6. An honest statement of what this evidence base can and cannot support a decision about

INPUTS. Only the files in `product/`.

EDGES. Do not begin theming yet. Do not summarise content — assess it. Never guess a customer's segment or size if it is not stated; write "not stated".

FLAG: anything suggesting the sample is skewed, and any source you are unsure how to categorise.
```

- [ ] It told me which segments are missing
- [ ] It found leading questions, or confirmed there were none
- [ ] Section 6 is an honest limit statement
:::

:::tip This step reframes everything after it
"Six interviews, five of them enterprise, four sourced from the same customer-success manager" is a completely different evidence base from "six interviews across three segments". Both produce a confident report. Only one of them supports a strategy decision, and you want to know which you have before you start theming.
:::

## Part 2 — The synthesis (9 min)

:::lab Step 2 — Themes with traceable evidence
```prompt
BACKGROUND. Same context. I present to a leadership review on Thursday, where two directors already have competing preferred answers and will look for holes.

RESULT. Two files in `output/`:

`themes.csv` — one row per theme: theme, customer_count, customer_names, source_files, supporting_ticket_ids, arr_affected, first_mentioned_date, confidence (high/medium/low), confidence_reason.

`discovery-report.md`, in this order:

1. WHAT WE HEARD — one paragraph. The honest headline
2. THE FIVE STRONGEST THEMES — ranked by weight of evidence, not by how compelling they sound. For each: the theme in the customer's own language, how many customers raised it and who, two verbatim quotes attributed to customer and source file, what the support tickets confirm or contradict, and how confident we should be and why
3. CONTRADICTIONS — anywhere two customers disagreed. Quote both sides. Do NOT resolve it. Add one line on what the disagreement might be telling us about segmentation
4. THE QUIET SIGNAL — one theme raised by only one or two customers that you think matters strategically. Flag your reasoning explicitly as inference
5. WHAT WE ASSUMED THAT IS NOT SUPPORTED — anything in my own framing or questions that the evidence does not back up
6. WHAT WE STILL DO NOT KNOW — the three questions to ask on the next call, and who to ask
7. HOW TO ATTACK THIS REPORT — the three strongest objections a sceptical director could raise about this evidence base

INPUTS. Only the transcripts and ticket export in `product/`, plus `output/evidence-inventory.md`.

EDGES. Every claim needs a verbatim quote or a ticket ID. Label anything inferred as "inference". Never invent or paraphrase a quote — if you cannot quote it exactly, do not claim it. Never estimate ARR or a customer count; write "not recorded". Rank by weight of evidence, not rhetorical force.

FLAG: any theme driven mainly by one loud customer; any theme where the quotes are weaker than the ranking implies; anywhere a customer's words could support two different themes.
```

- [ ] Every theme has real quotes with attribution
- [ ] Section 3 has genuine unresolved contradictions
- [ ] Section 7 exists and the objections are real
- [ ] Nothing invented an ARR figure
:::

:::warning Verify three quotes, right now
Pick three quotes from the report and find them in the source transcripts. Word for word.

This is the single most important check in the whole lane. A **paraphrase presented as a quotation** is the most damaging error in a research document, because you will read it out in a review with quotation marks in your voice — and if the customer ever sees it, you have misrepresented them. Working PMs bake the rule into their skills verbatim — *"Never paraphrase a quote and present it as a direct quote"* ([Stuart Miller's PM guide](https://haverin.substack.com/p/claude-cowork-for-product-managers)).

If any quote does not match exactly, re-brief:

> "I checked three quotes and [describe what you found]. Re-verify every quotation in the report against its source file, character by character. Where the wording differs at all, either correct it to the exact source text or convert it to a clearly-marked paraphrase. List every one you changed."
:::

## Part 3 — Section 7 is the real deliverable (4 min)

:::lab Step 3 — Pre-mortem your own review
```prompt
You are the most sceptical director in Thursday's review. You believe the answer is [THE COMPETING VIEW], and you think this research was run to justify a conclusion I had already reached.

Produce `output/review-prep.md`:
1. The five questions you would ask to undermine this report, hardest first
2. For each: the best honest answer available from the evidence, and where that answer is weak
3. The one question I genuinely cannot answer with this evidence base
4. What you would need to see to be convinced
5. Where you think I have confused what customers said with what I already believed

Be specific and be uncomfortable. Do not be constructive.
```

- [ ] It found a question I could not answer
- [ ] I know where my evidence is weakest before the meeting
:::

:::tip This is worth more than the report
The report tells the room what you found. This tells you what happens in the room. Section 3 in particular — "the one question I cannot answer" — is the difference between saying "I do not know, and here is how I would find out" with composure and being caught out.
:::

## Part 4 — Form your own view (4 min)

The last step, and the one you must do yourself.

:::lab Step 4 — Your judgement, in your words
- [ ] Close the report. Write down, from memory, what you think the top priority is and why
- [ ] Now compare it to the report's ranking
- [ ] Where you differ, work out which one of you is wrong — and note it
- [ ] Write your own two-sentence recommendation. In your own words, not the report's
- [ ] If you cannot explain the ranking without re-reading the report, you have not formed a view yet
:::

:::concept Why this step is in the lab
Fluent synthesis makes it very easy to skip forming a view. You read a well-argued ranking, agree with it, and carry it into the meeting — and when someone asks why item three beats item four, the honest answer is "because it was in that order".

The report is evidence. The recommendation is yours. Write it in your own words and you will be able to defend it.
:::

## Make it repeatable

- [ ] Save the inventory and synthesis briefs as a two-step sequence
- [ ] Note your actual segment taxonomy so it does not get re-derived each time
- [ ] Note the sections you always want and the ones you always delete
- [ ] Module 8 makes this one Skill: "synthesise the transcripts in this folder"

## Reflect

Answer about your own work, not the practice data. Your answers save to your notebook in this browser.

```reflect
When you checked three quotes word for word against their transcripts, what did you find? Which research document of yours needs the same check before its next review?
```

```reflect
Did the priority you wrote from memory match the report's ranking? Where they differed, which one of you was wrong, and why?
```

```quiz
Q: Why run an evidence inventory before theming?
- To count the files
+ Because synthesis quality is capped by evidence quality — "six interviews, five enterprise, one source" supports a very different decision from "six across three segments", and both produce confident reports
- To find the shortest transcripts
- Because Cowork needs the file list
> You want to know what your evidence can support before you build a strategy on it.

Q: What is the most damaging error in a research synthesis?
- A wrong theme ranking
+ A paraphrase presented as a verbatim quotation — you will repeat it with quotation marks in your voice, and it misrepresents the customer
- A missing section
- Too many themes
> Verify three quotes against source, word for word, every time.

Q: What should the synthesis do with contradicting customers?
- Resolve toward the larger account
+ Quote both, leave it unresolved, and note what the disagreement suggests about segmentation
- Drop both
- Report only the majority view
> Contradiction is usually the most informative thing in the data.

Q: Why does the lab end with "write your own recommendation from memory"?
- To test recall
+ Because fluent synthesis makes it easy to carry someone else's ranking into a meeting as if it were your view — and you cannot defend what you did not form
- To create another document
- To check the report is accurate
> If you cannot explain the ranking without the document open, it is not your ranking.
```

:::try Next
The PRD — with an adversarial pass that attacks your own spec.
:::

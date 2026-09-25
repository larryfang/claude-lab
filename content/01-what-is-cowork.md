# Cowork in Eight Minutes

There is exactly one idea to absorb in this lesson. Everything else in the course is technique.

:::note Cowork and chat are merging (16 Sep 2026)
Anthropic is combining chat and Cowork into one Claude, starting with Pro and Max ([announcement](https://claude.com/blog/cowork-is-now-claude), [Help Center](https://support.claude.com/en/articles/16761823)). If your message box shows **Chat** and **Cowork**, choose **Cowork**. If you are on Pro or Max and there is no such choice, you already have the new Claude: every conversation can take a Cowork task. The shift below — from prompt to outcome — is the same in both.
:::

:::concept The shift: from prompt to outcome
- **Chat** is organised around the **prompt**. You ask, it answers, you copy, you paste, you ask again. *You* are the project manager.
- **Cowork** is organised around the **outcome**. You describe the finished thing you want. Claude plans the steps, reads the files, does the work, and hands you a deliverable.

Same model. Completely different unit of work.
:::

## What that looks like in practice

Here is the same job, both ways.

**Chat version** — you are the glue:

> "Summarise this transcript." → paste → read → "now this one" → paste → read → … × 8 → "find the common themes in these summaries" → paste all eight → "now format that as a report" → copy into Docs → fix the headings.

Roughly 40 minutes of clicking, and you did the boring parts.

**Cowork version** — one brief:

```prompt
The folder `discovery-calls/` has eight customer interview transcripts.

Produce `insights-report.docx` containing:
1. The 5 strongest recurring themes, ranked by how many customers raised them
2. For each theme: 2–3 verbatim quotes with the customer name and file it came from
3. Any theme raised by only one customer but that sounds strategically important — flagged separately
4. A short "what we still do not know" section

Show me your plan before you start.
```

You read the plan, approve, walk away, come back to a finished document.

## What makes Cowork different from chat

- **It works on your real files.** Cowork reads from and writes to folders you choose. No upload/download dance.
- **It produces real deliverables.** Not text in a chat window: `.xlsx` with working formulas, `.pptx` decks, formatted `.docx`, organised folders, CSVs.
- **It divides and conquers.** Big jobs get split across **subagents** working in parallel, so twelve accounts do not take twelve times as long.
- **It runs on a schedule.** Save a job, have it run every Monday at 8am. A one-off chat message cannot do this.
- **It remembers.** **Projects** give recurring work a persistent workspace with its own files, instructions and memory.
- **It can use the web.** In its built-in browser in Claude Desktop, or in your own Chrome with **Claude in Chrome**, it opens sites, reads pages, and fills forms.

## The four Claude surfaces, and when to use which

| Surface | Reach for it when | Example |
|---|---|---|
| **Claude.ai / chat** | You need an answer or a paragraph, right now | "Tighten this subject line" |
| **Claude Desktop chat** | Same, plus desktop extensions that reach files on your computer | "What did this account say on the last call?" |
| **Cowork** | You want a **finished multi-step job** with real output files | "Build me a deal review pack for all 14 open opps" |
| **Claude Code** | The job is a **codebase** | "Add rate limiting to this service" |

:::tip The Cowork test — five ingredients
[Anthropic's own checklist](https://claude.com/blog/best-practices-for-getting-started-with-claude-cowork) for a good Cowork task: it draws on **multiple inputs**, it produces a **file deliverable**, it **recurs**, you have a **clear quality bar** (you already know what good looks like, so you can verify fast), and the middle steps are **boring** — extracting, compiling, reconciling. You do not need all five, but a good candidate hits a few.

✅ Good fits
- "Research these 12 accounts and give me a pre-call brief each."
- "Turn this campaign CSV into an exec readout with a funnel model."
- "Every Friday, compile what shipped and draft the stakeholder update."
- "Answer the 60 questions in this security questionnaire from our docs, and flag anything you cannot source."

❌ Just use chat
- "What is a good name for this feature?"
- "Explain MEDDICC to me."
- "Reword this paragraph."
:::

## What Cowork is not

Being honest about this saves you a week of disappointment.

- **It is not a source of truth.** It reports what it read. If your CRM is wrong, your brief is wrong.
- **It does not have judgement about your business.** It will happily rank a roadmap. It does not know your strategy.
- **It is not deterministic.** Run the same brief twice, get two slightly different documents. Fine for a draft, not fine for a system of record.
- **It is not free of consequences.** It changes real files in the folders you grant. That is the point, and the risk.

## The trust model, briefly

Cowork needs more trust than chat because it can act. You keep control in four ways; the next lesson sets up the first two:

1. **You choose the folders** it can reach. It works there, not across your whole machine.
2. **You see the plan** before it acts, and you can interrupt mid-run.
3. **Code and shell commands run isolated.** But **computer use** — Claude clicking and typing directly in the apps on your screen — is **not** sandboxed, and either way it can genuinely change the files you shared.
4. **You review the output.** Non-negotiable. Module 9.

:::warning Requirements and expectations
Cowork needs a **paid plan** (Pro, Max, Team or Enterprise). It runs on desktop, web and mobile. This course uses the **Claude Desktop app** because the labs depend on reliable local-folder access; a cloud session can reach a folder you connected on your computer only if the session was started in Desktop, and only while Desktop stays open on that computer. Cowork **ships fast and evolves quickly**, so screens and features shift. If your interface differs slightly from these lessons, that is expected — the concepts and the briefs still hold. Frame every UI instruction in this course as "look for something that does this", not "click exactly here".
:::

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What is chat organised around, and what is Cowork organised around?
A: Chat is organised around the **prompt**; Cowork around the **outcome**. Same model, completely different unit of work.

Q: What are the five ingredients of the Cowork test?
A: **Multiple inputs**, a **file deliverable**, it **recurs**, a **clear quality bar**, and **boring** middle steps. You do not need all five — a good candidate hits a few.

Q: Is Cowork a source of truth?
A: No. It reports what it read. If your CRM is wrong, your brief is wrong.

Q: You run the same brief twice. What should you expect?
A: Two slightly different documents. Cowork is not deterministic — fine for a draft, not fine for a system of record.

Q: What is genuinely **not** sandboxed in Cowork?
A: **Computer use** — Claude clicking and typing directly in the apps on your screen. Code and shell commands run isolated, and either way it can change the files you shared.

Q: What are the four ways you keep control of Cowork?
A: You choose the folders, you see the plan (and can interrupt), code and shell run isolated, and you review the output.
```

```quiz
Q: The core difference between Chat and Cowork is best described as…
- Cowork runs a bigger model
+ Chat is organised around prompts (turn by turn, you coordinate); Cowork is organised around outcomes (describe the result, it does the whole job)
- Cowork only works for engineers
- Chat cannot read files at all
> Same brain. Cowork takes on whole jobs autonomously and produces finished deliverables.

Q: Which of these is the best fit for Cowork rather than chat?
- "Suggest three names for this feature"
+ "Read these 40 support tickets, group them by root cause, and produce a spreadsheet with counts and example ticket IDs"
- "What does ARR stand for?"
- "Make this sentence shorter"
> Multi-step, touches many files, produces a real deliverable. Classic Cowork.

Q: What is genuinely NOT sandboxed in Cowork?
- Reading files in a granted folder
- Writing a spreadsheet
+ Computer use — when Cowork clicks and types directly in the apps on your screen
- Asking it a question
> Code and shell run isolated; computer use does not. And in every mode it can really change files in folders you granted.

Q: You run the same brief twice and get two slightly different reports. This means…
- Something is broken
+ Nothing is broken — Cowork is not deterministic, which is fine for drafts and wrong for a system of record
- You need to restart the app
- Your connector failed
> Expect variation. Where you need repeatability, encode the format in a Skill (Module 8) and still review the output.
```

:::try Next
Now we get you set up — with a sandbox you cannot damage anything from.
:::

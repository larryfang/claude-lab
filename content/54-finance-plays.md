# The Six Finance Plays

Finance is the lane where Cowork's output is easiest to check and most dangerous to get wrong. Everything reconciles to something — which means every deliverable in this lane can be verified, and must be.

It is also the lane Anthropic has invested in most heavily: an official **Finance plugin** (variance analysis, reconciliation, journal entries, income statements, SOX testing), a set of **finance agent templates** on paid plans — including a month-end closer — and the **Claude for Excel add-in**, which reads and writes live formulas and preserves cell dependencies. You will meet all three in this lane — though note the add-in only reaches you once your IT deploys it to the company Microsoft 365 tenant, so every lab here is built on the path that works today: exported files in your Cowork folder.

:::concept Where the time actually goes
The close, the variance commentary, the reconciliations, the chase emails, the board pack — finance runs on recurring, multi-source, deadline-driven document production. That is precisely the shape of work Cowork is built for. The judgement calls — what the numbers *mean*, what to accrue, what to tell the board — stay yours.
:::

## Play 1 — The month-end variance pack · the flagship

**The job:** budget vs actuals in, a variance pack out — by GL line, by driver, with a narrative a CFO would actually read.

**Why it is the best starting play:** the inputs are structured, the maths is mechanical, the output is a document you currently assemble under close-week pressure, and every number in it can be traced back to a source row. It is the perfect play to learn verification on.

**Shape of the brief:** decompose each material variance into its drivers (volume, rate, mix, timing, one-off), rank the favourable and unfavourable movements, build the waterfall, and write the "what changed and what needs attention" narrative — with every figure traceable.

**Lab 1 builds this.**

## Play 2 — The three-way reconciliation · hours per close

**The job:** bank statement, payments report, invoice ledger — matched, with an exception report of everything that does not tie.

**Why it works:** matching by reference across three files is exactly the tedious, error-prone middle work you want off your desk. The value is not the matches; it is the **exception report** — duplicates, missing settlements, fee discrepancies, each with its financial impact.

**The rule that makes it safe:** *never force a match*. An unmatched item reported honestly is useful; a plausible match invented to make the file tie is a corruption of your books wearing a tidy spreadsheet.

**Lab 2 builds this.**

## Play 3 — Debtors ageing and the chase drafts · ~1 hr/week

**The job:** from the ageing report, tone-graded chase emails — friendly at 1–30 days, firm at 31–60, escalation at 61–90, final notice beyond — saved as **drafts, never sent**.

**Why it works:** the logic is conditional and mechanical, the personalisation comes from real invoice data, and the human review step (you, reading the drafts before anything goes out) is built into the design rather than bolted on.

**Lab 2 covers this too.**

## Play 4 — The driver-based forecast · ~quarterly, high leverage

**The job:** decompose the P&L into its levers, put every assumption in a labelled editable cell, and project twelve months where every line is a formula — so the model answers "what if" by changing a cell, not by asking for a re-run.

**Why the discipline matters here:** multi-step numeric inference is where errors creep in. Chain the work — decompose first, agree the drivers, then build — rather than asking for a finished forecast in one mega-prompt.

**Lab 3 builds a small one.**

## Play 5 — The board pack · monthly

**The job:** from the model and the variance pack, a board-ready deck where every number traces to the workbook and every limitation is stated plainly.

**The honest limit:** Cowork will happily produce a deck that *smooths* — a limitation softened into a positive framing, a miss reframed as "in line with expectations". In this lane that is not a style problem; it is a misrepresentation problem. The brief must forbid it, and your review must check for it.

**Lab 3 builds this.**

## Play 6 — The repeatable close · the compounding one

**The job:** your close checklist as a runnable sequence — tasks, preparers, reviewers, sign-offs — plus a **proofreading pass that traces every number in every close document back to a verified source** before anything is circulated.

**Why it compounds:** the close happens every month forever. Anthropic ships a **Month-end closer** agent template you can start from, and Module 8 turns your version into a Skill on a schedule. The proofreading pass is the first Skill worth building in this lane — build it before you automate anything else.

:::concept In the field: 150 skills, written by accountants
Anthropic's own finance team runs roughly **150 shared skills from a version-controlled GitHub repo** — written by accountants and FP&A analysts, not IT. Their design rules are worth copying verbatim: every skill must **flag exceptions explicitly**; any skill producing journal entries needs a **checking tab confirming debits equal credits**; and human review is mandatory before anything touches the ledger. Their own honesty about limits: full auditability is *"still a work in progress."*
([webinar](https://www.anthropic.com/webinars/how-finance-teams-use-claude-cowork) · [CFO Connect recap](https://www.cfoconnect.eu/resources/finance-insights/anthropic-finance-team-claude-skills/))
:::

## The official shortcuts

:::tip Plugin first, custom second
Before writing anything from scratch, look at what ships ready-made (availability varies by plan; look under **Customize → Plugins** and the template gallery):

- **Finance plugin** — `/variance-analysis`, `/reconciliation`, `/journal-entry`, `/income-statement`, `/sox-testing`. Anthropic's own caveat applies: outputs require review by qualified financial professionals before use in reporting or filings.
- **Finance agent templates** — ten of them on paid plans, including a Month-end closer, a general-ledger reconciler and a statement auditor.
- **Claude for Excel** — the add-in reads live formulas, edits without breaking dependencies, and debugs `#REF!`/`#VALUE!` errors. For spreadsheet-heavy work it is often the better surface than a chat window — **where your IT has deployed it**. Office add-ins are admin-controlled on company tenants, so if you do not see it, that is a request to IT (name the close-week job and the hours), not a download. Until then, exports into Cowork do every job in this lane.

The labs in this lane teach you the underlying briefs, so you understand what the shortcuts do — and can fix them when they miss.
:::

:::note Enterprise vs everyone
The market-data connectors you may have read about — FactSet, S&P Capital IQ, Moody's, LSEG and friends — are **enterprise-tier** Claude for Financial Services features. On a normal Pro or Team plan you work from exported files, your Drive/M365 connectors (where IT has enabled them), and — where IT has deployed it — the Excel add-in. Everything in this lane is built on the everyone tier, and runs on exported files alone.
:::

## What Cowork must not do in finance

- **It does not post journal entries.** It drafts them, with workings. A human who is accountable posts.
- **It does not sign off a reconciliation.** It produces the exception report; the reviewer clears the exceptions.
- **It does not decide what to tell the board.** It assembles the evidence; the framing is a judgement you are paid for.
- **It does not send a chase email.** Drafts only, every time.
- **It never estimates a missing value.** "Not recorded" is the only acceptable filler. This rule goes in every finance brief, without exception.

:::warning Confident wrong numbers
Cowork will occasionally present a wrong number with complete confidence — a total that quietly excluded blank rows, a rounded figure presented as exact, a subtotal from the wrong tab. In marketing that is embarrassing. In finance it can end up in a filing.

The discipline is mechanical, not heroic: **every figure traces to a source**, row counts in and row counts out are stated on every calculation, and the person who reviews and posts remains responsible. The tool changes how fast the pack gets drafted. It changes nothing about whose name is on it.
:::

## Pick your first play

- [ ] Which of these six eats the most of my close week?
- [ ] Which do I most often do shallowly because there is no time?
- [ ] Which one, if it were reliably good, would change my month?

That third answer is your first Skill in Module 8.

## Make the call

Choose what you would do, read the consequence, then try the other options.

```scenario
S: Close week. Your three-way reconciliation leaves four unmatched items, and a colleague suggests having Cowork match them to the closest plausible candidates so the file ties.
Q: What do you tell Cowork?
+ Leave all four unmatched and report each one in the exception report, with its financial impact.
> The exception report is the value, not the matches. An unmatched item reported honestly is useful, and the reviewer, not Cowork, clears the exceptions.
~ Match the two that look very likely, and report the other two as exceptions.
> Likely is not certain. Two of those matches may be errors in your books, and once the file ties, nobody looks at them again.
- Match all four, so the file ties before the deadline.
> A plausible match invented to make the file tie is a corruption of your books wearing a tidy spreadsheet.

S: You are reviewing the draft board pack. Cowork has described a missed revenue line as "in line with expectations".
Q: What do you do?
+ Re-brief so the miss is stated plainly with its number, and check the rest of the deck for the same softening.
> In this lane smoothing is a misrepresentation problem, not a style problem. The brief must forbid it, and your review must check for it.
~ Correct the wording on that slide yourself and move on.
> That slide is now honest, but Cowork will happily smooth, so other limitations may be softened elsewhere — and the brief still does not forbid it.
- Leave it. The number is close, and a positive tone reads well to the board.
> What to tell the board is your judgement, and a miss reframed as "in line" is a misrepresentation. The tool changes nothing about whose name is on it.
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What is the rule that makes a reconciliation safe?
A: **Never force a match.** An unmatched item reported honestly is useful; an invented match is a corruption of your books wearing a tidy spreadsheet.

Q: What is the only acceptable filler for a missing value?
A: "Not recorded". Cowork never estimates a missing value, and that rule goes in every finance brief, without exception.

Q: What does Cowork do with journal entries and chase emails?
A: **Drafts only.** It drafts entries with workings and chase emails for your review. An accountable human posts the entries; Cowork never sends a chase.

Q: Why is smoothing so serious in a board pack?
A: In finance it is not a style problem; it is a misrepresentation problem. The brief must forbid it, and your review must check for it.

Q: What is the mechanical defence against confident wrong numbers?
A: Every figure traces to a source, and row counts in and out are stated on every calculation. The person who reviews and posts stays responsible.

Q: Which Skill should you build first in this lane?
A: The **proofreading pass** that traces every number in every close document back to a verified source — before you automate anything else.
```

```quiz
Q: Why is the month-end variance pack the best first finance play?
- It is the most impressive to leadership
+ Structured inputs, mechanical maths, and every number traceable to a source row — the ideal place to learn verification
- It requires no review
- It is the only play the plugin supports
> Easy to check and worth checking: that combination is what makes a good first play.

Q: A reconciliation run reports twelve unmatched items. What is the correct instruction to have given it?
- Match them to the closest plausible candidates
+ Report every unmatched item honestly with its financial impact — never force a match to make the file tie
- Exclude them from the report
- Round them into a suspense total
> An honest exception report is the deliverable. An invented match is a corruption of the books.

Q: Which of these is explicitly NOT a job for Cowork in finance?
- Drafting journal entries with workings
- Building the exception report
+ Posting the journal entries
- Drafting tone-graded chase emails
> Draft yes, post never. Accountability stays with the human who reviews and posts.

Q: Why must "never estimate a missing value — write 'not recorded'" appear in every finance brief?
- It shortens the output
+ A plausible invented number survives review and can end up in reporting; a visible gap cannot
- The plugin requires it
- It reduces token usage
> Missing data that announces itself is safe. Missing data that was quietly filled in is how misstatements happen.
```

:::try Next
Enough theory. Budget vs actuals in, a CFO-ready variance pack out.
:::

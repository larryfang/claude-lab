# Teach Cowork Your Way: Skills

You have now written a dozen long briefs. Some of them you will want every week. Retyping a 300-word brief every Monday is not leverage.

A **Skill** is a brief that lives in a file, that Claude reads when it is relevant.

:::concept The one-sentence definition
A Skill is a folder containing a `SKILL.md` file: a short description of when to use it, and the instructions for how to do the job your way.

Claude reads the description of every available Skill. When a request matches, it loads the full instructions. That is the whole mechanism.
:::

## Why this is a bigger deal than it sounds

**It encodes your standards.** Your company's stage weightings. Your segment taxonomy. Your PRD sections. Your definition of "at risk". Not re-derived each run — stated once.

**It is shareable.** A Skill is a file. Your whole team can run your best play at your standard, including the person who joined last week.

**It composes.** Skills stack. A "pipeline review" Skill plus a "our company voice" Skill gives you a pipeline review in your voice, without either file knowing about the other.

**It is progressive.** Claude only loads the full instructions when relevant, so ten Skills do not bloat every conversation.

## Anatomy

A Skill is a folder with a `SKILL.md` inside. Here is a complete one:

```
---
name: deal-review
description: >-
  Use when the user asks for a pipeline review, deal review, forecast pack,
  or pipeline hygiene report. Produces a cleaned CSV, a weighted forecast
  model, and a two-page review document.
---

# Deal Review

## Our definitions — use these, do not re-derive them

Stage weightings: Discovery 20%, Qualification 30%, Proposal 50%,
Negotiation 75%, Verbal 90%.
Stale = no logged activity in 21 days.
At risk = any of: stale, close date passed, no next step recorded,
competitor named in the last note.
Currency: all amounts in USD. Convert at the rate in `reference/fx.csv`
and state the rate used.

## Always produce three artefacts

1. `output/pipeline-clean.csv` — one row per opportunity, plus
   days_since_activity, days_to_close, risk_score 1-5, risk_reason,
   data_quality_flags.
2. `output/forecast-model.xlsx` — tabs Data / Model / Exclusions.
   Weightings in editable cells. Live formulas only, never pasted values.
3. `output/deal-review.md` — two pages maximum, sections in this order:
   Headline, The Numbers, At Risk, Moving Well, Needs A Decision,
   Data I Am Fixing, Slack Summary.

## Rules

- Never estimate a missing value. Write "not recorded".
- Every risk assessment must cite the specific data supporting it.
  Never "this deal feels stalled".
- Do not drop a row from the analysis. Flag it and put it in Exclusions.
- Row count out must equal row count in. State both.
- Write only to `output/`. Never modify the source data or the CRM.
- Show the plan before starting.

## Always flag separately

- Stage names that needed normalising, and what you mapped them to.
- Any row excluded from a total, and why.
- Any deal where the data is too thin to assess honestly.
- Any account appearing twice.
```

Three parts:

**The frontmatter** — `name` and `description` between `---` lines. The description is the most important line in the file, because it is how Claude decides whether this Skill applies — and it is capped at **200 characters**, so every word must earn its place ([official skill-creation guide](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)). Write it as *"Use when the user asks for X, Y or Z"* and name the actual words people use.

**The definitions** — your company's specifics. This is the section that makes the output *yours* rather than generically competent.

**The rules and flags** — your Edges and Flag from B.R.I.E.F., permanently.

:::tip The description is where Skills fail
A vague description means the Skill never fires and you conclude Skills do not work.

❌ `description: Helps with sales reporting.`

✅ `description: Use when the user asks for a pipeline review, deal review, forecast pack, deal risk analysis, or pipeline hygiene check. Produces a cleaned CSV, a weighted forecast model, and a two-page review document.`

List the phrases people actually say. Include the synonyms. Say what it produces.
:::

## When a Skill beats a long brief

| Situation | Use |
|---|---|
| One-off job | A brief |
| You will run it again this month | A Skill |
| Your team should all do it the same way | A Skill |
| It encodes company definitions | A Skill, definitely |
| You are still working out what good looks like | A brief — iterate first |
| It needs to run on a schedule | A Skill plus a schedule |

:::warning Do not skill it too early
Write the brief. Run it three or four times. Notice what you correct every time — *those corrections are the Skill*. Anthropic's marketing ops team states the trigger exactly: *"When you find yourself correcting Claude on the same thing more than once, that feedback belongs in a skill"* — the discipline behind their weekly report going from 1–2 days to about 2 hours ([claude.com](https://claude.com/blog/how-anthropics-marketing-operations-team-uses-claude-cowork-to-automate-reporting-and-campaign-builds)).

A Skill written before you know what good output looks like just freezes your first guess, and it is harder to notice a Skill is wrong than a brief is wrong, because the Skill is invisible while it runs.
:::

## Two ways a Skill runs

1. **Automatically** — Claude matches your request against every installed description and loads the one that fits. This is the main path: your colleague types "run a deal review" and the Skill fires without being named.
2. **As a slash command** — type **`/`** in Cowork and your installed skills appear as `/skill-name`; Cowork sessions run on the same engine as Claude Code, where a skill *is* a command ([slash-commands docs](https://code.claude.com/docs/en/slash-commands)). Use the explicit form when the run must be exact and deliberate — `/deal-review` before the forecast call, no ambiguity about whether it fired.

## Where Skills live

- **Personal** — installed for your own account (Customize → Skills). Available in your Cowork sessions — which load the skills enabled on your claude.ai account, synced at session start.
- **Shared** — passed to colleagues to install, so everyone runs the same play. The file itself is the same.
- **Organization** — on Team and Enterprise plans, an admin can distribute a Skill to everyone.

Exact labels vary by version. The **content** of the file is what this course teaches, and that does not change.

## Supporting files

A Skill folder can hold more than `SKILL.md`:

- `reference/fx.csv` — the exchange rates your finance team uses
- `reference/segments.md` — your official segment definitions
- `templates/deal-review-template.md` — the exact layout your manager wants
- `reference/stage-definitions.md` — what each CRM stage actually means at your company

Reference them from `SKILL.md` and Claude reads them when needed. This is how you stop pasting your company's taxonomy into every brief.

## Plugins, briefly

A **plugin** bundles Skills, connectors, and sub-agents into one installable package (Customize → Plugins → Browse plugins). It is how "here is my Skill" becomes "install this and you have the whole team's playbook".

Anthropic ships open-source plugins for **eleven business functions** — sales, marketing, finance, product, legal and more — via a marketplace that is enabled by default, and teams can add any GitHub repo as their own marketplace ([use plugins in Claude](https://support.claude.com/en/articles/13837440-use-plugins-in-claude) · [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins)).

For now: build one good Skill. Bundling matters when you have three or four that belong together — and the next-but-one lesson hands you a ready-to-adapt Skill for each function.

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What is a Skill, in one sentence?
A: A folder containing a `SKILL.md` file: a short description of when to use it, and the instructions for doing the job your way.

Q: Which line in `SKILL.md` matters most, and why?
A: The **description**. It is how Claude decides whether the Skill applies, so a vague one means the Skill never fires.

Q: How do you write a description that fires?
A: Write it as "Use when the user asks for X, Y or Z", in the words people actually say, and say what it produces. It is capped at 200 characters.

Q: Which section makes a Skill's output yours, not generic?
A: The **definitions**: your stage weightings, your segment taxonomy, what "at risk" means at your company. Stated once, never re-derived.

Q: When is a brief ready to become a Skill?
A: After three or four runs, when you know what you correct every time. Those corrections are the Skill.

Q: What are the two ways a Skill runs?
A: **Automatically**, when a request matches its description, or **as a slash command** (`/skill-name`) when the run must be exact and deliberate.
```

```quiz
Q: What is the single most important line in a SKILL.md?
- The name
+ The description — it is how Claude decides whether the Skill applies, so a vague one means it never fires
- The first heading
- The rules section
> Name the actual phrases people use, list synonyms, and say what it produces.

Q: When should you write a Skill rather than a brief?
- Immediately, for every task
+ After running the brief three or four times, when you know which corrections you make every time
- Only for scheduled tasks
- Only when a team asks for it
> A Skill written too early freezes your first guess, and a wrong Skill is harder to notice than a wrong brief.

Q: What makes a Skill's output "yours" rather than generically competent?
- The formatting instructions
+ The definitions section — your stage weightings, segment taxonomy, and what "at risk" means at your company
- Its file location
- The length of the instructions
> Encode the specifics once, instead of re-deriving them every run.

Q: Why do supporting files (reference/, templates/) matter?
- They make the Skill load faster
+ They hold your company's taxonomy and templates so you stop pasting them into every brief
- They are required by the format
- They enable scheduling
> Reference them from SKILL.md and Claude reads them when the job needs them.
```

:::try Next
Build one. Yours, from the lab you found most valuable.
:::

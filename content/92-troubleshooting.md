# Troubleshooting & FAQ

Start here when something does not work.

## Access and setup

:::details I cannot find Cowork
Check in order:

1. **Plan** — Cowork needs Pro, Max, Team or Enterprise. Not available on Free.
2. **Entry point** — where the **message box** shows a **Chat / Cowork** choice, select **Cowork** there; it is not a sidebar item. No choice at all means you have the new Claude, where chat and Cowork are one: describe the task in any conversation. If you see neither on desktop, quit fully and reopen, or reinstall from `claude.com/download`. It also runs on web and mobile (still rolling out in beta), but these labs are taught on Desktop because cloud access to connected local folders works only while that Desktop app is open and for sessions started on desktop.
3. **Admin policy** — on Team or Enterprise a seat admin may not have enabled it. That is a one-line ask.

You can read every lesson and write every brief without access.
:::

:::details Cowork says it cannot see my folder
Confirm you granted **that** folder and not its parent or a sibling. Then run the read-only probe: *"Describe the folders and files you can see. Change nothing."*

If the probe comes back empty or wrong, re-grant. If the folder is in iCloud, OneDrive or Dropbox and files are not downloaded locally, the sync client may be showing placeholders rather than real files — download them first.

The reverse risk is worse: a reorganisation that copies not-downloaded placeholders can lose the real files — the "copies, never originals" warning in the setup lab covers this in full. Sync is not backup.
:::

:::details A connector is connected but returns nothing
Four causes, in likelihood order:

1. **Wrong instance** — production versus sandbox, or the wrong workspace.
2. **Your own permissions** — a connector sees only what your account sees.
3. **The query** — the filter or date range excludes everything. Ask: *"State the exact query you ran."* Half the time the query is wrong, not the connection.
4. **Pagination** — it retrieved the first page only. Ask: *"How many records matched in total, and how many did you retrieve?"* For large pulls, a CSV export is often more reliable.
:::

:::details It says it cannot access a connector mid-run
The auth token expired — commonly every 30 to 90 days. Reconnect under Customize → Connectors. If a scheduled task started producing nothing, this is usually why, which is the argument for the status-line pattern in Module 8.
:::

## Output quality

:::details The output is generic and unhelpful
Almost always the brief. Ask yourself which B.R.I.E.F. element is missing — usually **Result** (you never said what artefact you wanted) and **Flag** (you never asked it to surface anything).

Fastest fix: in ordinary chat, paste your brief and ask *"Rewrite this as a proper brief using Background / Result / Inputs / Edges / Flag, and ask me any question you need answered first."* The questions it asks are the vague parts of your own thinking.
:::

:::details It invented a number
The Confident Gap. Prevention is the instruction *"Never estimate a missing value — write 'not recorded'."* Add it to every brief that touches data.

Detection: trace three random numbers to source, and compare row count in against row count out.

When you find one, ask it to show the working: *"Walk me through that calculation row by row from the source file, and tell me which rows you included and excluded."* Notice whether it corrects itself or defends the number.
:::

:::details The totals do not reconcile
Usually the Silent Exclusion: rows with missing values were dropped without being reported.

Ask: *"How many records did you include in each total, how many did you exclude, and what is the total value of the excluded records?"*

Prevent it next time with *"Flag every record you excluded from any calculation and why"* plus *"state row count in and row count out"*.
:::

:::details A quote does not match the source
The most serious error in a research document. Re-brief:

> "Re-verify every quotation against its source file, character by character. Where the wording differs at all, either correct it to the exact source text or convert it to a clearly-marked paraphrase. List every one you changed."

Then verify three yourself. Never take the re-verification on trust — that is the same source it misread the first time.
:::

:::details The output was inconsistent across many files
The Drift, from parallel subagents that do not share context mid-run. Add:

> "After completing all items, review them together as a set and make the depth, structure, scoring and terminology consistent. Then tell me which ones you changed and why."

And next time, run **two** items first and check the structure before committing to forty.
:::

:::details It softened a limitation into a positive framing
Smoothing. Common in launch and enablement material.

> "You softened [N] limitations from the source into positive framings. List each with the original and the softened version, then rewrite them to state the limitation plainly."

Then check specifically: find every limitation in your source document and read how each downstream artefact expresses it.
:::

:::details A spreadsheet has no live formulas
Say so explicitly next time: *"Use live formulas reading from the Data tab, never pasted values. Put assumptions in labelled editable cells. Do not hard-code any total a formula could produce."*

To fix the existing one: *"Rebuild the Model tab so every figure is a formula referencing the Data tab and the assumption cells."*
:::

## Runs and control

:::details It modified files I did not want it to touch
The Eager Rewrite — the one failure mode that is not recoverable.

Right now: check whether your file system, backup, or sync service has version history. Many do.

From now on: work on copies, grant the narrowest folder, and put *"Write only to `output/`. Do not modify, rename or delete anything in the source folders"* in every brief.
:::

:::details The run is going wrong and I have been correcting it for minutes
Stop. You are debugging the brief, not the run. Beyond about a minute of steering, restarting from a corrected brief is faster and produces a better artefact — and a run steered five times produces a document whose reasoning you cannot reconstruct.
:::

:::details It ignored an instruction in my brief
Three common causes:

1. **Buried in prose.** Rules and flags belong in their own labelled section, not in the middle of a paragraph.
2. **Contradicted elsewhere.** "Be exhaustive" plus "two pages maximum" — one has to lose. Say which.
3. **Genuinely long brief.** Put the non-negotiables in a short EDGES section at the end, where they are last read.

Ask it directly: *"Restate every rule and constraint I gave you, in your own words, before you start."* Anything missing from that list was not received.
:::

:::details The run stalled or is taking far too long
Check the activity feed. Two common patterns: it is reading the same file repeatedly, which means your brief is ambiguous about which source is authoritative; or it is working through far more records than you expected, which means your scope is wider than you thought.

Interrupt, and add scope: *"Only the files in `X/`. Only records from [DATE] onwards. If there are more than [N] records, tell me before proceeding."*
:::

## Skills and schedules

:::details My Skill does not fire
First check that the Skill is toggled on in Customize → Skills and that code execution is enabled (Settings → Capabilities). After that, it is the description, in almost every case. Ask:

> "I have a Skill called [name]. I asked '[your phrasing]' and it did not activate. Here is the description: [paste]. Why did it not match, and rewrite it around the 4–6 most common phrasings someone might use for this job, within 200 characters."

Then test with three *different* natural phrasings. A description matching only one exact sentence is not usable by a team.
:::

:::details The Skill fires but the output is generic
The Skill is missing its definitions section, or you are running it outside the Project that holds your context. Skills describe *how*; Project instructions supply *your specifics*. Both are needed.
:::

:::details A colleague ran my Skill and got something wrong
You handed over the Skill and not the Project instructions. That is the most common handover failure.

Run the colleague test on the Skill: *"Read this as a new colleague who does not know our company. List every place you would not know what to do, and every term I have assumed you know."*
:::

:::details My scheduled task produces nothing
Usually an expired connector token. Reconnect.

Then fix the design so it cannot fail silently again: add a status line, and *"If any source is unreachable or returns zero records, still write the file, put PROBLEM in the status line, and state exactly what failed. Never write a normal-looking report from missing data."*
:::

:::details My scheduled task did not run at the scheduled time
If it is a cloud task, it is not your machine — cloud scheduled tasks run on their cadence even when your computer is asleep or the app is closed. A task that needs local files or apps runs only on your computer, so it needs the computer awake and the desktop app open. Check the run history under **Scheduled** in the sidebar; the usual causes are an expired connector token, a cloud job that tried to reach a **local folder** (cloud runs can only use connectors and files in your Claude account), or the time zone the schedule is set relative to.
:::

:::details Output from a Project is subtly and consistently wrong
Stale memory. Ask: *"List everything you currently take as established context for this project — definitions, numbers, decisions, assumptions about my company and preferences."*

Read it, then correct explicitly: *"Update your context: [X] changed from [old] to [new]. Ignore the previous value."*

This is the quietest failure in the whole course, which is why the quarterly review exists.
:::

## Judgement and risk

:::details How do I know when to trust the output?
You do not trust the output. You verify it — the four checks in Module 9, every time something leaves your hands. Trace three random numbers, compare row counts, check three quotes and three external claims, read the flag section.

The test that matters: can you explain every conclusion in your own words without re-reading the document? If not, you are forwarding someone else's reasoning with your name on it.
:::

:::details Is it safe to let it read a document from outside my company?
Reading, generally yes. **Reading plus a privileged action in the same unattended run, no.** External content can carry instructions aimed at an agent (prompt injection), so keep untrusted input away from anything that writes, sends, or updates.

Research, review, then act — as separate steps.
:::

:::details Our security team said no
Ask again with specifics: this job, this data, this access level, these controls, this reviewer, and this log. Bring your `ACCESS-LOG.md`.

Security teams say yes to specific proposals with controls far more often than to enthusiastic general ones. And do not route around a no — a personal account or a manual export of company data is what gets a tool banned org-wide.
:::

:::details Can I use this with customer PII?
That is your company's policy question, not a tool question. Get the answer in writing before you connect anything containing it.

Where the policy is restrictive, ask Cowork to anonymise on the way in — it can replace names with stable identifiers and still do the analysis. Note that anonymisation is not perfect for small datasets, where a role plus a company size can identify someone.
:::

:::details It disagreed with my judgement. Who is right?
Sometimes it is. Ask it to show the evidence, then decide yourself. What you must not do is accept a ranking, a forecast, or a prioritisation because it appeared in a well-formatted document.

The ownership test: if you cannot explain the decision without re-reading the document, you have not made it.
:::

## Limits worth knowing

:::details Connectors can return less data than exists
Connector queries are often paginated or capped — the first page, the first few hundred rows — and a run can build a confident analysis on a partial pull. For any dataset where completeness matters, prefer an **exported file** dropped into the workspace, and always ask: *"How many records matched in total, and how many did you retrieve?"* If those two numbers differ, the analysis is partial and must say so.
:::

:::details Usage limits are shared, and big runs spend them
Your plan's usage is shared across Chat, Cowork and Claude Code, on a rolling session window plus a weekly cap (the exact numbers depend on plan and change — check your plan's usage page). A forty-account fan-out or a long unattended run spends real budget.

Two tools for seeing it: type **`/usage`** or **`/cost`** inside a Cowork task for an inline card of your plan limits and the session's spend — it costs nothing to check ([Cowork changelog](https://claude.com/docs/cowork/changelog)) — and **Settings → Usage** for the account view. Practical habits from the official guidance: batch related work into one session rather than many small ones, use plain chat for simple questions, test fan-outs on two items before forty, and schedule heavy jobs thoughtfully. If a "limit reached" message appears and never clears when it should, that is a support conversation, not something to engineer around.
:::

:::details It does not reliably remember your last session
Outside a Project, do not rely on a Cowork session recalling last week's work. Cloud sessions can draw on your account memory from chat, but durable reuse comes from the things designed for it: saved **files**, **Skills** for the how, and **Project** instructions and memory for the context. If you are re-explaining the same thing in every session, that is the signal to move it into one of those three.
:::

## Getting more out of it

:::details How do I make output sound like me?
Project instructions with your tone rules, a reference file of three or four samples of your actual writing, and explicit negatives ("no exclamation marks", "no em-dashes", "Australian English", "never open with a rhetorical question").

For anything where voice genuinely matters, use Cowork for the structure and evidence and write the prose yourself. That is a legitimate split, not a failure.
:::

:::details What should I automate first?
The recurring task you most reliably skip when busy. Not the hardest one, and not the most interesting one. The weekly report nobody enjoys, done reliably, changes more about your week than an ambitious automation that works twice.
:::

:::details Something in this course does not match what I see on screen
Expected. Cowork ships fast and evolves quickly. The concepts, the briefs and the verification discipline hold; a menu label may not.

For current specifics, `claude.com/docs` is the source of truth.
:::

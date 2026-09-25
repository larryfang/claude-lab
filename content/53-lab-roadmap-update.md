# Lab: Stakeholder Update from the Tracker

Twenty minutes. Jira or Linear goes in. Three updates come out — for an exec, for your team, and for customers — because they want three different things and you currently write one and hope.

:::note Data
Best with your Jira or Linear connector live (Module 3). Without it, export your issues to CSV into `product/`, or generate a practice tracker export with the prompt below. The Module 1 `product/` data has no tracker in it. Where a brief says "the tracker", it means that file.
:::

:::details 🧭 No tracker access? Generate a practice export
```prompt
In the `product/` subfolder, create realistic but entirely FICTIONAL practice tracker data so I can learn on it. Invent all people, customers and issue keys — do not use any real company. Use dates within the last 60 days.

Create:
- `tracker-export.csv` with 40 rows and columns: issue_key, type (epic / story / bug), epic_key, summary, status (To Do / In Progress / Done), assignee, created_date, updated_date, due_date, resolution_date
  Make it deliberately messy: two Done issues with a blank resolution_date, four In Progress issues not updated for more than 10 days, three issues with no assignee, three issues past their due_date and not Done, and one epic marked Done whose child issues are not all Done.
- `feedback-links.csv` with 12 rows: issue_key, customer, contact, request_quote, date_asked — linking some Done issues to the customer who asked for them. Leave two rows with a blank request_quote.

Leave everything loose in `product/`. Do not organise it.
```
:::

## Part 1 — Ground truth first (6 min)

Before writing anything for anyone, find out what the tracker actually says. Trackers lie in predictable ways, and every one of those lies would end up in your update.

:::lab Step 1 — The tracker reality check
```prompt
BACKGROUND. I am a PM about to write a stakeholder update from our tracker. Trackers are always partly out of date, and I need to know how much before I write anything.

RESULT. `output/tracker-reality.md`:
1. Scope: which project, which issue types, which date range you queried, and how many issues matched
2. What moved in the last 14 days: issue key, summary, from status, to status, date
3. Every issue marked Done that has no resolution date, or whose resolution looks inconsistent
4. Every issue In Progress with no update for more than 10 days — the stalled work
5. Every issue with no assignee, or assigned to someone who has not touched it
6. Every issue whose due date has passed and is not Done
7. Every epic where the child issues do not add up to the epic's stated status
8. A trust assessment: how accurately does this tracker reflect reality, and what would I need to check with a human?

INPUTS. Only the tracker. Read-only — do not modify, transition, comment on, or create any issue.

EDGES. Never infer that work is done because it looks done. Never estimate a completion percentage that is not derivable from the data — say "not derivable". State the exact query you ran.

FLAG: anything that suggests the tracker is being used inconsistently across the team.
```

- [ ] It stated the exact query it ran
- [ ] It found stalled work I had not noticed
- [ ] Section 7 checked epic-child consistency
- [ ] Nothing was modified
:::

:::warning Section 4 is why you do this step
"In Progress, no update in 18 days" is either work that has quietly stopped or work that is happening and not being logged. Either way, telling an exec that item is on track is how you lose credibility — and you would have done exactly that if you had gone straight to writing the update.
:::

:::tip Paste your sequencing principles, or it will invent some
If your update explains *why* work is ordered the way it is, state your actual sequencing principles in the brief (dependencies, capacity, strategic bets). A working PM's field finding: without them, the agent *"invents a reasonable-sounding but wrong rationale"* — fluent, plausible, and not your reasoning ([Stuart Miller](https://haverin.substack.com/p/claude-cowork-for-product-managers)). The same guide fixes tonal drift in recurring updates by storing three or four past updates as a tone reference.
:::

## Part 2 — Three updates, three audiences (10 min)

:::lab Step 2 — The fan-out that matters
```prompt
BACKGROUND. Same project. Three audiences who want different things:
- My VP wants to know: are we on track, what is at risk, what do you need from me. She has 60 seconds and reads on her phone
- My team wants to know: what shipped, what is stuck, what is next, and to feel their work was seen
- Our customers and CS team want to know: what is new that affects them, in benefit terms, with no internal jargon or issue keys

RESULT. Three files in `output/updates/`:

`exec-update.md` — under 200 words:
- One-line status with an honest RAG rating and the reason for it
- Shipped this period: three bullets maximum, in outcome terms not issue terms
- At risk: what, why, and the impact if it slips. Use the stalled-work findings
- What I need from you: specific asks, or "nothing this week" if that is true

`team-update.md` — under 400 words:
- What shipped, with the people who did it named
- What is stuck and what would unstick it
- What is next and who is on what
- One thing worth celebrating, specifically not generically

`customer-update.md` — under 300 words:
- What is new, benefit-first, in the customer's language
- Any change that requires action from them, stated plainly
- What is coming next, with no dates unless the tracker actually supports a date
- No issue keys, no internal team names, no jargon

Also produce `output/updates/update-evidence.csv` with columns item, audience (exec / team / customer), status, issue_key, date_or_no_date.

INPUTS. Only the tracker data and `output/tracker-reality.md`.

EDGES. Never claim something shipped unless it is marked Done with a resolution date. Never state a date the tracker does not support — write "no date yet". Never describe stalled work as on track. The RAG rating must be justified by the data, not by optimism. If an item cannot be described as a customer benefit, leave it out of the customer update entirely.

FLAG at the end of each file: anything you were unsure whether to include, and anything I should verify with the team before sending.
```

- [ ] Three genuinely different documents, not one document in three lengths
- [ ] The RAG rating is justified
- [ ] Nothing stalled is described as on track
- [ ] The customer update has no issue keys or internal names
:::

:::tip The test of a good three-way fan-out
Read the exec update and the team update back to back. If you could swap the middle paragraphs without anyone noticing, the fan-out failed — you generated one update in three lengths.

The exec version should be almost entirely about risk and asks. The team version should be almost entirely about people and next steps. If they are not different in *kind*, re-brief with a sharper description of what each audience actually does with the information.
:::

## Part 3 — Close the loop (4 min)

The play almost nobody runs, and the one customers remember.

:::lab Step 3 — Tell the people who asked
```prompt
For every issue marked Done in the last 30 days, produce `output/loop-closing.csv` with one row per customer who originally requested that item: customer, contact name, what they asked for, the date they asked, the issue that resolved it, days elapsed, and a two-sentence personalised note they could be sent — referencing their original words.

Use only the tracker and our linked feedback or support records. Never claim a customer requested something unless there is a record of it. Never claim we shipped something not marked Done. Leave the note empty and flag the row if you cannot find the customer's original wording.

Then tell me: how many resolved items had a linked customer request, and how many did not. That ratio tells me how well we are capturing why we build things.
```

- [ ] The CSV was produced with real, traceable requests
- [ ] I know the linked-versus-unlinked ratio
:::

:::concept That ratio is a diagnostic
If most of what you shipped has no linked customer request, one of two things is true: you are building without recorded evidence, or you are not capturing the link between evidence and work. Both are worth knowing, and neither is visible from any dashboard.
:::

## Part 4 — Verify, then send

:::lab Before anything leaves
- [ ] Every "shipped" item — confirm each is genuinely Done in the tracker
- [ ] The RAG rating — do you personally agree with it? If not, change it and know why
- [ ] The at-risk list — is anything missing that you know about and the tracker does not?
- [ ] The customer update — read it as a customer. Is any of it meaningless to them?
- [ ] Names in the team update — spelled correctly, and nobody's contribution omitted
- [ ] The flags at the end of each file — resolve each one before sending
:::

:::warning The tracker does not know what you know
Cowork produces an update that is faithful to the tracker. You know the things that are not in the tracker: the dependency that slipped in a conversation, the engineer who is about to go on leave, the customer escalation that changes the priority.

Add those yourself. A perfectly accurate tracker-derived update that omits the thing everyone in your team knows is a problem reads as either naive or evasive, and neither is a good look.
:::

## Make it a Monday job

This is the strongest candidate for a schedule in the whole course: read-only, structured input, stable audiences, and it is the task you most reliably skip when busy.

- [ ] Save the two briefs as a sequence
- [ ] Note your actual project keys, statuses and RAG definitions
- [ ] Note who each update goes to
- [ ] Module 8 schedules it for Monday 8am, writing a draft into a Project for you to review

## Reflect

Answer about your own work, not the practice data. Your answers save to your notebook in this browser.

```reflect
Which item on your real tracker is In Progress with no recent update? Is that work stopped, or happening and not logged, and how do you know?
```

```reflect
What do you know about your project right now that the tracker does not? Where would it go in each of your three updates?
```

```quiz
Q: Why check the tracker for stalled work before writing the update?
- To count issues
+ Because "In Progress, no update in 18 days" is either stopped work or unlogged work, and describing it as on track is how you lose credibility
- To find the assignees
- Because connectors cache data
> The reality check exists so the update does not inherit the tracker's optimism.

Q: What is the test of a genuine three-audience fan-out?
- All three are under the word limit
+ If you could swap paragraphs between the exec and team versions unnoticed, you generated one update in three lengths
- They share a headline
- They use the same data
> Exec: risk and asks. Team: people and next steps. Different in kind, not just in length.

Q: Most of what you shipped has no linked customer request. What does that tell you?
- Nothing useful
+ Either you are building without recorded evidence, or you are not capturing the evidence-to-work link — both worth knowing and invisible on a dashboard
- The tracker is broken
- Customers are not engaged
> The ratio is a diagnostic on your own process.

Q: What must you add to a tracker-derived update yourself?
- Formatting and headings
+ What you know that the tracker does not — the slipped dependency, the upcoming leave, the escalation that changes priority
- The RAG rating only
- Nothing; the tracker is the source of truth
> An update that omits what everyone in your team knows reads as naive or evasive.
```

:::try Module complete
That is your **🧭 Product Sense** badge. Now stop doing all of this by hand — Module 8 makes it repeatable.
:::

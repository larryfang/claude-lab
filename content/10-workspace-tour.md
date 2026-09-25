# The Cowork Workspace

Seven things on the screen. Know what each one is for and nothing about a Cowork run will surprise you.

:::note A fast-moving product
Cowork ships fast, so labels and layout move. This lesson teaches you what to **look for**, not where to click. If your screen differs, find the thing that does this job.
:::

## 1 — The workspace folder

The folder (or folders) you grant. Cowork reads and writes here. This is its whole world.

**What to look for:** a folder picker, a workspace name, or a path shown near the top.

**The thing people get wrong:** granting too much. A folder is not a suggestion — it is a permission boundary. Grant `Q3-launch/`, not `Documents/`.

## 2 — The task box

Where you describe the outcome. Not a chat line — a brief. It can be long. Longer is usually better.

**The thing people get wrong:** treating it like a chat box and typing eight words. Module 2's whole subject.

## 3 — The plan

Cowork typically shows you the steps it intends to take before or as it starts. This is your cheapest intervention point: fixing a wrong plan costs a sentence, fixing a wrong deliverable costs a re-run.

**What to look for:** a numbered list of steps, a "plan" or "todo" panel, or steps that tick off as it works.

:::tip Read the plan properly
Not the vibe of the plan — the actual steps. You are looking for three things: **a source it should not be reading**, **a step that writes where you did not expect**, and **a missing step** — the check, the cross-reference, the "flag what is missing" that you asked for and it quietly dropped.
:::

## 4 — The activity feed

The running log of what it is doing: files opened, commands run, connectors queried, files written. Scroll it when something looks wrong. It is also where you notice a job has been reading the same file forty times because your brief was ambiguous.

## 5 — Subagents

For bigger jobs Cowork splits work across parallel workers — one researching each account, one writing the summary. Mostly automatic; you just get the speed.

**Where it matters to you:** parallel workers do not share what they learn mid-run. Twelve account briefs written by twelve subagents can be individually good and collectively inconsistent. If cross-consistency matters, say so: *"After the individual briefs, review all twelve together and make the scoring consistent."*

## 6 — Scheduled tasks

Save a job, have it run on a cadence — every Monday 8am, every weekday at 6pm. A one-off chat message cannot do this. Scheduled tasks run remotely, so they run on time even when your computer is asleep or the app is closed — unless the task uses a folder or app on your computer. Then it runs locally, and needs the computer awake and Desktop open. (On Enterprise plans, tasks run remotely only after an Owner turns on **Run Cowork in the cloud**; until then, they run on your computer.)

**Where it matters to you:** a scheduled job runs with **no one reading the plan**. Only schedule jobs that are read-only or write to a scratch folder, and that you have run by hand successfully at least three times. Module 8.

## 7 — Projects

A persistent workspace for recurring work: its own files, links, instructions and memory. Open it next month and Claude already knows the context — your naming conventions, your ICP definition, last quarter's numbers.

**Where it matters to you:** this is how you stop re-explaining your business every single run.

## And one thing that is not on screen: connectors

Connectors (Jira, Salesforce, HubSpot, Gmail, Slack, Drive) are configured under **Customize → Connectors**, but they are what turns Cowork from "a very good file assistant" into something that knows your pipeline. Module 3.

## Scavenger hunt

Open Cowork and find each of these. Tick as you go:

- [ ] Where you **choose or change the workspace folder**
- [ ] The **task box**
- [ ] Where the **plan / steps** appear
- [ ] The **activity feed** of what it is doing
- [ ] Where **scheduled tasks** are created or listed
- [ ] **Projects**
- [ ] The **stop / interrupt** control — find this one before you need it
- [ ] **Customize → Connectors**

:::warning Find the stop button now
Not when a run is halfway through moving your files. Now. Every experienced Cowork user has needed it, and the ones who knew where it was lost thirty seconds instead of a folder.
:::

## How the pieces fit together

Everything in this course lives somewhere on that list:

- **Connectors** give Cowork access to your systems
- **Skills** teach it your formats and rules
- **Projects** give recurring work persistent memory
- **Subagents** are Cowork parallelising a big job
- **Schedules** remove you from the loop entirely
- **The plan and the stop button** are how you stay in control while all of that happens

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What is the workspace folder, really?
A: A **permission boundary**, not a suggestion. Grant `Q3-launch/`, not `Documents/`.

Q: Why is the plan your cheapest intervention point?
A: Fixing a wrong plan costs a sentence. Fixing a wrong deliverable costs a re-run.

Q: What three things do you look for when you read the plan?
A: A **source it should not be reading**, a **step that writes where you did not expect**, and a **missing step**.

Q: Why can parallel subagents give inconsistent results?
A: They do not share what they learn mid-run. If cross-consistency matters, ask for a review of all the outputs together.

Q: Which jobs are safe to schedule?
A: Jobs that are read-only or write to a scratch folder, and that you have run by hand successfully at least three times.

Q: What does a Project give recurring work?
A: Its own files, links, instructions and memory — so you stop re-explaining your business every single run.
```

```quiz
Q: What is the cheapest point at which to correct a Cowork run?
- After reading the final deliverable
+ While reading the plan, before it acts
- Halfway through, using the stop button
- On the second re-run
> A wrong plan costs one sentence to fix. A wrong deliverable costs a whole re-run.

Q: Twelve account briefs produced by parallel subagents come back individually excellent but scored inconsistently. Why?
- The model degraded
+ Parallel subagents do not share context mid-run — you have to ask for a consolidation pass
- The connector timed out
- Too many files
> Ask for a final review pass across all outputs whenever cross-consistency matters.

Q: What is the special risk of a scheduled task?
- It costs more
+ It runs with nobody reading the plan, so a brief that is slightly wrong repeats that error unattended
- It cannot use connectors
- It only runs once
> Schedule only jobs that are read-only or write to scratch, and only after several successful manual runs.

Q: What is the purpose of a Project in Cowork?
- To store billing information
+ A persistent workspace with its own files, instructions and memory, so recurring work does not need re-explaining
- To share output publicly
- To pick a different model
> Projects are how you stop describing your business from scratch every run.
```

:::try Next
You know the room. Now learn the one skill that separates a useful run from a wasted one: writing the brief.
:::

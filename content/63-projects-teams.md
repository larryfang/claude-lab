# Projects, Memory & Team Handoff

You have Skills for how to do the work. This lesson is about the context the work happens in — and how to give all of it to someone else.

## Projects: a workspace with a memory

A **Project** in Cowork is a persistent workspace for a body of work. It holds:

- **Files** — the source data, references, previous outputs
- **Instructions** — the standing context for everything in this project
- **Memory** — what has already been established, so you stop re-explaining
- **Its own Scheduled tasks** — recurring jobs that run against this project's context and write into its files

The difference from a one-off session: open the Project next month and Claude already knows your naming conventions, your definitions, last quarter's numbers, and the three decisions you already made.

## What to make a Project

| Lane | Good Projects |
|---|---|
| 💼 **Sales** | One per major account or pursuit · your territory · the RFP answer bank |
| 📣 **GTM** | One per launch · competitive intelligence · the messaging system of record |
| 🧭 **Product** | One per initiative or epic · the discovery evidence base · the quarterly planning cycle |
| 🧾 **Finance** | The month-end close · budget season · the audit evidence pack |

The test: **would you have to re-explain the same context if you started fresh?** If yes, it is a Project.

## Project instructions: where the leverage is

The instructions file is standing context for every task in that Project. This is where you stop repeating yourself.

A good set of Project instructions for a sales territory:

```
# Territory: ANZ Mid-Market

## Who I am
AE covering mid-market (200-2000 employees) in Australia and New Zealand.
Manager: [NAME]. Quota period: quarterly.

## What we sell
[Two sentences. What it is and who it is for.]

## Definitions — use these, never re-derive
- Stage weightings: Discovery 20%, Qualification 30%, Proposal 50%,
  Negotiation 75%, Verbal 90%
- Stale: no logged activity in 21 days
- Mid-market: 200-2000 employees. Below that is SMB (not mine),
  above is Enterprise (not mine)
- All amounts in AUD unless the record says otherwise. State the currency you used.

## Our competitors
[Names, and the one-line reason we usually win or lose against each.]

## My CRM specifics
- Instance: [which]
- The fields that matter: [names]
- Fields that are unreliable and should always be flagged rather than used: [names]

## Standing rules for every task
- Read-only on the CRM unless I explicitly say otherwise in the request
- Never estimate a missing value; write "not recorded"
- Write deliverables to `output/`, never to source folders
- Australian English. No em-dashes. No exclamation marks in customer-facing drafts.
- Show the plan before acting on anything that writes

## What I do NOT want
- Generic sales advice
- Motivational framing
- Anything that assumes US market conventions
```

:::tip The "fields that are unreliable" line
That one line does more for output quality than anything else in the file. Every CRM has fields nobody maintains — a "next step" that has not been updated since 2024, a "lead source" that is 60% blank. Naming them explicitly means Cowork flags them rather than building conclusions on them.

Every team has this list, and nobody writes it down. Write it down.
:::

## Memory: useful and worth checking

Cowork remembers what has been established in a Project. That is what makes it feel like working with a colleague who has context rather than a stranger every morning.

Two things to know:

**It can carry a mistake forward.** If a wrong assumption gets established early — a stale definition, a number you later corrected — it may persist. When output starts being subtly wrong in a consistent way, check what the Project believes:

```prompt
Tell me everything you currently take as established context for this project — definitions, numbers, decisions, assumptions about my company and my preferences. List it plainly so I can correct anything wrong.
```

**Correct it explicitly.** Do not just say the right thing once and hope. *"Update your context: our Enterprise threshold changed from 1000 to 2000 employees as of this quarter. Ignore the previous number."*

:::warning Quarterly memory review
Put it in the same calendar reminder as your scheduled-job review. Ask what the Project believes, read it, correct it. Twenty minutes.

Stale context is the quietest failure in this whole course: nothing errors, nothing looks wrong, and every output is subtly out of date in a consistent and therefore invisible way.
:::

## Handing it to a colleague

A working Cowork setup is four things, and people usually hand over one of them.

:::concept The handover package
1. **The Skills** — the files. Not descriptions of them.
2. **The Project instructions** — the definitions, the unreliable fields, the standing rules. This is the part everyone forgets and it is the part that makes the Skills work.
3. **The connector list** — what needs to be connected, at what access level, and what to smoke-test after connecting.
4. **Three example requests** — the actual phrasings that make each Skill fire, so they do not have to guess.

Miss number 2 and they get generic output while running your Skills faithfully, conclude the Skills are mediocre, and stop.
:::

Have Cowork write the handover for you:

```prompt
Write `output/HANDOVER.md` for a colleague taking over this workflow. Include: (1) what this setup does and what problem it solves, (2) every Skill with what it produces and the phrasings that trigger it, (3) the project instructions and definitions they must have, with an explanation of why each definition matters, (4) the connectors needed, the access level, and a smoke test for each, (5) three example requests with what good output looks like, (6) the known limitations and what still needs a human, (7) what to check quarterly.

Write it for someone competent who knows nothing about my setup. Assume no knowledge and no context.
```

:::lab Do this now
- [ ] Create a Project for your main body of work
- [ ] Write its instructions, including the unreliable-fields list
- [ ] Move your Skill into it, or make it available there
- [ ] Run one task and confirm the standing context is being applied
- [ ] Generate the handover document, read it, and fix what it gets wrong
:::

## Plugins: bundling for real distribution

Once you have several Skills plus shared reference files, a **plugin** packages the lot — Skills, commands, connector configuration, and a README — into something installable.

That is when "here is my file" becomes "install this and you have the team playbook". It is the right move when three or four Skills belong together and more than a handful of people should have them.

For most people, later. One well-documented Project with one tested Skill and an honest handover document beats an elaborate plugin nobody has used.

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What does a Cowork Project hold?
A: Files, instructions, memory, and its own scheduled tasks. Open it next month and Claude already knows your definitions and the decisions you made.

Q: What is the test for making something a Project?
A: Would you have to re-explain the same context if you started fresh? If yes, it is a Project.

Q: Which line in Project instructions helps output quality most?
A: The list of **unreliable fields**. Naming them means Cowork flags those fields rather than building conclusions on them.

Q: Output is subtly, consistently wrong. What do you check first?
A: What the Project takes as established context. Ask it to list everything it believes, then correct each mistake explicitly.

Q: What are the four parts of a handover package?
A: The Skills (the files), the Project instructions, the connector list, and three example requests.

Q: Which part of the handover do people forget?
A: The **Project instructions**. Without them, a colleague runs your Skills faithfully, gets generic output, and concludes the Skills are mediocre.
```

```quiz
Q: What is the test for whether something should be a Project?
- Whether it lasts more than a week
+ Whether you would have to re-explain the same context if you started fresh
- Whether it uses connectors
- Whether more than one person works on it
> Recurring context is the signal. Projects exist so you stop repeating yourself.

Q: Which single line in Project instructions does most for output quality?
- The list of competitors
+ The list of fields that are unreliable and should be flagged rather than used
- The currency setting
- The tone preferences
> Every team knows which fields nobody maintains. Almost nobody writes it down.

Q: Output from a Project starts being subtly and consistently wrong. What should you check first?
- The connectors
+ What the Project takes as established context — a stale definition or corrected number may have persisted in memory
- The Skill file
- The folder permissions
> Ask it to list everything it believes, then correct it explicitly.

Q: You hand a colleague your Skills and they get generic output. What did you most likely leave out?
- The connector list
+ The Project instructions — the definitions and standing rules that make the Skills produce your output rather than generic output
- The example prompts
- The reference files
> Skills without context produce competent, generic work. Then people conclude Skills do not help.
```

:::try Module complete
That is your **🛠️ Automator** badge. Next, the part that keeps you employed: verifying output before it leaves the building.
:::

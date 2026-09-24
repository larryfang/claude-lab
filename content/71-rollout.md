# Rolling It Out to Your Team

You are now good at this. Your team is not, and the default outcome of "I found a great tool" is that three people try it, get mediocre results from a lazy brief, and quietly conclude it is overrated.

This lesson is how to avoid that.

## Why rollouts fail

Four reliable causes:

1. **Access without briefing skill.** Everyone gets a licence, nobody learns to write a brief. Output is generic. People conclude the tool is generic.
2. **Starting with the hardest thing.** Someone tries to automate the most complex, judgement-heavy task first, it goes badly, and the verdict is in.
3. **No shared standards.** Twelve people invent twelve formats, nothing is comparable, and the manager who has to read all twelve asks people to go back to the old template.
4. **A single visible failure.** One made-up number in a customer email and the tool acquires a reputation that facts will not fix.

Notice that none of these is about the tool.

:::concept The adoption ladder
Anthropic's own deployment guide frames maturity as five levels: **L0** chat Q&A → **L1** a real deliverable from your files → **L2** the job encoded as a Skill → **L3** skills bundled and scheduled → **L4** an admin-provisioned plugin for the whole department. The goal it sets is the right one for your rollout too: *"get every user one level higher than they are now."* And its cold-start rule explains why plugins matter on day one: a new user who types `/morning-briefing` and gets something useful in ninety seconds comes back tomorrow; one who faces a blank prompt closes the app.
([Deploying Claude across your organization](https://claude.com/blog/new-guide-deploying-claude-across-the-enterprise-with-claude-cowork))
:::

## The 30-60-90

### Days 1–30: one person, one play, one artefact

**You.** Not a pilot group. Pick the single play with the best ratio of hours-saved to judgement-required — usually the weekly report nobody enjoys — and do it every week until the output is reliably good.

- [ ] One play, run at least four times
- [ ] The brief refined into a Skill
- [ ] Time saved measured honestly, including verification
- [ ] Two or three examples of visibly better output than the old way
- [ ] One recorded failure and what you changed

That last item is the most persuasive thing you will have. "It got this wrong, here is what I changed" builds far more trust than an unbroken success story, which nobody believes anyway.

### Days 31–60: one colleague, then three

- [ ] Give **one** colleague your Skill, your Project instructions, and three example requests
- [ ] Have them run it **without you in the room** — this is the whole test
- [ ] Fix whatever confused them, in the Skill, not in a conversation
- [ ] Then three more people, same package
- [ ] A standing 20-minute weekly check-in with them while it beds in: what worked, what confused, what to fix in the Skill
- [ ] Establish the shared standard: the format, the definitions, the verification checklist

:::warning The unsupervised run is the only real test
Watching someone use your Skill while you sit next to them tells you almost nothing, because you fill every gap without noticing — a hint, a correction, "oh you need to point it at that folder".

Send it, walk away, and read what they produce. That is the data.
:::

### Days 61–90: standards, then scale

- [ ] The team's verification checklist is written and used
- [ ] Two or three Skills covering the team's most common jobs
- [ ] A Project with the team's shared definitions
- [ ] The rule about what must never be sent unreviewed, agreed and written down
- [ ] Onboarding: a new starter can be productive with this in a day
- [ ] The quarterly review of Skills, schedules and Project memory is in someone's calendar

## The objections you will hear, and honest answers

:::details "It makes things up"
It does, sometimes, and confidently. That is why the verification pass exists and why we restrict sources and demand citations.

The honest framing: it is a fast, tireless, occasionally wrong analyst whose work must be checked. That is also true of every junior hire, and we manage that with review, not by not hiring.
:::

:::details "I could write it faster myself"
For one short document, sometimes true. For eight consistent artefacts, forty account briefs, or a synthesis across twenty transcripts, not close.

Pick the comparison honestly — and count the tasks you currently do not do at all because there is no time. Those are where the value actually is.
:::

:::details "It does not sound like me"
Correct, until you tell it what you sound like. Project instructions, a voice reference file, three examples of your actual writing.

And for anything that genuinely needs your voice, use it for the structure and evidence and write the prose yourself. That is a legitimate division of labour, not a failure.
:::

:::details "This is a security risk"
Some of it is, and the honest answer is not "no it is not". It is: here is what we connected, at what access level, here is what never leaves the building, here is who reviews output, and here is the log.

That is what your ACCESS-LOG.md is for. Bring it to the conversation. Security teams say yes far more often to a specific proposal with controls than to an enthusiastic general one.
:::

:::details "It will replace us"
It replaces the parts of the job nobody was doing well because there was no time — the synthesis, the second draft, the follow-up nobody sent. What it cannot do is judgement, relationships, or accountability.

The people it disadvantages are those whose value was volume of documents. The people it advantages are those whose value is judgement about them.
:::

## Measuring honestly

Vanity metrics will get you a budget and lose you the argument later. Measure these instead:

| Measure | How |
|---|---|
| **Time on the specific play** | Before and after, including verification. Ask three people, do not estimate |
| **Tasks now done that were not** | The weekly update that now happens. The follow-up that now gets sent. This is usually the biggest number |
| **Quality, judged by the recipient** | Ask the manager who reads the reports, not the person who writes them |
| **Errors caught in verification** | Count them. A rising count means people are checking; zero means they are not |
| **Skill usage** | Who actually runs them. Unused Skills are a signal about the Skill, not the person |

Two more field-tested rules from Anthropic's deployment guide: pilot with **two or three champion teams rather than one** ("a single team gives you one data point"), and define success in measurable terms before you start — *"'Hours saved per week' is measurable. 'Transformation' is not."* The signal a pilot is working is not just the hours: it is champions starting to write their own skills.

:::tip The metric that convinces sceptics
Not hours saved — that always sounds inflated and nobody believes it.

**"The thing we never had time for now happens every week."** The stakeholder update that used to be monthly and late. The competitive watch nobody ran. The follow-up to the customer who asked in March. That is a change people can see, and it is not disputable.
:::

## Write down what must never happen

One page, agreed, visible. Non-negotiable items:

- Nothing goes to a customer without a named human reviewer
- No compliance, security, legal or contractual statement is sent without sign-off from that function
- No scheduled task writes to a source system
- No unverified number in any exec or board material
- No connector is added without recording it in the access log
- Anything sourced from the web carries its URL and the date it was read

:::lab Your rollout plan
- [ ] Which single play am I proving first?
- [ ] How will I measure it, honestly?
- [ ] Who is my one colleague?
- [ ] What is my "here is where it got it wrong" story?
- [ ] Who needs to say yes — a manager, security, legal?
- [ ] What goes on the never-do list for my team?
:::

## Make the call

Choose what you would do, read the consequence, then try the other options.

```scenario
S: Your Skill has worked well for you every week for a month. A colleague in your team wants to use it.
Q: How do you hand it over?
+ Give them the Skill, your Project instructions and three example requests. Let them run it without you, then read what they produce.
> The unsupervised run is the only real test. Fix whatever confused them in the Skill, not in a conversation, then give the same package to three more people.
~ Give them the same package, but sit next to them for the first run.
> Friendly, but it tells you almost nothing. You fill every gap without noticing: a hint, a correction, "oh you need to point it at that folder".
- Send the Skill file to the whole team, so everyone can start at once.
> Nobody has run it without you yet, and the file alone has no Project instructions or example requests. People get mediocre results and quietly conclude it is overrated.

S: You are presenting your first month to a sceptical manager. You have an hours-saved figure, and a weekly competitive watch that nobody had time to run before.
Q: What do you lead with?
+ The competitive watch that now happens every week.
> A change people can see, and it is not disputable. Tasks now done that were not done before are usually the biggest number.
~ The hours-saved figure, measured before and after, including verification.
> Honest and measurable, so keep it in. But hours saved always sounds inflated, and on its own a sceptic will not believe it.
- A clean success story: every run was perfect.
> Nobody believes an unbroken success story. "It got this wrong, here is what I changed" builds far more trust.
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What are the four reliable causes of a failed rollout?
A: Access without briefing skill, starting with the hardest thing, no shared standards, and a single visible failure. None of them is about the tool.

Q: What goal does the adoption ladder set?
A: "Get every user one level higher than they are now." The levels run from **L0** chat Q&A to **L4** an admin-provisioned plugin.

Q: Who runs the play in days 1–30?
A: **You.** Not a pilot group. One person, one play, one artefact, every week until the output is reliably good.

Q: Why must a colleague's first run be unsupervised?
A: Sitting next to them, you fill every gap without noticing. Send it, walk away, and read what they produce.

Q: What does a rising count of errors caught mean?
A: People are actually checking. A count of zero means nobody is looking, not that nothing is wrong.

Q: What goes on your team's never-do list?
A: One page, agreed and visible. For example: nothing goes to a customer without a named human reviewer, and no scheduled task writes to a source system.
```

```quiz
Q: What is the most persuasive thing to have after 30 days?
- A list of hours saved
+ One recorded failure and what you changed in response — it builds more trust than an unbroken success story nobody believes
- Three finished Skills
- A completed pilot group
> Credibility comes from having found the limits, not from claiming there are none.

Q: Why is the unsupervised colleague run the only real test?
- It is faster
+ Sitting next to them means you fill every gap without noticing, so you learn nothing about whether the package works
- It tests permissions
- It provides better feedback
> Send it, walk away, read what they produce.

Q: Which metric best convinces a sceptic?
- Hours saved per week
+ "The thing we never had time for now happens every week" — visible, specific, and not disputable
- Number of Skills built
- Adoption percentage
> Hours-saved figures always sound inflated. A newly-existing weekly artefact does not.

Q: A rising count of errors caught in verification means…
- The tool is getting worse
+ People are actually checking — a count of zero is the worrying number
- Briefs need rewriting
- Connectors are failing
> Zero errors caught means nobody is looking, not that nothing is wrong.
```

:::try Module complete
That is your **🛡️ Trusted Operator** badge. One thing left: put all of it together.
:::

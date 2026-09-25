# Lab: Build Your Role's Skill

Twenty-two minutes. You will package your best lab from this course into a Skill, test it cold, and refine it twice.

The refinement loop is the lesson. A Skill that has never been tested cold is a guess.

## Part 1 — Choose, and gather your corrections (4 min)

:::lab Step 1 — Pick one
- [ ] Which lab in this course produced something I would want again this month?
- [ ] What did I have to correct, re-brief, or fix by hand when I ran it?
- [ ] Which of my company's definitions did I have to explain in the brief?

Write those three answers down. The second is the Skill's rules section. The third is its definitions section.
:::

Common choices:

| Lane | Strong first Skill |
|---|---|
| 💼 Sales | `deal-review` or `account-brief` |
| 📣 GTM | `launch-kit` or `competitor-research` |
| 🧭 Product | `discovery-synthesis` or `stakeholder-update` |
| 🧾 Finance | `proofread-pack` (build this one first) or `variance-pack` |

## Part 2 — Have Claude draft it (6 min)

The fastest way to write a Skill is to give Claude the working brief and your corrections.

:::lab Step 2 — The drafting request
```prompt
I want to turn a brief I have been using into a reusable Skill.

Here is the brief that works: [PASTE YOUR BEST BRIEF FROM THIS COURSE]

Here is what I had to correct every time I ran it: [YOUR LIST]

Here are my company's definitions that the brief kept having to explain: [YOUR DEFINITIONS — stage weightings, segment names, what "at risk" means, your document section names, your currency, your project keys]

Write me a complete SKILL.md with:
- YAML frontmatter: a name in kebab-case, and a description that begins "Use when the user asks for..." and lists the 4–6 most common phrasings someone might use for this job, plus what it produces, within 200 characters
- A definitions section holding my company specifics so they are never re-derived
- The artefacts it always produces, with exact filenames and section orders
- A rules section built from my corrections
- A "flag separately" section
- A note of any supporting reference file it would help to have alongside

Then, separately, tell me: which parts of my brief did you leave out and why, and what would make the description fire more reliably?
```

- [ ] I have a draft `SKILL.md`
- [ ] I read the "what I left out" explanation
- [ ] The description lists real phrases I would actually say
:::

:::tip The flywheel alternative
If you just finished running the job in a Cowork session, there is a shortcut practitioners swear by: before closing that session, say *"Write a SKILL.md recording exactly how you did this task — the steps, my corrections, and the rules you learned."* The session that did the work documents the work, and your next run starts from its own experience. ([firsthand CPA account, r/ClaudeAI](https://www.reddit.com/r/ClaudeAI/comments/1rd7b9i/am_i_using_claude_cowork_wrong/))
:::

:::tip Or record it: show, don't describe
For workflows easier to *do* than to explain, Cowork on **Claude for Mac** has **Record a skill**: the **+** menu (or Customize → Skills → Add → "Record your screen") records your screen, clicks and voice narration for up to ~10 minutes while you do the job once — then Claude reviews the recording and proposes the skill, which you save or dismiss. Availability caveat, straight from the official guide: *"available on Pro, Max, and Team plans, in Cowork in Claude for Mac. It isn't available in chat, on Windows, or on Free and Enterprise plans"* ([how to create custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)). The cold test below applies to a recorded skill exactly as much as a written one.
:::

:::lab Step 3 — Install it
- [ ] Create a folder named after the Skill (kebab-case, e.g. `deal-review`)
- [ ] Save `SKILL.md` inside it
- [ ] Create any supporting `reference/` files it mentions — your FX rates, segment definitions, template
- [ ] **Zip the folder**, then upload it: **Customize → Skills → + → Create skill → Upload a skill**
- [ ] Confirm it appears in the Skills list with its toggle **on**, then type `/` in Cowork — installed skills show up there too. A skill greyed out in the list is not turned on yet — toggle it on. No Skills section at all? Turn on **Code execution and file creation** in Settings → Capabilities (on Team or Enterprise, ask your Owner: it is an organisation setting)
:::

:::details If the upload flow looks different
Labels shift as the product evolves — look for a Skills section under Customize with an upload or create action.

If you genuinely cannot find it, you can still use the file: paste the contents of `SKILL.md` at the top of a brief. Less elegant, identical output, and it proves the content works before you worry about installation.
:::

## Part 3 — The cold test (6 min)

This is the part that matters. Do not paste the brief. Do not describe the job in detail. Ask the way you would ask a colleague.

:::lab Step 4 — Test whether it fires
```prompt
Run a deal review on my pipeline.
```

(Substitute the natural phrasing for your Skill: "Do a launch kit for the notifications feature." "Synthesise the transcripts in `product/`.")

- [ ] The Skill **fired** — it produced the artefacts without being told the format
- [ ] The output used **my definitions**, not generic ones
- [ ] Every artefact appeared, correctly named
- [ ] The rules were applied — check one specifically
:::

:::tip Explicit invocation
Typing `/` in Cowork lists your installed skills and lets you call one by name. That is the *explicit* path — useful for confirming the skill is installed and works. The cold test above checks the harder thing: that it fires from natural language, which is how your colleagues will use it.
:::

:::warning If the Skill did not fire
This is the most common outcome on a first attempt. First confirm the Skill is toggled on in Customize → Skills. After that, it is almost always the description.

Ask directly:

> "I have a Skill called [name]. I asked '[your phrasing]' and it did not activate. Here is the description: [paste]. Why did it not match, and rewrite it so that it does — using the 4–6 most common phrasings someone might use for this job, within 200 characters."

Then test again with three *different* natural phrasings. A description that only matches one exact sentence is not usable by a team, because your colleagues will phrase it their way.
:::

## Part 4 — Refine twice (6 min)

:::lab Step 5 — Refinement round one
Look at what the Skill produced and find the gap between it and what you actually wanted.

```prompt
The Skill worked but the output has three problems: [BE SPECIFIC — a section in the wrong order, a definition it got wrong, a rule it ignored, something missing]. Update the SKILL.md to fix each one, and tell me exactly which lines you changed and why. Do not rewrite the whole file — show me a minimal edit.
```

- [ ] I applied the changes
- [ ] I ran the cold test again and the problems are gone
:::

:::lab Step 6 — Refinement round two: the colleague test
Now the real test of whether this is shareable.

```prompt
Read this SKILL.md as if you were a new colleague who has never done this job and does not know our company. Tell me:
1. Every place you would not know what to do
2. Every term or definition I have assumed you know
3. Every judgement call the Skill leaves ambiguous
4. What you would produce that I would consider wrong, and why
5. The one sentence I should add that would help most
```

- [ ] It found assumed knowledge I had not noticed
- [ ] I added the definitions it was missing
- [ ] I added the single most helpful sentence
:::

:::tip The colleague test is the whole difference between personal and team
A Skill that works for you often works because *you* fill the gaps in it — you know which report your manager wants, what "enterprise" means here, which project key is current. A colleague does not, and they will produce something wrong while following your Skill faithfully.

This one prompt is what turns a personal shortcut into a team asset.
:::

## Part 5 — Share it

:::lab Step 7 — Get it used
- [ ] Give it to **one** colleague, with a single sentence on when to use it
- [ ] Ask them to run it **without** you in the room
- [ ] Ask what confused them, and fix that
- [ ] Only then share it more widely
:::

:::concept Why one colleague first
The first external user finds most of the problems, and they find them cheaply. Sharing to a team of twelve before that happens generates twelve people's confusion at once, and most of them will quietly stop using it rather than tell you why.
:::

## Bundle it (optional)

Once you have three or four Skills that belong together, a **plugin** packages them — Skills, connectors, and sub-agents in one installable unit (Customize → Plugins).

```prompt
I have these Skills: [list them and what each does]. Explain how I would bundle them into a plugin for my team, what the structure would look like, and what I should include beyond the Skills themselves — a README, example prompts, and the reference files they share. Draft the README.
```

For most people this comes later. One well-tested Skill that a colleague actually uses beats four untested ones.

## Reflect

```reflect
Think about the job you chose for your Skill. Which correction did you make every time you ran it, and is that correction now a rule in your Skill?
```

```reflect
Which colleague will run your Skill first, without you in the room, and what do you expect will confuse them?
```

```quiz
Q: What is the "cold test" and why does it matter?
- Running the Skill on old data
+ Asking in natural language without pasting the brief — it is the only way to find out whether the description actually fires
- Testing it on a colleague's machine
- Running it without connectors
> If it only works when you paste the brief, you have not built a Skill.

Q: Your Skill did not activate. What is the most likely cause?
- The file is in the wrong folder
+ The description does not match how you phrased the request — this is by far the most common first-attempt failure
- The rules section is too long
- Cowork needs restarting
> Rewrite the description around the most common phrasings (within 200 characters), then test with three different ones.

Q: What does the "read this as a new colleague" pass reveal?
- Formatting problems
+ The assumed knowledge you fill in without noticing — which is exactly what makes a colleague produce something wrong while following your Skill faithfully
- Whether the Skill fires
- Performance issues
> It is the step that turns a personal shortcut into a team asset.

Q: Why share a new Skill with one colleague before the whole team?
- To get approval
+ The first external user finds most of the problems cheaply; a team of twelve generates twelve confusions at once and most will quietly stop using it
- To test permissions
- Team sharing requires approval
> One person, no supervision, then fix what confused them.
```

:::try Next
Next: a ready-to-adapt Skill for each function.
:::

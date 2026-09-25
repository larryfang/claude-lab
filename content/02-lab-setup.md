# Lab: Setup & Your Safe Sandbox

Twelve minutes to a working, safe Cowork setup. Do not skip the sandbox part — everyone who skips it eventually reorganises a folder they cared about.

## Part 1 — Find Cowork (3 min)

:::lab Step 1 — Open it
- [ ] Open **Claude Desktop**. (Cowork also runs on web and mobile, but this course uses Desktop for reliable local-folder access. A cloud session can reach a connected local folder only if you started it in Desktop, and only while Desktop stays open on that computer.)
- [ ] If your **message box** shows **Chat** and **Cowork**, choose **Cowork**. If you are on Pro or Max and there is no such choice, you already have the new Claude: every conversation can take a Cowork task
- [ ] You should be able to pick a folder or start a task
:::

:::details I cannot see Cowork
On Pro or Max with no Chat/Cowork choice at all? That is the new Claude, not a missing feature: describe the task in any conversation. Otherwise, check, in order:

1. **Plan** — Cowork needs Pro, Max, Team or Enterprise. Free plans do not have it.
2. **App version** — quit fully and reopen, or reinstall from `claude.com/download`. Cowork ships fast; stale builds miss features.
3. **Team/Enterprise admin settings** — on managed plans an admin may have turned it off (or, on Enterprise web and mobile, not turned it on yet). That is a one-line ask: *"Please enable Cowork for my seat."*
4. **Region / rollout** — availability has expanded in waves.

You can read every lesson and write every brief without access. Come back and run the labs when you have it.
:::

## Part 2 — Build the sandbox (4 min)

You are going to create a folder that contains nothing you care about, and do all your learning there.

:::lab Step 2 — Make a practice workspace
- [ ] Create a folder on your Desktop called `Cowork-Lab`
- [ ] Inside it, create five subfolders: `sales`, `gtm`, `product`, `finance`, `output`
- [ ] Drop in **copies** — never originals — of two or three real work files you would not mind losing and that contain no customer or personal data (an old export, a stale deck, some meeting notes)
- [ ] In Cowork, **grant access to `Cowork-Lab`** and nothing above it
:::

:::warning Why "copies, never originals"
Cowork can create, edit, move and rename files in the folder you grant. That is the whole value. It also means a badly-worded brief can genuinely reorganise or overwrite your work — and unlike deletions, which always trigger a permission prompt before anything is permanently removed, an edit or a rename does not. Grant the narrowest folder that lets the job get done — never your home directory, never `Documents`, never a synced Drive root you have not thought about.

Cloud-synced folders deserve extra suspicion: iCloud, OneDrive and Dropbox often keep only **placeholder stubs** locally, so a "copy" of a not-downloaded file copies an empty stub — one user lost real documents exactly this way when a reorganisation copied stubs and removed originals ([firsthand account](https://www.reddit.com/r/ClaudeAI/comments/1rwxnxe/claude_cowork_nuked_my_icloud_drive_documents/)). Sync is not backup — Anthropic's own guidance is to give Claude a dedicated working folder and "keep backups of important files" ([Use Claude Cowork safely](https://support.claude.com/en/articles/13364135-use-claude-cowork-safely)). Anything irreplaceable needs a real backup before Cowork touches its folder.
:::

## Part 3 — Set your guardrails (3 min)

Two habits, adopted now, will save you later.

:::lab Step 3 — Adopt the two habits
- [ ] **Habit 1: always ask for the plan.** End briefs with *"Show me your plan before you start."* For anything destructive, add *"and wait for my approval."*
- [ ] **Habit 2: write to `output/`, read from everywhere else.** Tell Cowork where deliverables go. It keeps source and result separate, so a bad run is one folder to delete.
:::

:::tip Approval modes
Cowork has three approval modes — **Manually approve**, **Automatically approve**, and **Skip all approvals**. (In the new Claude experience there are only two settings: **Manual**, the default, and **Auto**.) While you are learning, stay on **Manually approve**: Claude asks before actions that reach outside your folder, such as using a connector, sending a message or acting on a website. It does not ask before it edits, moves or renames files in the folder you granted — only permanent deletion always asks. That is why Habit 1 matters: the plan is where you catch a bad edit.
:::

Try it on something harmless:

```prompt
Look at the folders in this workspace and tell me what you can see — folder names, file names, file types and rough sizes. Do not change, move or create anything. Just describe what is here.
```

- [ ] Cowork listed my folders and files accurately
- [ ] It did **not** change anything

:::tip What you just proved
Two things. One: the access grant works and it is scoped where you think it is. Two: Cowork does what you asked and no more. Run a read-only probe like this any time you point Cowork at something new and unfamiliar — including a connector.
:::

## Part 4 — Know what you have connected (2 min)

Before you point Cowork at company data, know what is already wired up.

:::lab Step 4 — Audit your connectors
- [ ] Open **Customize → Connectors** (or the **+** menu in the message box)
- [ ] Write down, in a note, every connector already enabled and what it can reach
- [ ] Disable anything you do not recognise or do not need this week
:::

We wire up your real stack properly in Module 3. Right now you just need an honest inventory.

## The safety checklist you will reuse

Before any Cowork run on real data, four questions:

- [ ] **Scope** — is the granted folder the narrowest one that works?
- [ ] **Copies** — is anything irreplaceable in there? (If yes, take it out.)
- [ ] **Plan** — did I ask to see the plan first?
- [ ] **Blast radius** — if this run goes completely wrong, what is the worst outcome, and can I undo it?

If you cannot answer question four, you are not ready to run it.

## Reflect

Take two minutes to connect this lab to your real work.

```reflect
Which real work folder would you be most tempted to grant Cowork, and what is the narrowest folder inside it that would still get the job done?
```

```reflect
Think of one real job you want Cowork to run on real data: if it went completely wrong, what is the worst outcome, and how would you undo it?
```

```quiz
Q: Why grant Cowork the narrowest possible folder?
- To make it faster
+ Because it can create, edit, move and delete files anywhere in what you grant — narrow scope limits the blast radius of a bad brief
- Because wide folders are not supported
- To save disk space
> Scope is your primary safety control. Everything else is secondary.

Q: What is the point of the read-only probe ("describe what you see, change nothing")?
- It warms up the model
+ It proves the access grant is scoped where you think it is, and that Cowork does only what you asked
- It is required before every task
- It creates an index file
> Cheap, fast, and it catches a mis-scoped grant before that grant matters.

Q: You are about to run a brief that reorganises a folder of real client documents. What is the minimum you should do?
- Run it and check afterwards
+ Work on copies, ask for the plan and approval before it acts, and know how you would undo it
- Disconnect the internet
- Nothing; Cowork cannot delete files
> Copies, plan, approval, undo path. Every time, for anything destructive.
```

:::try Next
Sandbox ready. Now let us make it do something worth doing.
:::

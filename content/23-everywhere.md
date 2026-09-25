# Claude Where You Already Work

The Cowork window is headquarters. But your actual day happens in Excel, PowerPoint, Outlook, Slack, and on your phone between meetings — and Claude now works in all of them: in Office and on your phone with the same skills and connectors you have already set up, and in Slack with connections your admin sets per channel. This lesson is the map, so you stop copy-pasting between Claude and the tool the work actually lives in.

## The Microsoft 365 add-ins

Claude works **inside** Office — not on exported copies, but on the open file ([announcement](https://claude.com/blog/collaborate-with-claude-across-excel-powerpoint-word-and-outlook)):

| App | Status | What it does on the open file |
|---|---|---|
| **Excel** | GA, all paid plans | Answers with cell-level citations, changes assumptions without breaking formula chains, debugs errors, builds multi-tab models ([guide](https://claude.com/docs/office-agents/excel)) |
| **PowerPoint** | GA, all paid plans | Builds and restyles decks in your template, on the deck itself |
| **Word** | GA, all paid plans | Drafts and revises in the document, tracked-changes style |
| **Outlook** | Public beta | Inbox triage and drafts — **drafts land unsent, for your review**; calendar invites via the native event form ([guide](https://claude.com/docs/office-agents/outlook)) |

Two things make this more than a sidebar gimmick:

- **Your Skills work there.** Type **`/`** in the add-in sidebar and the skills you have turned on in **Customize → Skills** appear, if they fit that app — `/deck-check` before a QBR, `/variance-pack` in the live workbook — and skills also fire automatically when relevant ([office docs](https://claude.com/docs/office-agents/connectors-and-skills)). The skill you will build in Module 8 follows you into Office.
- **One conversation spans the apps.** Context carries across your open Excel, PowerPoint, Word and Outlook files — "use the Q3 numbers from the workbook in slide 4" works — once **Let Claude work across files** is on in each add-in's Settings. It is on by default for Pro and Max, off for Team and Enterprise (the exact label may vary; [work across apps](https://claude.com/docs/office-agents/work-across-apps)).

Google-side there is no equivalent sidebar for Docs/Sheets — the route there is the Drive/Gmail/Calendar connectors from Module 3.

:::warning The reality check: your IT decides, not you
On a company Microsoft 365 tenant, Office add-ins are **admin-controlled**. You can install "Claude for Microsoft 365" (Excel, PowerPoint, Word) yourself from AppSource only if IT allows Office Store access; many organisations do not, and IT deploys it centrally instead (Microsoft 365 Admin Center → Settings → Integrated apps). Outlook is a separate add-in, "Claude for Outlook", and it also needs a one-time Microsoft Graph consent from a Global Administrator ([Outlook guide](https://claude.com/docs/office-agents/outlook)). So this feature needs **two approvals that are often confused**: your Claude plan (the Anthropic side, which you may already have) *and* the add-in deployment (the Microsoft side, which many companies have not done). If the Claude add-in is missing from Office, or will not install, that is a policy gate — not a bug, and not something to work around with a personal account. (If the add-in opens but `/` lists no skills, that is a different fix: turn the skill on in **Customize → Skills**.)

The move is the same one Module 3 taught for a missing connector: **ask IT with a specific job and a specific benefit** — "the close commentary takes finance two days in Excel; the add-in cuts it to hours; here is Anthropic's admin deployment doc" beats "can we have the AI thing". And until the answer is yes, **nothing in this course is blocked**: export the workbook, drop it in your Cowork folder, and every lab works exactly as written — that file-based path is what the four lanes are built on.
:::

:::tip The lane pairings
💼 Sales → **Outlook** (triage + drafted follow-ups you approve) · 📣 GTM → **PowerPoint** (launch decks in your template) · 🧭 Product → **Word** (PRDs revised in place) · 🧾 Finance → **Excel** (this is the surface the finance lane kept pointing at).
:::

## Cowork in your pocket

Cowork runs in beta on **web and mobile** (Pro/Max/Team; Enterprise where enabled), with sessions running in Anthropic's cloud — start a task from your phone, steer it with follow-ups, review the output, resume a session you started elsewhere ([guide](https://support.claude.com/en/articles/15520349-use-claude-cowork-on-web-desktop-and-mobile)).

How you start a task depends on which version you see. If the message box shows a **Chat** / **Cowork** choice, pick **Cowork**. If there is no choice, you have the new Claude — rolling out from 16 September 2026, Pro and Max first — and any conversation can take a task ([announcement](https://claude.com/blog/cowork-is-now-claude)).

The honest caveats: **local folders, browser use and computer use** need the Claude Desktop app open and online on your computer (and local folders only for sessions started on desktop) — cloud sessions work from connectors and uploaded files instead. So the pattern that works is:

> **Kick off before the commute, review on the phone.** Start the account-brief run at your desk; approve the plan; read the finished brief on the train. Or start from the phone entirely, as long as the inputs come from connectors, not your laptop's folders.

And for the brief itself: **dictate it**. Mobile dictation is available on all plans ([guide](https://support.claude.com/en/articles/10065434-use-dictation-on-claude-mobile)) — a spoken brief is usually longer and richer than a typed one, and B.R.I.E.F. works just as well out loud.

## Claude in your team's Slack: Claude Tag

The old "Claude in Slack" app was replaced on **2026-08-03** by **Claude Tag** — public beta, **Team and Enterprise plans only**, and admin-provisioned rather than self-serve ([overview](https://claude.com/docs/claude-tag/overview) · [what is Claude Tag](https://support.claude.com/en/articles/15594475-what-is-claude-tag)).

Tag `@Claude` in a channel and hand it actual work: it posts its checklist in the thread, does the job (turn this decision thread into a doc; chase these three owners; investigate this customer report), and follows up on its own. An org Owner sets it up and controls which credentials and resources it can use per channel — so if you want it, this is a request to your admin naming a specific job, exactly like a missing connector in Module 3.

:::concept Same data rules, new doors
The Office add-ins and Cowork on your phone run on your own account: the same skills, the same connectors, the same permissions and data rules you set in Module 3. Claude Tag is different. It works from connections an Owner sets per channel, not from your account, so what it can reach depends on the channel, not on who you are — and anyone in that channel can use it ([overview](https://claude.com/docs/claude-tag/overview)).

So each door is a new trust decision, and your security team will want to know about each one: Tag's per-channel access, Outlook's Microsoft Graph consent, and add-in activity that does not appear in Enterprise audit logs ([work across apps](https://claude.com/docs/office-agents/work-across-apps)). Name them when you ask. Your data rules still apply everywhere.
:::

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: How do the Microsoft 365 add-ins differ from exporting a file?
A: Claude works **inside** Office on the open file, not on exported copies.

Q: How do you reach your Skills inside an Office add-in?
A: Type **`/`** in the add-in sidebar and the skills you turned on in **Customize → Skills** appear, if they fit that app. Skills also fire automatically when relevant.

Q: Which two approvals does the add-in need at work?
A: Your **Claude plan** (Anthropic side) *and* IT's **add-in deployment** (Microsoft side; Outlook also needs a one-time Microsoft Graph consent). Until IT says yes, export the file into Cowork.

Q: What happens to an email Claude for Outlook writes?
A: It lands as an **unsent draft** for your review. The send gate stays yours.

Q: What do Cowork sessions on web and mobile work from?
A: **Connectors and uploaded files.** Local folders, browser use and computer use need your desktop app open.

Q: Is using Claude in Office, Slack or mobile a new trust decision?
A: Yes, in part. Office and mobile run on your account, skills and connectors — but Outlook needs its own Microsoft Graph consent, and add-in activity is not in Enterprise audit logs. Claude Tag runs on connections an Owner sets per channel, not on your account. Your data rules still apply everywhere.
```

```quiz
Q: You spend close week inside a 40-tab workbook. Where should Claude meet you?
+ The Claude for Excel add-in — it works on the open workbook with cell-level citations and preserves formula chains
- Export the workbook and upload it to chat every time
- Screenshots of each tab
- Retype the numbers into Cowork
> The add-in works on the live file — where IT has deployed it. Until then, the export-to-Cowork path does the same jobs on a copy.

Q: The Claude add-in does not appear in Excel at work, though your colleague at another company has it. Most likely cause?
+ Your tenant's IT has not deployed the add-in — it is admin-controlled on company M365, so this is a policy request, not a troubleshooting session
- Claude does not support Excel at all
- Skills do not work in Excel
- You need to reinstall Windows
> Two approvals: the Claude plan (Anthropic side) and the add-in deployment (Microsoft side). Ask IT with a specific job, and use file exports meanwhile. (If the add-in opens but `/` lists no skills, turn the skill on in Customize → Skills.)

Q: What happens when Claude for Outlook writes an email for you?
+ It lands as an unsent draft for your review — the human send gate stays yours
- It sends immediately
- It only writes subject lines
- It CCs Anthropic
> Drafts, not sends. The same review-before-it-leaves rule the whole course teaches, enforced by the surface.

Q: You start a Cowork task from your phone on the train. What is the key constraint?
+ Cloud sessions work from connectors and uploads — your laptop's local folders need the desktop app open
- Mobile can only read, never start tasks
- Skills don't work on mobile
- There is no constraint
> Mobile Cowork is real, but local-folder and full browser/computer work still depend on an open Desktop app. Use cloud surfaces to start, steer and review; use Desktop when the job must reliably touch the machine.

Q: Your team wants Claude Tag in Slack. What is the correct move?
+ Ask your org admin, naming a specific job — it is Team/Enterprise only and admin-provisioned per channel
- Install it yourself from the Slack app store
- Use a personal account in the channel
- It does not exist
> Admin-gated, like connectors on managed plans. A concrete ask beats a vague one.
```

:::try Module complete
That is the full connection story: files, connectors, the live web, and now the apps and devices you already live in. Pick your lane and put it to work.
:::

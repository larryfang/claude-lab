# Lab: Wire Up CRM, Mail & Docs

Sixteen minutes. At the end you will have at least one live connector, a proof that it works, and a written record of what you granted.

:::warning Before you start
Do the connector audit and write your six data rules from the last lesson. If you have not, do that first — this lab is where they start to matter.
:::

## Part 1 — Connect one thing (5 min)

**One.** The one whose data you retype most often. Adding five connectors before you have used one is how this stalls.

| Lane | Start with |
|---|---|
| 💼 Sales | Your CRM — HubSpot, or Salesforce if your admin has set up its beta connector; otherwise a CSV export |
| 📣 GTM | Your analytics or warehouse; if that is hard, your docs/wiki |
| 🧭 Product | Jira or Linear |
| 🧾 Finance | Drive or M365 — wherever your exports live |

:::lab Step 1 — Add the connector
- [ ] **Customize → Connectors** → **+** → find your system → **Connect** (the exact label may vary)
- [ ] Complete the OAuth sign-in in the browser window that opens
- [ ] **Read the consent screen.** Actually read it. Note whether it is asking for read or read-write
- [ ] Return to Claude and confirm the connector shows as connected
- [ ] Select the connector in **Customize → Connectors**, open **Tool permissions**, and set its write/delete tools to **Blocked**. Unblock one tool later only when a job needs it
- [ ] In Cowork, set the mode selector in the message box to **Manual** for this lab — in **Auto** mode, Claude itself decides on tools marked *Needs approval*
:::

:::details It is not in the list
Three routes, in order of ease:

1. **Check for an official connector under a different name.** "Atlassian" covers Jira and Confluence; Google's connectors are listed separately — Gmail, Google Calendar and Google Drive (Drive covers Docs and Sheets).
2. **Check whether the vendor hosts its own remote MCP server.** Its own documentation gives the URL, which you add as a custom connector. Add only servers built and hosted by an organisation you trust — a star count is not a security check. An MCP server runs with your credentials, and on Team/Enterprise only an Owner can add one ([custom connectors guide](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)).
3. **Fall back to files.** Export a CSV and drop it in your workspace folder. Less elegant, works today, and every lab in this course is written to work either way.

On a Team or Enterprise plan, a missing connector is usually an admin policy. Ask, naming the job.
:::

### Two worked examples, end to end

The steps above are generic on purpose. Here are the two connectors this course's readers ask about most, walked through completely — do one of them even if your lane starts elsewhere, because the pattern transfers to every connector.

:::details Worked example — Atlassian (Jira + Confluence) via MCP
Atlassian's official **Rovo MCP server** covers Jira, Confluence and JSM, and sits in the connector directory ([claude.com/connectors/atlassian](https://claude.com/connectors/atlassian)).

1. **Customize → Connectors → +** → search **Atlassian** → **Connect**
2. The OAuth screen lists the site and the access it requests. Signing in does not make the connector read-only: to do that, select **Atlassian** in **Customize → Connectors** and set its write tools (such as `createJiraIssue` and `editJiraIssue`) to **Blocked** under **Tool permissions**
3. Every action then runs **as you**: Atlassian's own docs state that "all actions respect users' existing access controls and permissions" ([Atlassian's getting-started guide](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/getting-started-with-the-atlassian-remote-mcp-server/))

Smoke-test it with something you can check in ten seconds:

```prompt
Using the Atlassian connector only: (1) list every issue in project [YOUR-KEY] that changed status in the last 7 days — key, summary, status, assignee; (2) find the most recently updated Confluence page in space [YOUR-SPACE] and give me its title, author, and last-edited date. Tell me which Jira site you queried. Change nothing.
```

Then the cross-source move that makes it real: *"Draft next week's sprint update from the Jira changes above, using the format of that Confluence page."*

If your admin has not enabled the directory connector, the same server is reachable as a **custom connector by URL** — `https://mcp.atlassian.com/v2/mcp` (Atlassian's current endpoint; existing v1 connections move to v2 tools on 1 March 2027) ([Atlassian docs](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/getting-started-with-the-atlassian-remote-mcp-server/)). On managed plans that still needs an Owner — which is the policy conversation from the last lesson. One more thing your admin will want to know: Atlassian draws MCP calls from your organisation's shared pool of Rovo credits.
:::

:::details Worked example — Gmail
Gmail is a first-party Google Workspace connector (with Calendar and Drive alongside), available on all plans ([Google Workspace connectors guide](https://support.claude.com/en/articles/10166901-use-google-workspace-connectors)).

1. **Customize → Connectors** → **Gmail** → **Connect** → Google OAuth
2. Read the consent screen — this one can **read, draft, send, reply and forward**. By default Claude asks for your approval before each send, reply or forward, and on Team/Enterprise, Owners decide whether members can waive that. But in Cowork's **Auto** mode Claude itself decides on tools marked *Needs approval*. So keep the Cowork mode on **Manual**, and in Gmail's **Tool permissions** set send, reply and forward to **Blocked** — that is the "read and write are different grants" rule from the last lesson, and Blocked is the only setting that holds in every mode.

Smoke-test with a known answer:

```prompt
Using the Gmail connector only, find every email from the [customer-domain.com] domain in the last 14 days. Table: date, sender, subject, one-line gist. Then tell me the date of my single most recent email with them. Read-only — draft nothing, send nothing.
```

Then the useful version: *"For each thread above where they asked a question we have not answered, draft (do not send) a reply in my tone."* Unblock only the draft tool for this; send, reply and forward stay Blocked. Drafts land in your Gmail drafts folder — the human-review gate stays yours.
:::

## Part 2 — The read-only smoke test (4 min)

Never trust a connector because it says "connected". Prove it, with a query where you already know the answer.

:::lab Step 2 — Prove it works
Pick your lane and run it in Cowork:

**💼 Sales**
```prompt
Using the CRM connector only, list my five open opportunities with the nearest close dates. For each: account name, stage, amount, close date, and the date of the last logged activity. Present as a table. Do not modify anything in the CRM. Do not use any other source.
```

**📣 GTM**
```prompt
Using the connector only, list the five most recent records available to me in [YOUR SYSTEM], with their key fields as a table. Tell me explicitly what date range you can see and what you cannot access. Do not modify anything.
```

**🧭 Product**
```prompt
Using the Jira connector only, list all issues in project [YOUR-KEY] that changed status in the last 14 days. For each: key, summary, status, assignee, and the date of the change. Present as a table. Do not modify any issue. Do not use any other source.
```

**🧾 Finance**
```prompt
Using the [Drive / M365] connector only, find the most recent [expense / AR / budget] export in [FOLDER], and give me its row count, date range, column names, and the grand total of the amount column. Tell me explicitly which file and version you read. Do not modify anything. Do not use any other source.
```

- [ ] The results came back
- [ ] I **checked them against the real system** and they match
- [ ] Nothing was modified
:::

:::warning If the numbers do not match, stop here
A connector returning subtly wrong data — a stale cache, the wrong sandbox instance, a filter you did not expect, a permission silently trimming rows — will poison every downstream deliverable, invisibly. Sort it out before you build anything on top of it.

Ask directly: *"Which instance, project and date range did you query, and how many records did you have access to versus how many you returned?"*
:::

## Part 3 — Cross-source, the actual point (5 min)

One connector is convenient. Two is where the work changes, because Cowork can do the cross-referencing you currently do by hand.

:::lab Step 3 — Add a second source and join them
Add a second connector, or drop a relevant export into your workspace folder. Then:

**💼 Sales**
```prompt
Cross-reference my open CRM opportunities against my email. For every opportunity where the last logged CRM activity is more than 14 days ago, check whether there has been email contact with anyone at that account since. Produce `output/stale-deals.md` with a table: account, stage, amount, days since CRM activity, days since any email, and a one-line assessment of whether this deal is actually stale or just badly logged. Read-only — do not update the CRM or send anything.
```

**📣 GTM**
```prompt
Cross-reference our campaign performance data with the CRM opportunity records. Produce `output/campaign-to-pipeline.md` showing, per campaign or channel, the MQLs claimed by marketing against the opportunities actually created in the CRM, and where those two stories disagree. Be explicit about which records you could not match and why. Read-only.
```

**🧭 Product**
```prompt
Cross-reference the Jira issues in [YOUR-KEY] against our support tickets or customer feedback. Produce `output/backlog-evidence.md` with a table: Jira key, summary, current priority, number of linked customer complaints, and the ARR of the accounts affected — plus a column flagging every issue where the priority in Jira looks inconsistent with the customer evidence. List anything you could not match. Read-only.
```

**🧾 Finance**
```prompt
Cross-reference our open invoices export against my email. For every invoice more than 14 days overdue, check whether there has been any email from that customer's domain since the due date — a payment promise, a dispute, a query. Produce `output/ar-context.md` with a table: customer, invoice id, amount, days overdue, last email date, and a one-line note on what the email actually says. List every customer where you found nothing. Read-only — draft nothing, send nothing.
```

- [ ] It produced the cross-referenced deliverable
- [ ] It told me what it **could not** match
- [ ] I spot-checked three rows against both systems
:::

:::tip This is the moment it clicks for most people
The single-source query was a nicer search box. The cross-reference is a job you were doing manually, in a spreadsheet, on a Friday afternoon — and it now takes ninety seconds. Note which cross-reference in your own work would be most valuable, because that is your first Skill in Module 8.
:::

## Part 4 — Write it down (2 min)

:::lab Step 4 — Your access record
Create `Cowork-Lab/ACCESS-LOG.md` and record:

- [ ] Every connector enabled, and the date
- [ ] Read-only or read-write, for each
- [ ] What each one can reach — which instance, project, mailbox, folder
- [ ] Anything you deliberately did **not** connect, and why
- [ ] Your six data rules from the last lesson
- [ ] Who reviews output before it leaves the building
:::

This takes two minutes and is the document that makes a security conversation short. It is also how you notice, in three months, that you still have write access to production Jira from a job you ran once.

## Troubleshooting

:::details The connector is connected but returns nothing
Check, in order: are you querying the right instance or workspace (production versus sandbox)? Does your own account have access to those records? Is your filter or date range excluding everything? Ask Cowork to state exactly what query it ran — half the time the query is wrong, not the connection.
:::

:::details It says it cannot access the connector mid-run
Sign-ins expire or get revoked — a password change, an admin policy, or the service's own token lifetime. Disconnect and reconnect under Customize → Connectors. If a scheduled task started failing silently, this is usually why, which is a good argument for scheduled jobs that report their own failures.
:::

:::details It returned fewer records than I expected
Two likely causes, both worth knowing about. Permissions may be trimming rows your account cannot see. Or the connector may be paginating and Cowork stopped at the first page. Ask: *"How many records matched in total, and how many did you actually retrieve?"* For large pulls, an export to CSV is often more reliable than a live query.
:::

## Reflect

Take two minutes to connect this lab to your real work.

```reflect
Which cross-reference between two systems do you do by hand today, and how much of your week does it take?
```

```reflect
Look at your ACCESS-LOG.md: which grant would you be least comfortable explaining to your security team, and what would you change about it?
```

```quiz
Q: Why run a read-only smoke test on a new connector?
- To warm the cache
+ Because a connector returning subtly wrong data poisons every downstream deliverable invisibly — you check it against a known answer first
- It is required before writing
- To generate an audit log
> "Connected" is not the same as "correct". Query something you already know the answer to.

Q: What is the real unlock of having two connectors rather than one?
- Twice the data
+ Cross-referencing — Cowork can do the manual joins between systems that you currently do in a spreadsheet
- Faster queries
- Better formatting
> One source is a better search box. Two is a job off your list.

Q: A scheduled Cowork task quietly stops producing output. Most likely cause?
- The model changed
+ A connector's auth token expired and nothing was watching
- Scheduled tasks only run once
- Too much data
> Sign-ins expire or get revoked. Build scheduled jobs that report their own failures, and check them.

Q: Why keep an ACCESS-LOG.md?
- It is required by Claude
+ It makes security conversations short, and it is how you notice stale write access months later
- It improves output quality
- It speeds up connectors
> Two minutes of writing, and it is the difference between "we have this documented" and an awkward meeting.
```

:::try Next
Local files: done. Company systems: done. One source left — the live web.
:::

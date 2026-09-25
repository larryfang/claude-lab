# Glossary

Every term used in this lab, in one sentence each.

## The core ideas

**Cowork** — Claude that takes on a whole multi-step job, working on real files and producing real deliverables, rather than answering turn by turn. Selected with the Chat / Cowork choice in the message box; with no choice there, you have the new Claude, where you describe the task in any conversation. Available on desktop, web and mobile.

**Brief** — the instructions you give Cowork for a whole job. Longer and more specific than a prompt, and the single biggest determinant of output quality.

**B.R.I.E.F.** — the five parts of a good brief: **B**ackground, **R**esult, **I**nputs, **E**dges, **F**lag.

**Outcome-oriented** — describing the finished result you want rather than the steps to get there. The central mindset shift of this course.

**Deliverable** — a real file: a spreadsheet with live formulas, a deck, a formatted document, a CSV, an organised folder. Not text in a chat window.

**The plan** — the steps Cowork shows you before or as it acts. Your cheapest intervention point.

**Fan-out** — producing one deliverable per item: a brief per account, a file per competitor, a report per region.

**Two-artefact rule** — always ask for a data artefact (the audit trail) alongside the narrative artefact (the argument), so the narrative is checkable.

## Access and tools

**Connector** — a plug that lets Claude talk to another system: Salesforce, HubSpot, Jira, Confluence, Gmail, Slack, Drive, Notion.

**MCP (Model Context Protocol)** — the open standard most connectors speak. The "USB-C for AI": a tool implements it once and any MCP-speaking assistant can use it.

**Claude in Chrome** — a browser extension that lets Claude read and act on web pages in your own logged-in session. Not sandboxed.

**Workspace folder** — the folder you grant Cowork. It reads and writes there and nowhere else. Your primary safety control.

**Smoke test** — a read-only query with a known answer, run against a new connector to prove it returns correct data before you build anything on it.

**Access log** — your own written record of every connector, its access level, what it can reach, and who reviews output. Two minutes to write; makes security conversations short.

## Making it repeatable

**Skill** — a folder containing a `SKILL.md`: a description of when to use it plus instructions for doing a job your way. A brief that lives in a file.

**Frontmatter** — the `name` and `description` between `---` lines at the top of a `SKILL.md`. The description determines whether the Skill fires.

**Cold test** — asking for a Skill's job in natural language, without pasting the brief, to find out whether the description actually matches.

**Progressive disclosure** — Claude reads every Skill's description but loads full instructions only when relevant, so many Skills do not bloat every conversation.

**Plugin** — a bundle of Skills, connectors, and sub-agents, packaged so a team can install the whole playbook at once (Customize → Plugins).

**Project** — a persistent Cowork workspace with its own files, instructions, memory, and scheduled tasks. Where you stop re-explaining your business.

**Project instructions** — standing context applied to every task in a Project: your definitions, your unreliable-fields list, your standing rules.

**Scheduled task** — a saved job that runs on a cadence. Runs with nobody reading the plan, so: read-only, tested manually, and it must report its own failures.

**Subagent** — a parallel worker Cowork spawns to handle part of a big job. Subagents do not share context mid-run, which is why fan-outs need a consolidation pass.

**Handover package** — the four things a colleague needs: the Skills, the Project instructions, the connector list with smoke tests, and three example requests.

## Failure modes

**The Confident Gap** — a missing value replaced with a plausible invented one. Prevented by *"never estimate; write 'not recorded'"*.

**The Silent Exclusion** — records dropped from a calculation without being reported. Caught by comparing row count in to row count out.

**The Drift** — criteria or scoring that shift across a long run or across parallel subagents. Fixed with a consolidation pass.

**The Eager Rewrite** — modifying, renaming or deleting source files you did not intend. The only failure mode that is not recoverable. Prevented by copies, narrow scope, and explicit write boundaries.

**Smoothing** — a limitation stated plainly in a source document becoming a positive framing downstream. Nothing false, and a rep can no longer answer the question.

**Prompt injection** — instructions hidden inside content Cowork reads — a document, an email, a web page — that the agent may then follow. Never chain untrusted input to a privileged action in one unattended run.

**Decay** — a scheduled job or Project memory quietly going out of date as field names, definitions and thresholds change. Fixed by a quarterly review.

## Verification

**The four-check pass** — trace three random numbers to source; compare row counts; verify three quotes and three external claims; read the flag section.

**OBSERVED / INFERRED** — labelling what a source actually says separately from your reading of it, so inference cannot be repeated as fact.

**Inline citation** — a source stated in the text where the claim is made, not in a bibliography. Citations at the end get skimmed; inline ones get checked.

**Red-team pass** — asking Cowork to attack its own deliverable as the person most motivated to find a problem with it.

**Sample size column** — the count of underlying records next to every ranking, so you do not reallocate budget on the basis of two data points.

**Trust score** — Cowork's own assessment of how much a dataset can be relied on, with reasoning. Asked for in the ground-truth pass.

## Role terms used in this lab

**Pre-call brief** — a one-page research summary on an account and its people, produced before a first call.

**Deal review pack** — a risk-ranked view of open opportunities with evidence and actions, for a manager's weekly review.

**Answer bank** — a sourced, dated store of your answers to recurring RFP and security-questionnaire questions. The reusable asset in RFP work.

**Messaging house** — the launch foundation: one-liner, problem, pillars with proof, audience, boundaries, competitive frame, proof inventory, evidence gaps.

**Battlecard** — a one-page competitor reference for reps: where we win, where they win, their likely attack, and what not to say.

**Funnel model** — a spreadsheet of stage-to-stage conversion by channel and period, with live formulas and sample sizes.

**Insight report** — a themed, quote-backed synthesis of discovery interviews, with contradictions left unresolved.

**Evidence-backed PRD** — a spec where every requirement cites the evidence for it, and requirements with no evidence are listed as such.

**Loop closing** — telling the customer who requested something that it has shipped, referencing their original words.

## Claude surfaces

**Claude.ai / chat** — the browser interface. Answers and drafts, turn by turn.

**Claude Desktop** — the full local surface: chat, Cowork, connected folders, browser use, computer use and local connectors. Cloud sessions on web or mobile can reach a folder connected on your computer only while Desktop is open there and the session was started on desktop.

**Claude Code** — the terminal-based agent for codebases. A separate course in this lab.

**Claude for Excel** — the add-in that works on an open workbook directly: reads live formulas, edits without breaking dependencies, debugs formula errors. The better surface for heavy spreadsheet work — on company Microsoft 365 tenants an admin often has to allow or deploy it, so its absence is usually a policy request, not a bug.

**Web and mobile Cowork (beta)** — Cowork also runs on claude.ai and the mobile apps. Cloud sessions work directly with account files, Projects and connectors; they can reach connected local folders (only in a session started on desktop), browser use and computer use through an open Desktop app, with some desktop-only limitations. The product ships fast and evolves quickly, so screens and features shift; the concepts in this course do not.

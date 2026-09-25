/* ============================================================
   Claude Lab — Course manifest (multi-course)
   Lesson bodies live in /content/**.md and load on demand.
   Add a course = push to window.COURSES. Add a lesson = add a file
   under /content and register it in the course's module here.
   ============================================================ */
window.SITE = {
  title: "Claude Lab",
  tagline: "Hands-on, interactive courses for getting genuinely good at Claude.",
  repo: "https://github.com/larryfang/claude-lab"
};

var COWORK_COURSE = {
  id: "cowork",
  slug: "cowork-for-gtm",
  emoji: "🤝",
  title: "Claude Cowork for Sales, GTM, Product & Finance",
  tagline: "Stop prompting. Start delegating. A hands-on lab that turns Cowork into a teammate who does your account research, launch kits, PRDs, and variance packs — no code required.",
  audience: "AEs · GTM & PMM · Product managers · Finance",
  level: "No code required",
  glossary: "glossary",
  fastPaths: [
    { id: "essentials", emoji: "⚡", title: "90-minute essentials", audience: "Anyone new to Cowork", desc: "Learn the safe delegation loop: set up, brief, steer, produce a real deliverable, and verify it.", lessons: ["welcome", "what-is-cowork", "lab-setup", "lab-first-run", "the-brief", "deliverables", "steering", "verify"] },
    { id: "sales", emoji: "💼", title: "Sales quick start", audience: "AEs and sales engineers", desc: "Get from safe setup to a defensible pre-call brief and pipeline review.", lessons: ["welcome", "what-is-cowork", "lab-setup", "the-brief", "connectors-trust", "sales-plays", "lab-account-brief", "lab-pipeline", "verify"] },
    { id: "gtm", emoji: "📣", title: "GTM quick start", audience: "PMM and growth teams", desc: "Build a launch kit and evidence-backed battlecard without losing control of claims.", lessons: ["welcome", "what-is-cowork", "lab-setup", "the-brief", "connectors-trust", "gtm-plays", "lab-launch-kit", "lab-battlecard", "verify"] },
    { id: "product", emoji: "🧭", title: "Product quick start", audience: "Product managers", desc: "Turn research into an insight report and PRD you can trace and defend.", lessons: ["welcome", "what-is-cowork", "lab-setup", "the-brief", "product-plays", "lab-discovery", "lab-prd", "verify"] },
    { id: "finance", emoji: "🧾", title: "Finance quick start", audience: "Finance and RevOps", desc: "Create a live-formula variance pack and reconciliation workflow with a strict review pass.", lessons: ["welcome", "what-is-cowork", "lab-setup", "the-brief", "finance-plays", "lab-variance", "lab-reconciliation", "verify"] }
  ],
  freshness: {
    "what-is-cowork": { verifiedDate: "2026-08-26", sourceLabel: "Claude Help Center", sourceUrl: "https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork" },
    "lab-setup": { verifiedDate: "2026-08-26", sourceLabel: "Claude Help Center", sourceUrl: "https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork" },
    "workspace-tour": { verifiedDate: "2026-08-26", sourceLabel: "Claude Help Center", sourceUrl: "https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork" },
    "connectors-trust": { verifiedDate: "2026-08-26", sourceLabel: "Claude Help Center", sourceUrl: "https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities" },
    "chrome-research": { verifiedDate: "2026-08-26", sourceLabel: "Claude Help Center", sourceUrl: "https://support.claude.com/en/articles/11088861-use-research-on-claude" },
    "everywhere": { verifiedDate: "2026-08-26", sourceLabel: "Claude Help Center", sourceUrl: "https://support.claude.com/en/articles/15520349-use-claude-cowork-on-web-desktop-and-mobile" },
    "skills": { verifiedDate: "2026-08-26", sourceLabel: "Claude Help Center", sourceUrl: "https://support.claude.com/en/articles/12512198-how-to-create-custom-skills" }
  },
  modules: [
    {
      id: "start-here",
      emoji: "🚀",
      title: "Start Here",
      desc: "Pick your lane, learn the one mindset shift that matters, and hand Cowork its first real job today.",
      lessons: [
        { id: "welcome", file: "00-welcome.md", title: "Welcome: Hire Your AI Teammate", minutes: 6, level: "Beginner",
          summary: "How the lab works, the four role lanes, and the one rule for getting value out of it.",
          keywords: ["intro", "start", "overview", "syllabus", "sales", "gtm", "product", "finance", "lanes"] },
        { id: "what-is-cowork", file: "01-what-is-cowork.md", title: "Cowork in Eight Minutes", minutes: 8, level: "Beginner",
          summary: "Outcome instead of prompt: what Cowork is, what it is not, and when to reach for it.",
          keywords: ["cowork", "what is", "agentic", "agent", "outcome", "chat vs cowork", "claude code"] },
        { id: "lab-setup", file: "02-lab-setup.md", title: "Lab: Setup & Your Safe Sandbox", minutes: 12, level: "Beginner",
          summary: "Hands-on. Get Cowork open, build a throwaway workspace, and set the guardrails before you touch real data.",
          keywords: ["setup", "install", "sandbox", "folder", "permissions", "safety", "desktop", "plan"] },
        { id: "lab-first-run", file: "03-lab-first-run.md", title: "Lab: Your First Cowork Job", minutes: 18, level: "Beginner",
          summary: "Hands-on. One brief, four role variants, one finished deliverable on your disk.",
          keywords: ["lab", "first task", "hands on", "deliverable", "brief", "practice"] }
      ]
    },
    {
      id: "fundamentals",
      emoji: "🧠",
      title: "Cowork Fundamentals",
      desc: "The craft: how to write a brief, what deliverables to ask for, and how to steer a running agent.",
      lessons: [
        { id: "workspace-tour", file: "10-workspace-tour.md", title: "The Cowork Workspace", minutes: 8, level: "Core",
          summary: "Folders, the task box, the plan, the activity feed, subagents, schedules and projects — what each one is for.",
          keywords: ["tour", "workspace", "folders", "sandbox", "subagents", "schedule", "projects", "ui"] },
        { id: "the-brief", file: "11-the-brief.md", title: "The B.R.I.E.F. Framework", minutes: 11, level: "Core",
          summary: "Five parts every good Cowork brief has. Skip one and you get confident, useless work.",
          keywords: ["brief", "prompting", "framework", "outcome", "constraints", "sources", "format"] },
        { id: "deliverables", file: "12-deliverables.md", title: "Ask for Real Deliverables", minutes: 10, level: "Core",
          summary: "Decks, spreadsheets with live formulas, docs, CSVs — plus interactive artifacts and self-refreshing live dashboards.",
          keywords: ["deliverables", "excel", "powerpoint", "word", "csv", "artifacts", "live artifacts", "dashboard", "output", "format"] },
        { id: "steering", file: "13-steering.md", title: "Plans, Steering & When to Stop", minutes: 9, level: "Core",
          summary: "Read the plan, interrupt early, redirect cheaply, and recognise the four ways a run goes wrong.",
          keywords: ["plan", "steering", "interrupt", "redirect", "stop", "failure", "review", "control"] },
        { id: "lab-brief", file: "14-lab-brief.md", title: "Lab: Fix a Bad Brief", minutes: 15, level: "Core",
          summary: "Hands-on. Run a lazy brief, feel the mediocre output, then rewrite it with B.R.I.E.F. and compare.",
          keywords: ["lab", "brief", "rewrite", "compare", "quality", "practice"] },
        { id: "great-run", file: "15-anatomy-great-run.md", title: "Anatomy of a Great Run", minutes: 14, level: "Core",
          summary: "One complete run from brief to sendable pack, with the operator's thinking on the page — and where the time really goes.",
          keywords: ["worked example", "end to end", "walkthrough", "plan review", "steering", "verification", "timeline", "deal review"] }
      ]
    },
    {
      id: "connect",
      emoji: "🔌",
      title: "Connect Your Revenue Stack",
      desc: "Cowork is only as good as what it can see. Plug in CRM, mail, chat, docs and the web — safely — then meet Claude inside Office, Slack and your phone.",
      lessons: [
        { id: "connectors-trust", file: "20-connectors-trust.md", title: "Connectors & the Trust Model", minutes: 11, level: "Core",
          summary: "What MCP and connectors actually are, what Claude can and cannot see, and the data rules to agree before you start.",
          keywords: ["connectors", "mcp", "custom connector", "remote mcp", "oauth", "permissions", "security", "pii", "trust", "data"] },
        { id: "lab-connect", file: "21-lab-connect.md", title: "Lab: Wire Up CRM, Mail & Docs", minutes: 18, level: "Core",
          summary: "Hands-on. Add your connectors, prove each one works with a read-only smoke test, and log what you granted.",
          keywords: ["lab", "connect", "salesforce", "hubspot", "gmail", "slack", "drive", "jira", "atlassian", "confluence", "mcp", "setup"] },
        { id: "chrome-research", file: "22-chrome-research.md", title: "Web Research: Search, Research & Chrome", minutes: 11, level: "Core",
          summary: "The research ladder — built-in web search, the cited Research mode, and Claude in Chrome for what sits behind your login.",
          keywords: ["chrome", "browser", "web", "research", "web search", "research mode", "citations", "extension", "computer use", "scraping"] },
        { id: "everywhere", file: "23-everywhere.md", title: "Claude Where You Already Work", minutes: 10, level: "Core",
          summary: "Excel, PowerPoint, Word and Outlook add-ins (your skills work there too), Cowork on mobile, dictated briefs, and Claude Tag in Slack.",
          keywords: ["excel", "powerpoint", "word", "outlook", "office", "m365", "add-in", "mobile", "phone", "dictation", "slack", "claude tag"] }
      ]
    },
    {
      id: "sales",
      emoji: "💼",
      title: "Lane 1 — Sales",
      desc: "For AEs and sales engineers: pre-call briefs, pipeline hygiene, outreach, and RFP responses.",
      lessons: [
        { id: "sales-plays", file: "30-sales-plays.md", title: "The Six Sales Plays", minutes: 10, level: "Core",
          summary: "The Cowork jobs that pay for themselves in week one, ranked by hours saved per rep.",
          keywords: ["sales", "plays", "ae", "pipeline", "prospecting", "mutual action plan", "roi"] },
        { id: "lab-account-brief", file: "31-lab-account-brief.md", title: "Lab: Account Research → Pre-Call Brief", minutes: 20, level: "Core",
          summary: "Hands-on. Company, people, news, CRM history and open questions on one page, before the call.",
          keywords: ["lab", "account research", "pre-call", "brief", "discovery", "prospect", "meeting prep"] },
        { id: "lab-pipeline", file: "32-lab-pipeline.md", title: "Lab: Pipeline Hygiene & Deal Review Pack", minutes: 20, level: "Core",
          summary: "Hands-on. Turn a messy opportunity export into a risk-ranked deal review your manager will actually read.",
          keywords: ["lab", "pipeline", "forecast", "deal review", "hygiene", "risk", "spreadsheet", "meddicc"] },
        { id: "lab-outreach", file: "33-lab-outreach.md", title: "Lab: Outreach & RFP Answers at Scale", minutes: 20, level: "Core",
          summary: "Hands-on. Personalised sequences for a target list, plus a first-pass answer to a security questionnaire.",
          keywords: ["lab", "outreach", "sequence", "email", "personalisation", "rfp", "questionnaire", "security review"] }
      ]
    },
    {
      id: "gtm",
      emoji: "📣",
      title: "Lane 2 — GTM & Product Marketing",
      desc: "For PMM and growth: launch kits, battlecards, campaign readouts, and voice-of-customer evidence.",
      lessons: [
        { id: "gtm-plays", file: "40-gtm-plays.md", title: "The GTM Plays", minutes: 10, level: "Core",
          summary: "Where Cowork changes the economics of GTM work — and the two places it must not be trusted.",
          keywords: ["gtm", "pmm", "plays", "launch", "positioning", "messaging", "enablement", "growth"] },
        { id: "lab-launch-kit", file: "41-lab-launch-kit.md", title: "Lab: A Whole Launch Kit in One Run", minutes: 22, level: "Core",
          summary: "Hands-on. Messaging house, one-pager, FAQ, sales script and enablement deck from a single brief.",
          keywords: ["lab", "launch", "kit", "messaging", "one-pager", "faq", "enablement", "deck", "gtm"] },
        { id: "lab-battlecard", file: "42-lab-battlecard.md", title: "Lab: Battlecard from Live Sources", minutes: 20, level: "Core",
          summary: "Hands-on. Build a competitor battlecard with citations, then stress-test every claim for made-up facts.",
          keywords: ["lab", "battlecard", "competitive", "competitor", "research", "citations", "objection handling"] },
        { id: "lab-campaign-readout", file: "43-lab-campaign-readout.md", title: "Lab: Campaign Readout & Funnel Story", minutes: 20, level: "Core",
          summary: "Hands-on. Raw campaign CSVs in, an honest exec readout with a spreadsheet model out.",
          keywords: ["lab", "campaign", "readout", "funnel", "metrics", "analytics", "spreadsheet", "attribution"] }
      ]
    },
    {
      id: "product",
      emoji: "🧭",
      title: "Lane 3 — Product Management",
      desc: "For PMs: discovery synthesis, evidence-backed PRDs, and stakeholder updates straight from the tracker.",
      lessons: [
        { id: "product-plays", file: "50-product-plays.md", title: "The Product Plays", minutes: 10, level: "Core",
          summary: "The PM work Cowork is genuinely good at, and the judgement calls it must never make for you.",
          keywords: ["product", "pm", "plays", "discovery", "prd", "roadmap", "prioritisation", "stakeholder"] },
        { id: "lab-discovery", file: "51-lab-discovery.md", title: "Lab: Transcripts → Insight Report", minutes: 22, level: "Core",
          summary: "Hands-on. Six interviews into a themed, quote-backed insight report you can defend in a review.",
          keywords: ["lab", "discovery", "interviews", "transcripts", "synthesis", "themes", "research", "quotes"] },
        { id: "lab-prd", file: "52-lab-prd.md", title: "Lab: The Evidence-Backed PRD", minutes: 22, level: "Core",
          summary: "Hands-on. Turn a brain-dump plus real evidence into a PRD, then have Cowork attack its own weak points.",
          keywords: ["lab", "prd", "requirements", "spec", "evidence", "red team", "writing", "document"] },
        { id: "lab-roadmap-update", file: "53-lab-roadmap-update.md", title: "Lab: Stakeholder Update from the Tracker", minutes: 20, level: "Core",
          summary: "Hands-on. Jira in, three audience-specific updates out — exec, team, and customer-facing.",
          keywords: ["lab", "roadmap", "jira", "status update", "stakeholder", "exec", "release notes", "reporting"] }
      ]
    },
    {
      id: "finance",
      emoji: "🧾",
      title: "Lane 4 — Finance",
      desc: "For finance and RevOps: variance packs, reconciliations, chase drafts, forecasts, and a board pack that survives a proofread.",
      lessons: [
        { id: "finance-plays", file: "54-finance-plays.md", title: "The Six Finance Plays", minutes: 10, level: "Core",
          summary: "The close-week jobs Cowork is built for, the official finance plugin and templates, and the lines it must never cross.",
          keywords: ["finance", "plays", "cfo", "close", "variance", "reconciliation", "forecast", "plugin", "excel"] },
        { id: "lab-variance", file: "55-lab-variance.md", title: "Lab: Month-End Variance Pack", minutes: 22, level: "Core",
          summary: "Hands-on. Budget vs actuals into a live-formula workbook, a waterfall that ties, and a CFO-ready commentary.",
          keywords: ["lab", "variance", "budget", "actuals", "waterfall", "month-end", "close", "spreadsheet", "formulas"] },
        { id: "lab-reconciliation", file: "56-lab-reconciliation.md", title: "Lab: Three-Way Reconciliation & the Chase", minutes: 20, level: "Core",
          summary: "Hands-on. Invoices, payments and the bank statement matched against seeded errors, plus tone-graded chase drafts.",
          keywords: ["lab", "reconciliation", "bank", "exceptions", "ageing", "debtors", "dunning", "chase", "drafts"] },
        { id: "lab-board-pack", file: "57-lab-board-pack.md", title: "Lab: Forecast, Board Pack & the Proofreading Pass", minutes: 20, level: "Core",
          summary: "Hands-on. A driver-based forecast, a six-slide board pack, and a fresh-eyes audit that traces every number.",
          keywords: ["lab", "forecast", "board pack", "deck", "assumptions", "sensitivity", "proofread", "audit", "verification"] }
      ]
    },
    {
      id: "repeatable",
      emoji: "🛠️",
      title: "Make It Repeatable",
      desc: "Do it once by hand, then never again: Skills, schedules, projects, and parallel subagents.",
      lessons: [
        { id: "skills", file: "60-skills.md", title: "Teach Cowork Your Way: Skills", minutes: 11, level: "Core",
          summary: "A Skill is your team's playbook in a file. Anatomy, frontmatter, slash commands, and when a Skill beats a long brief.",
          keywords: ["skills", "skill.md", "frontmatter", "playbook", "template", "reuse", "slash command", "progressive disclosure"] },
        { id: "lab-skill", file: "61-lab-skill.md", title: "Lab: Build Your Role's Skill", minutes: 22, level: "Core",
          summary: "Hands-on. Package your best lab from this course into a Skill, test it cold, and refine it twice.",
          keywords: ["lab", "build skill", "create", "test", "refine", "playbook", "reuse"] },
        { id: "skill-library", file: "64-skill-library.md", title: "The Skill Library — One per Function", minutes: 14, level: "Core",
          summary: "Ready-to-adapt SKILL.md templates for Sales, Marketing, Product and Finance — plus slash commands and the official function plugins.",
          keywords: ["skill library", "templates", "slash command", "sales skill", "marketing skill", "finance skill", "product skill", "account brief", "campaign readout", "stakeholder update", "variance pack", "plugins"] },
        { id: "schedules", file: "62-schedules.md", title: "Schedules & Parallel Subagents", minutes: 10, level: "Core",
          summary: "Your Monday-morning robot, plus how Cowork splits big jobs across workers and where that breaks.",
          keywords: ["schedule", "scheduled tasks", "cron", "recurring", "subagents", "parallel", "automation"] },
        { id: "projects-teams", file: "63-projects-teams.md", title: "Projects, Memory & Team Handoff", minutes: 10, level: "Core",
          summary: "Persistent workspaces for recurring work, and how to hand a working setup to a colleague.",
          keywords: ["projects", "memory", "context", "handoff", "team", "share", "onboarding", "plugin"] }
      ]
    },
    {
      id: "trust",
      emoji: "🛡️",
      title: "Trust, Review & Rollout",
      desc: "The part that keeps you employed: verifying output before it leaves the building, and rolling this out to a team.",
      lessons: [
        { id: "verify", file: "70-verify.md", title: "Verify Before You Send", minutes: 11, level: "Core",
          summary: "The four-check review pass, how to force citations, and the claims you must never take on trust.",
          keywords: ["verify", "review", "hallucination", "citations", "accuracy", "quality", "checklist", "risk"] },
        { id: "failure-clinic", file: "72-failure-clinic.md", title: "The Failure Clinic", minutes: 16, level: "Core",
          summary: "Six case files of broken runs. Diagnose each from its symptom and name the brief line or check that prevents it.",
          keywords: ["failure", "diagnosis", "confident gap", "silent exclusion", "drift", "eager rewrite", "wrong source", "contradiction", "case study"] },
        { id: "rollout", file: "71-rollout.md", title: "Rolling It Out to Your Team", minutes: 10, level: "Core",
          summary: "A 30-60-90 plan, the objections you will hear, and how to measure whether it actually saved time.",
          keywords: ["rollout", "adoption", "change management", "team", "enablement", "measurement", "objections"] }
      ]
    },
    {
      id: "capstone",
      emoji: "🏁",
      title: "Capstone & Beyond",
      desc: "One end-to-end run that uses every piece — connectors, a Skill, subagents, a schedule, and a review pass.",
      lessons: [
        { id: "capstone", file: "80-capstone.md", title: "Capstone: The Revenue Review Machine", minutes: 40, level: "Core",
          summary: "Hands-on. Build a repeatable, scheduled review pack for your lane and prove it runs cold.",
          keywords: ["capstone", "end to end", "project", "final", "qbr", "review", "automation"] },
        { id: "next-30-days", file: "81-next-30-days.md", title: "Your Next 30 Days", minutes: 6, level: "Beginner",
          summary: "A week-by-week plan to turn this into a habit, plus where to keep learning.",
          keywords: ["next steps", "30 day plan", "habits", "resources", "community", "practice"] }
      ]
    },
    {
      id: "reference",
      emoji: "📚",
      title: "Reference",
      desc: "Keep these in a tab: a glossary, a copy-paste brief library for every lane, and a fix-it guide.",
      lessons: [
        { id: "glossary", file: "90-glossary.md", title: "Glossary", minutes: null, level: "Reference",
          summary: "Every term in this lab, defined in one sentence, in plain language.",
          keywords: ["glossary", "definitions", "terms", "jargon", "dictionary"] },
        { id: "brief-library", file: "91-brief-library.md", title: "Brief Library — Sales · GTM · Product · Finance", minutes: null, level: "Reference",
          summary: "Copy-paste Cowork briefs for the jobs each role does every week.",
          keywords: ["prompts", "briefs", "library", "templates", "recipes", "copy", "sales", "gtm", "product", "finance"] },
        { id: "troubleshooting", file: "92-troubleshooting.md", title: "Troubleshooting & FAQ", minutes: null, level: "Reference",
          summary: "It stalled, it invented a number, it cannot see the folder — start here.",
          keywords: ["troubleshooting", "faq", "errors", "help", "problems", "fix", "stuck"] }
      ]
    }
  ],

  // Badges are earned automatically. `module` = earned when that module is 100% complete.
  badges: [
    { id: "first-steps", emoji: "🐣", label: "Day One", when: { module: "start-here" } },
    { id: "brief-writer", emoji: "🧠", label: "Brief Writer", when: { module: "fundamentals" } },
    { id: "connected", emoji: "🔌", label: "Fully Connected", when: { module: "connect" } },
    { id: "closer", emoji: "💼", label: "The Closer", when: { module: "sales" } },
    { id: "gtm-operator", emoji: "📣", label: "GTM Operator", when: { module: "gtm" } },
    { id: "product-sense", emoji: "🧭", label: "Product Sense", when: { module: "product" } },
    { id: "controller", emoji: "🧾", label: "The Controller", when: { module: "finance" } },
    { id: "automator", emoji: "🛠️", label: "Automator", when: { module: "repeatable" } },
    { id: "trusted", emoji: "🛡️", label: "Trusted Operator", when: { module: "trust" } },
    { id: "champion", emoji: "🏆", label: "Capstone Champion", when: { lesson: "capstone" } },
    { id: "completionist", emoji: "💯", label: "Completionist", when: { all: true } }
  ]
};

var CC_COURSE = {
  id: "claude-code",
  slug: "claude-code-for-devs",
  emoji: "⌨️",
  title: "Claude Code for Developers",
  tagline: "Go from 'I installed it' to agentic engineering — context, plan mode, subagents, hooks, MCP, and automation — with an in-browser terminal you can actually type into.",
  audience: "Engineers · already installed, new to Claude Code",
  level: "Hands-on · terminal",
  glossary: "cc-glossary",
  fastPaths: [
    { id: "foundations", emoji: "⚡", title: "Foundations in 80 minutes", audience: "Developers new to Claude Code", desc: "Build the core mental model, manage context, plan work, and close the verification loop.", lessons: ["cc-what", "cc-tour", "cc-first", "cc-context", "cc-claudemd", "cc-context-mgmt", "cc-epcc", "cc-verify"] },
    { id: "ship-feature", emoji: "🔁", title: "Ship a feature safely", audience: "Developers ready to use Claude on a real repository", desc: "Go from context and plan mode through permissions, tests, and a complete feature lab.", lessons: ["cc-what", "cc-context", "cc-claudemd", "cc-epcc", "cc-verify", "cc-debug", "cc-permissions", "cc-lab-feature"] },
    { id: "automation", emoji: "🚀", title: "Automation power path", audience: "Experienced users building repeatable workflows", desc: "Combine skills, subagents, hooks, headless runs, and worktrees without skipping safety.", lessons: ["cc-permissions", "cc-commands", "cc-subagents", "cc-hooks", "cc-mcp-plugins", "cc-headless", "cc-parallel", "cc-lab-automate"] }
  ],
  freshness: {
    "cc-tour": { verifiedDate: "2026-08-26", sourceLabel: "Claude Code docs", sourceUrl: "https://code.claude.com/docs/en/commands" },
    "cc-claudemd": { verifiedDate: "2026-08-26", sourceLabel: "Claude Code docs", sourceUrl: "https://code.claude.com/docs/en/memory" },
    "cc-context-mgmt": { verifiedDate: "2026-08-26", sourceLabel: "Claude Code docs", sourceUrl: "https://code.claude.com/docs/en/commands" },
    "cc-epcc": { verifiedDate: "2026-08-26", sourceLabel: "Claude Code docs", sourceUrl: "https://code.claude.com/docs/en/best-practices" },
    "cc-permissions": { verifiedDate: "2026-08-26", sourceLabel: "Claude Code docs", sourceUrl: "https://code.claude.com/docs/en/permission-modes" },
    "cc-commands": { verifiedDate: "2026-08-26", sourceLabel: "Claude Code docs", sourceUrl: "https://code.claude.com/docs/en/skills" },
    "cc-subagents": { verifiedDate: "2026-08-26", sourceLabel: "Claude Code docs", sourceUrl: "https://code.claude.com/docs/en/sub-agents" },
    "cc-hooks": { verifiedDate: "2026-08-26", sourceLabel: "Claude Code docs", sourceUrl: "https://code.claude.com/docs/en/hooks" },
    "cc-mcp-plugins": { verifiedDate: "2026-08-26", sourceLabel: "Claude Code docs", sourceUrl: "https://code.claude.com/docs/en/mcp" },
    "cc-headless": { verifiedDate: "2026-08-26", sourceLabel: "Claude Code docs", sourceUrl: "https://code.claude.com/docs/en/github-actions" },
    "cc-parallel": { verifiedDate: "2026-08-26", sourceLabel: "Claude Code docs", sourceUrl: "https://code.claude.com/docs/en/cross-session-messaging" },
    "cc-cheatsheet": { verifiedDate: "2026-08-26", sourceLabel: "Claude Code docs", sourceUrl: "https://code.claude.com/docs" },
    "cc-whats-new": { verifiedDate: "2026-08-26", sourceLabel: "Claude Code changelog", sourceUrl: "https://code.claude.com/docs/en/whats-new" }
  },
  modules: [
    {
      id: "cc-foundations",
      emoji: "🧠",
      title: "Foundations",
      desc: "What Claude Code actually is, the TUI, session basics — then your first real session in a live terminal simulator.",
      lessons: [
        { id: "cc-what", file: "cc/00-what.md", title: "It's an Agent, Not Autocomplete", minutes: 8, level: "Beginner",
          summary: "The agentic loop, why context is THE constraint, and how to think about Claude Code.",
          keywords: ["claude code", "agentic", "what is", "context window", "loop", "mental model"] },
        { id: "cc-tour", file: "cc/01-tour.md", title: "The TUI & Session Basics", minutes: 10, level: "Beginner",
          summary: "Modes (auto is now the default), the keys that matter, /clear, /rewind, /resume, /usage, interrupting.",
          keywords: ["tui", "plan mode", "auto mode", "shift tab", "esc", "clear", "rewind", "resume", "usage", "statusline", "shortcuts", "modes"] },
        { id: "cc-first", file: "cc/02-first-session.md", title: "Lab: Your First Session", minutes: 12, level: "Beginner",
          summary: "Hands-on in the in-browser terminal: ask codebase questions, make a tiny change, verify.",
          keywords: ["lab", "first session", "simulator", "terminal", "hands on", "onboarding"] }
      ]
    },
    {
      id: "cc-context-mod",
      emoji: "📍",
      title: "Context Engineering",
      desc: "The core skill: feed Claude the right context, keep the window clean, and master CLAUDE.md.",
      lessons: [
        { id: "cc-context", file: "cc/10-context.md", title: "Context Is the Whole Game", minutes: 8, level: "Core",
          summary: "Why the context window is your fundamental constraint and how performance degrades as it fills.",
          keywords: ["context", "window", "tokens", "degrade", "management", "constraint"] },
        { id: "cc-claudemd", file: "cc/11-claudemd.md", title: "CLAUDE.md Done Right", minutes: 11, level: "Core",
          summary: "/init, what to include vs cut, the memory hierarchy, @-imports, and the under-200-lines rule.",
          keywords: ["claude.md", "init", "memory", "hierarchy", "imports", "instructions", "rules"] },
        { id: "cc-context-mgmt", file: "cc/12-context-mgmt.md", title: "Managing Context Live", minutes: 9, level: "Core",
          summary: "/clear vs /compact, /rewind checkpoints, subagents for investigation, @files, images, pipes.",
          keywords: ["clear", "compact", "rewind", "checkpoint", "subagent", "@", "pipe", "images"] },
        { id: "cc-lab-claudemd", file: "cc/13-lab-claudemd.md", title: "Lab: Write a Great CLAUDE.md", minutes: 15, level: "Core",
          summary: "Hands-on: run /init, then prune and tune CLAUDE.md until Claude's behavior shifts.",
          keywords: ["lab", "claude.md", "init", "simulator", "tune", "prune"] }
      ]
    },
    {
      id: "cc-workflow-mod",
      emoji: "🔁",
      title: "The Core Workflow",
      desc: "Explore → Plan → Code → Commit. Plan mode, verification loops, and permissions that keep you safe.",
      lessons: [
        { id: "cc-epcc", file: "cc/20-explore-plan-code.md", title: "Explore → Plan → Code → Commit", minutes: 11, level: "Core",
          summary: "The highest-leverage workflow, plus Plan Mode deep dive (Shift+Tab, opusplan, Ctrl+G).",
          keywords: ["explore", "plan", "code", "commit", "plan mode", "opusplan", "workflow"] },
        { id: "cc-verify", file: "cc/21-verify.md", title: "Give Claude a Way to Verify", minutes: 10, level: "Core",
          summary: "Tests, builds, screenshots — close the loop so you can walk away. TDD with Claude Code.",
          keywords: ["verify", "tests", "tdd", "build", "screenshot", "evidence", "goal", "stop hook"] },
        { id: "cc-debug", file: "cc/24-debugging.md", title: "Debugging With Claude Code", minutes: 14, level: "Core",
          summary: "Reproduce, isolate, prove with a failing test, fix the cause — and never let a try/except pass as a fix.",
          keywords: ["debugging", "bug", "stack trace", "reproduce", "failing test", "root cause", "git bisect", "regression"] },
        { id: "cc-permissions", file: "cc/22-permissions.md", title: "Permissions & Staying Safe", minutes: 9, level: "Core",
          summary: "Default prompts, auto mode, /permissions allowlists, /sandbox, and the YOLO flag caution.",
          keywords: ["permissions", "auto mode", "sandbox", "allowlist", "safety", "dangerously skip"] },
        { id: "cc-lab-feature", file: "cc/23-lab-feature.md", title: "Lab: Ship a Feature (Plan + TDD)", minutes: 18, level: "Core",
          summary: "Hands-on: take a feature from plan mode through tests to commit in the simulator.",
          keywords: ["lab", "feature", "plan mode", "tdd", "simulator", "commit"] }
      ]
    },
    {
      id: "cc-customize-mod",
      emoji: "🛠️",
      title: "Customize Claude Code",
      desc: "Make it yours: custom commands, subagents, hooks, MCP servers, and the .claude/ folder.",
      lessons: [
        { id: "cc-commands", file: "cc/30-commands.md", title: "Custom Commands & Skills", minutes: 10, level: "Advanced",
          summary: "Reusable workflows in .claude/commands & .claude/skills, $ARGUMENTS, manual vs auto-invoke.",
          keywords: ["commands", "slash", "skills", "arguments", "custom", "workflow"] },
        { id: "cc-subagents", file: "cc/31-subagents.md", title: "Subagents", minutes: 11, level: "Advanced",
          summary: "Isolated context specialists in .claude/agents, the Explore/Plan built-ins, and specificity.",
          keywords: ["subagents", "agents", "isolated context", "explore", "plan", "reviewer", "parallel"] },
        { id: "cc-hooks", file: "cc/32-hooks.md", title: "Hooks: Deterministic Automation", minutes: 10, level: "Advanced",
          summary: "Guarantee actions with lifecycle hooks (PreToolUse/PostToolUse/Stop) in settings.json.",
          keywords: ["hooks", "settings.json", "pretooluse", "posttooluse", "stop", "lint", "guardrails"] },
        { id: "cc-mcp-plugins", file: "cc/33-mcp-plugins.md", title: "MCP, Plugins & the .claude Folder", minutes: 10, level: "Advanced",
          summary: "Connect tools with claude mcp add, install plugins, and map the whole .claude/ + settings hierarchy.",
          keywords: ["mcp", "plugins", ".claude", "settings", "hierarchy", "marketplace"] },
        { id: "cc-lab-customize", file: "cc/34-lab-customize.md", title: "Lab: Command + Subagent + Hook", minutes: 20, level: "Advanced",
          summary: "Hands-on: build a /command, a reviewer subagent, and a format-on-edit hook.",
          keywords: ["lab", "command", "subagent", "hook", "simulator", "customize"] }
      ]
    },
    {
      id: "cc-scale-mod",
      emoji: "🚀",
      title: "Scale & Automate",
      desc: "Multiply yourself: headless mode, CI, git worktrees, parallel sessions, and fan-out.",
      lessons: [
        { id: "cc-headless", file: "cc/40-headless.md", title: "Headless Mode & CI", minutes: 10, level: "Advanced",
          summary: "claude -p, output formats, JSON schemas, budget caps, GitHub Actions (@claude), and the Agent SDK.",
          keywords: ["headless", "-p", "non-interactive", "ci", "json", "json schema", "pipe", "github actions", "agent sdk", "automation"] },
        { id: "cc-parallel", file: "cc/41-parallel.md", title: "Parallel Sessions & Worktrees", minutes: 10, level: "Advanced",
          summary: "git worktrees, background agents (claude agents), named sessions that message each other, cloud sessions, agent teams, and dynamic workflows.",
          keywords: ["worktrees", "parallel", "writer reviewer", "fan out", "agent teams", "background agents", "cloud", "teleport", "workflows", "ultracode", "scale"] },
        { id: "cc-lab-automate", file: "cc/42-lab-automate.md", title: "Lab: Headless + Worktree Run", minutes: 16, level: "Advanced",
          summary: "Hands-on: a one-liner batch job and a parallel worktree workflow.",
          keywords: ["lab", "headless", "worktree", "batch", "simulator", "automate"] }
      ]
    },
    {
      id: "cc-finish-mod",
      emoji: "🎯",
      title: "Best Practices & Capstone",
      desc: "The habits that separate power users from the pack — then put it all together.",
      lessons: [
        { id: "cc-prompts", file: "cc/49-prompt-patterns.md", title: "Prompt Patterns That Work", minutes: 12, level: "Core",
          summary: "Eight moves that turn a vague request into one Claude can finish and prove — with before/after examples.",
          keywords: ["prompts", "prompting", "patterns", "specific", "scope", "done criteria", "constraints", "evidence"] },
        { id: "cc-bestpractices", file: "cc/50-bestpractices.md", title: "Habits & Failure Patterns", minutes: 10, level: "Core",
          summary: "The traits of effective users and the five failure patterns (with the fix for each).",
          keywords: ["best practices", "habits", "failure patterns", "anti-patterns", "kitchen sink", "fixes"] },
        { id: "cc-capstone", file: "cc/51-capstone.md", title: "Capstone: Clone → PR", minutes: 30, level: "Core",
          summary: "Hands-on: a new repo from /init through a plan-mode feature, tests, a custom command, and a PR.",
          keywords: ["capstone", "end to end", "project", "pr", "simulator", "final"] }
      ]
    },
    {
      id: "cc-reference",
      emoji: "📚",
      title: "Reference",
      desc: "Keep these in a tab: a command cheat-sheet, copy-paste starter templates, and an FAQ.",
      lessons: [
        { id: "cc-cheatsheet", file: "cc/90-cheatsheet.md", title: "Command & Shortcut Cheat-Sheet", minutes: null, level: "Reference",
          summary: "Every command, flag, and key you'll reach for, on one page.",
          keywords: ["cheatsheet", "commands", "shortcuts", "flags", "reference"] },
        { id: "cc-templates", file: "cc/91-templates.md", title: "Starter Templates", minutes: null, level: "Reference",
          summary: "Copy-paste CLAUDE.md, a custom command, a subagent, a hook, and settings.json.",
          keywords: ["templates", "claude.md", "settings", "starter", "copy", "boilerplate"] },
        { id: "cc-faq", file: "cc/92-faq.md", title: "Troubleshooting & FAQ", minutes: null, level: "Reference",
          summary: "When Claude Code misbehaves, start here.",
          keywords: ["faq", "troubleshooting", "errors", "help", "fix", "problems", "safe mode", "usage limits"] },
        { id: "cc-whats-new", file: "cc/93-whats-new.md", title: "What's New in Claude Code", minutes: null, level: "Reference",
          summary: "The dated digest: auto mode, background agents, agent teams, cloud sessions, dynamic workflows, and the ecosystem — verified against v2.1.246.",
          keywords: ["whats new", "updates", "changelog", "auto mode", "agent teams", "workflows", "ultracode", "cloud", "background agents", "ecosystem", "plugins", "version"] },
        { id: "cc-glossary", file: "cc/94-glossary.md", title: "Glossary", minutes: null, level: "Reference",
          summary: "Every Claude Code term in this course — context rot, plan mode, subagents, hooks, worktrees — defined in a sentence.",
          keywords: ["glossary", "definitions", "terms", "jargon", "context window", "subagent", "hook", "worktree", "plan mode"] }
      ]
    }
  ],

  badges: [
    { id: "cc-first-steps", emoji: "🐣", label: "Booted Up", when: { lesson: "cc-what" } },
    { id: "cc-context-eng", emoji: "📍", label: "Context Engineer", when: { module: "cc-context-mod" } },
    { id: "cc-workflow-pro", emoji: "🔁", label: "Workflow Pro", when: { module: "cc-workflow-mod" } },
    { id: "cc-customizer", emoji: "🛠️", label: "Customizer", when: { module: "cc-customize-mod" } },
    { id: "cc-automator", emoji: "🚀", label: "Automator", when: { module: "cc-scale-mod" } },
    { id: "cc-champion", emoji: "🏆", label: "Shipped It", when: { lesson: "cc-capstone" } },
    { id: "cc-completionist", emoji: "💯", label: "Completionist", when: { all: true } }
  ]
};

window.COURSES = [COWORK_COURSE, CC_COURSE];

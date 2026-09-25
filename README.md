<div align="center">

# ✦ Claude Lab

### Hands-on, interactive, open-source courses for getting genuinely good at Claude — for **Sales, GTM, Product & Finance** *and* **developers**.

Learn by *doing*: labs on your real work, an **in-browser Claude Code terminal**, branching scenarios, find-the-flaw reviews, brief and CLAUDE.md checkers — and a **spaced-repetition review deck** so it sticks.

[**▶ Live demo**](https://larryfang.github.io/claude-lab/) · [Quick start](#-quick-start) · [Add a course](#-add-a-course-or-lesson) · [Contribute](CONTRIBUTING.md)

</div>

---

## What is this?

Claude Lab is a self-contained, **zero-dependency** static website that hosts a multi-course, hands-on curriculum. Learners pick a track, work through short lessons with real exercises, and track progress with badges — all saved in the browser, no account needed.

It's built to be **forked**: swap in your company's examples, project keys, and connectors to make an internal onboarding workshop in minutes.

## 📚 The two courses

| Course | For | What you'll do |
|---|---|---|
| 🤝 **Claude Cowork for Sales, GTM, Product & Finance** | AEs, PMM/growth, product managers, finance & RevOps | Write **briefs** that work first time, connect **CRM/Jira/mail/docs**, ship real **deliverables** (decks, live-formula spreadsheets, docs), four **role lanes** of labs, build a **Skill**, put it on a **schedule**, verify before you send — *no code required* |
| ⌨️ **Claude Code for Developers** | Engineers, new to Claude Code | Agentic mental model, **context engineering & CLAUDE.md**, Explore→Plan→Code→Commit, TDD, **subagents, hooks, MCP**, headless/CI, worktrees — with a **terminal simulator** |

63 lessons plus 7 reference pages across both tracks, grounded in current Anthropic docs and community best practices — including worked examples (*Anatomy of a Great Run*), a diagnosis lab (*The Failure Clinic*), *Debugging With Claude Code*, and *Prompt Patterns That Work*.

## ✨ Features

**New in 2.0 — the learn → practise → check → remember loop**

- **Flashcards with spaced repetition** — grade each card Again / Got it / Easy; every card joins a Leitner review deck (`#/review`) that brings it back just before you would forget it
- **Scenarios** — "what would you do?" judgement calls with the consequence of every choice
- **Find the flaw** — click the sentences in a fluent draft that should not survive a review; scores hits, misses and false alarms
- **Ordering exercises** — shuffle-and-sort sequences, with keyboard controls and drag on desktop
- **Brief and CLAUDE.md checkers** — deterministic, in-browser signal checks (B.R.I.E.F. letters; length, commands, vague rules, secrets…) that say plainly they are heuristics
- **Reflections and a notebook** — autosaving reflection boxes collected in `#/notebook`, exportable as Markdown
- **Progress dashboard** (`#/me`) — levels and XP derived from saved state, streaks, a 16-week activity heatmap, quiz accuracy, and JSON export/import to move devices
- **Certificates** — a printable, self-issued certificate per course at 100%
- **Full-text search** — searches inside every lesson, shows the matching section with a highlighted snippet, and jumps straight to it
- **New UI** — animated hub, module journey map with "you are here", lesson position chip, an on-this-page rail with scroll-spy, reading progress, and a `?` shortcut sheet

**Core**

- **Multi-course hub** with per-course progress, badges, and a course switcher
- **Four role lanes** in the Cowork course — Sales, GTM, Product and Finance — so learners practise on the work they actually do
- **Interactive terminal simulator** — a guided, in-browser Claude Code session learners type into (with copy-paste commands for their real terminal too)
- **Role-based fast paths** — short, time-estimated routes for Sales, GTM, Product, Finance, Claude Code foundations, feature delivery, and automation
- **Freshness evidence** — volatile product lessons show the date and official source used for their latest verification
- **Hands-on labs** in every module, with auto-saving checklists
- **Instant-feedback quizzes** with a score, best-score tracking and retry, plus **copy-to-clipboard prompt/command cards**
- **Progress & badges** with a little confetti 🎉 (saved locally, no account)
- **Beautiful, responsive UI**, light/dark mode, full keyboard nav (`/` search, `←`/`→` lessons, `?` shortcuts)
- **No build step or runtime JavaScript dependencies** — pure HTML/CSS/JS; content is plain Markdown. Google Fonts are optional and fall back cleanly to system fonts offline.

## 🚀 Quick start

### Just view it (recommended for learners)
Deploy to GitHub Pages (below) and share the URL — learners only need a browser.

### Run locally
Lessons load as separate Markdown files, so use a tiny local web server (opening `index.html` via `file://` won't load lessons):

```bash
python3 -m http.server 8080    # then open http://localhost:8080
# or: npx serve .
```

> macOS: double-click `start.command`.

## 🌐 Deploy to GitHub Pages

1. Push to GitHub.
2. **Settings → Pages → Build and deployment** → Source: *Deploy from a branch*, Branch: `main`, folder `/ (root)`. Save.
3. ~1 minute later it's live at `https://<user>.github.io/<repo>/`.

A GitHub Actions workflow is included at `.github/workflows/pages.yml` if you prefer Actions-based deploys (set Source: *GitHub Actions*). After deploying, update `repo` in `assets/js/content.js` (`window.SITE.repo`).

## 🧩 Add a course or lesson

Everything is driven by `assets/js/content.js`.

- **Add a lesson:** drop a Markdown file in `content/` (Cowork) or `content/cc/` (Claude Code), then register it in the right module's `lessons` array.
- **Add a course:** push a new course object to `window.COURSES` (give it an `id`, `emoji`, `title`, `tagline`, `modules`, `badges`) and create its lesson files. The hub, routing, progress, and badges all wire up automatically.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the Markdown + custom-block cheat-sheet (callouts, labs, quizzes, prompt cards, and the **terminal simulator** block).

## Verification

```bash
npm install
npm test              # content structure + unit tests + all browser interactions
npm run check:links   # live external-link check
```

The browser suite renders every registered lesson and checks progress persistence, quizzes and scores, every learning block, the review deck, notebook export, progress export/import, the certificate, full-text search, keyboard navigation, guided simulations, route pages, accessibility state, and 390 px / 320 px layouts. A smoke test uses every interactive block on every lesson at phone width and fails on any browser error. Unit tests cover the checker heuristics, the link-check rules, and WCAG AA colour contrast for every text/background pair in both themes. GitHub Actions runs the main suite on every push and pull request, plus a weekly external-link check.

## 📁 Project structure

```text
.
├── index.html              # App shell
├── assets/
│   ├── css/styles.css      # Design system (CSS variables to rebrand)
│   └── js/
│       ├── markdown.js     # Tiny Markdown engine + custom blocks (incl. terminal sim)
│       ├── widgets.js      # Flashcards + spaced repetition, order, scenario, reflect, spot
│       ├── checkers.js     # Heuristic brief and CLAUDE.md checkers
│       ├── content.js      # Multi-course manifest: COURSES, modules, badges  ← edit here
│       └── app.js          # Hub, journey, lessons, search index, review, notebook, progress, certificate
├── content/                # Cowork course lessons (*.md)
│   └── cc/                 # Claude Code course lessons (*.md)
├── start.command           # macOS: double-click to preview locally
├── .nojekyll · .github/workflows/pages.yml
└── CONTRIBUTING.md · LICENSE
```

## 🎨 Make it your own

- **Swap examples** — edit any file in `content/` to use your real project keys, tools, and brand voice.
- **Rebrand** — CSS variables at the top of `assets/css/styles.css`; site title/tagline in `window.SITE` (content.js).
- **Internal edition** — point connectors/examples at your stack, add company-specific labs, host on internal Pages.

## ⚠️ A note on accuracy

Claude's products and Claude Code evolve quickly. This lab teaches **stable mental models** and frames steps resiliently, but a flag or menu may shift over time. For current specifics, the [Claude docs](https://claude.com/docs) and [Claude Code docs](https://code.claude.com/docs) are the source of truth. PRs that keep the lab current are very welcome.

**Last full source audit: 25 Sep 2026.** Every lesson, quiz key and lab step was checked against the Claude Help Center, claude.com docs and blog, code.claude.com docs and the Claude Code changelog (v2.1.282), then re-checked by a second, independent review. Lessons that describe fast-moving features show their verification date and source at the top of the page.

## 📜 License

[MIT](LICENSE). Free to use, fork, remix, and run as a workshop. Not affiliated with Anthropic — a community-made teaching resource.

---

<div align="center"><sub>Built to be remixed. ✦</sub></div>

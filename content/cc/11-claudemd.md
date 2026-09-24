# CLAUDE.md Done Right

`CLAUDE.md` is the highest-ROI thing you can set up. It's a plain Markdown file Claude reads **at the start of every conversation** — persistent context it can't infer from your code alone. Done well, it stops you repeating yourself forever. Done badly, it makes Claude *worse*.

## Start with /init

Don't write it from scratch. Run:

```bash
/init
```

`/init` analyzes your codebase — build system, test framework, structure, conventions — and generates a starter `CLAUDE.md`. Then you **refine it over time**. Treat the generated file as a first draft, not gospel.

## What belongs in it (and what doesn't)

This table is the whole art. Memorize the vibe:

| ✅ Include | ❌ Exclude |
|---|---|
| Bash commands Claude can't guess (build, test, run, lint) | Anything Claude can figure out by reading the code |
| Code style rules that **differ** from defaults | Standard language conventions Claude already knows |
| Testing instructions & preferred test runner | Detailed API docs (link to them instead) |
| Repo etiquette (branch naming, PR/commit conventions) | Information that changes frequently |
| Architecture decisions specific to your project | Long tutorials or explanations |
| Environment quirks (required env vars) | File-by-file descriptions of the codebase |
| Common gotchas / non-obvious behaviors | Self-evident advice like "write clean code" |

:::warning Keep it short — bloat backfires
A long `CLAUDE.md` is loaded **every turn**, eating context, and worse: **Claude starts ignoring it** because the important rules get buried. A good rule of thumb (a heuristic, not a law) is **under ~200 lines**; the official guidance is simply "keep it lean and move sometimes-relevant knowledge into skills" ([best practices](https://code.claude.com/docs/en/best-practices)). For each line ask: *"Would removing this cause Claude to make a mistake?"* If not, cut it.
:::

Here's the shape of a good one:

```markdown
# Project: todo-api

## Commands
- Install: `npm ci`
- Dev: `npm run dev`
- Test: `npm test` — prefer running a single test file for speed
- Lint/format: `npm run lint && npm run format`

## Code style
- ES modules (import/export), not CommonJS
- Prefer small pure functions; colocate tests as `*.test.js`

## Workflow
- IMPORTANT: typecheck (`npm run typecheck`) after a series of changes
- Conventional commits (feat:, fix:, chore:)
- Never edit files in `src/generated/` — they're built by `npm run codegen`

## Gotchas
- The DB client must be closed in tests or Jest hangs (see test/setup.js)
- API_KEY env var is required at startup
```

## The memory hierarchy

Claude merges `CLAUDE.md` files from several places — so you can scope context precisely:

| Location | Scope |
|---|---|
| `~/.claude/CLAUDE.md` | **Global** — applies to all your projects (personal prefs) |
| `./CLAUDE.md` | **Project** — check into git to share with your team |
| `./CLAUDE.local.md` | **Personal project notes** — add to `.gitignore` |
| `.claude/rules/*.md` | **Path-scoped rules** — a `paths:` frontmatter limits each rule file to matching files ([memory docs](https://code.claude.com/docs/en/memory)) |
| Parent dirs | Monorepo: `root/CLAUDE.md` + `root/app/CLAUDE.md` both apply |
| Child dirs | Loaded **on demand** when Claude reads files in that subfolder |

Two newer pieces complete the picture ([memory docs](https://code.claude.com/docs/en/memory)):

- **Auto memory** — Claude also keeps its **own** notes per project (`~/.claude/projects/<project>/memory/`), loading the first ~200 lines of its index each session. It learns your repo's gotchas without you writing them down; manage it with `/memory`.
- **`AGENTS.md`** — if your repo standardizes on the cross-tool `AGENTS.md` convention, import it rather than duplicating: put `@AGENTS.md` in your `CLAUDE.md`.

:::concept Subfolders append, not replace
Child `CLAUDE.md` files add to context when relevant, keeping module-specific rules out of every session. Put **universal** rules at the root; put **module-specific** rules deeper. This cascade is how big repos stay manageable.
:::

## Two power moves

**Import other files** with `@path` so you don't duplicate:

```markdown
See @README.md for the overview and @package.json for scripts.
- Git workflow: @docs/git-instructions.md
```

**Add emphasis** for rules Claude keeps missing — `IMPORTANT:` or `YOU MUST` measurably improve adherence. And the `#` shortcut in a session appends a one-liner to memory instantly.

## Treat it like code

Check it into git so the team contributes — it **compounds in value**. And debug it like code:

- If Claude **keeps breaking a rule** you wrote → the file's probably too long; the rule got lost. **Prune.**
- If Claude **asks about something that's in there** → the phrasing is ambiguous. **Reword.**
- Prune regularly; test changes by watching whether Claude's behavior actually shifts.

:::tip Sometimes-relevant knowledge → Skills, not CLAUDE.md
If something only matters *occasionally* (a niche workflow, deep domain docs), don't put it in `CLAUDE.md` (which loads every turn). Make it a **Skill** — Claude loads it on demand. More on that in the Customize module.
:::

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What is the fastest way to a first `CLAUDE.md`?
A: Run `/init`. It analyzes your codebase and generates a starter file. Treat it as a first draft and refine it over time.

Q: What question decides whether a `CLAUDE.md` line stays?
A: *"Would removing this cause Claude to make a mistake?"* If not, cut it.

Q: Why does a long `CLAUDE.md` backfire?
A: It loads every turn, eating context, and Claude starts ignoring it because the important rules get buried.

Q: Where does a rule for ALL your projects go?
A: `~/.claude/CLAUDE.md`. Team-shared rules go in `./CLAUDE.md`; personal, gitignored notes go in `./CLAUDE.local.md`.

Q: Claude keeps breaking a rule you wrote. What is the likely fix?
A: **Prune.** The file is probably too long and the rule got lost. If Claude asks about something already in there, reword it instead.

Q: Where does sometimes-relevant knowledge belong?
A: In a **Skill**, which Claude loads on demand — not in `CLAUDE.md`, which loads every turn.
```

```quiz
Q: What's the fastest way to create a solid first CLAUDE.md?
+ Run /init to generate one from your codebase, then prune and refine it
- Write 500 lines by hand covering every file
- Copy someone else's verbatim
- Skip it; it's optional fluff
> /init detects your build/test/structure and gives you a draft. Refinement over time is where the value compounds.

Q: Claude keeps ignoring a rule that's clearly written in your CLAUDE.md. Most likely fix?
+ The file is too long — prune it so the important rules aren't buried
- Write the rule in ALL CAPS five times
- Add more rules
- Delete CLAUDE.md entirely
> Bloat causes Claude to deprioritize content. Keep it under ~200 lines; cut anything that wouldn't cause a mistake if removed.

Q: Where do you put a rule that should apply to ALL your projects?
+ ~/.claude/CLAUDE.md (global/home)
- ./CLAUDE.local.md
- A random subfolder
- It's impossible
> Home-level CLAUDE.md applies everywhere. Project root is for team-shared rules; .local.md for personal, gitignored notes.

Q: Knowledge that's only relevant occasionally belongs in…
- CLAUDE.md, so it's always loaded
+ A Skill, so Claude loads it on demand without bloating every session
- A comment in the code
- Nowhere
> Reserve CLAUDE.md for broadly-relevant context. Occasional/domain knowledge → Skills (covered later).
```

:::try Next
A great CLAUDE.md sets the baseline. Now learn to manage context *live*, mid-session — clearing, compacting, rewinding, and delegating.
:::

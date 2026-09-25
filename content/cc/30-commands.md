# Custom Commands & Skills

When you find yourself typing the *same* multi-step prompt over and over — "review this diff and...", "open a PR with...", "scaffold a new component like..." — that's the signal to **save it as a command**. Type it once; reuse it forever as `/yourcommand`.

## The simplest version: a command file

A custom slash command is just a Markdown file. Drop one in `.claude/commands/` and it becomes `/filename`:

```markdown
<!-- .claude/commands/pr.md  →  invoked as /pr -->
Review the current git diff, then:
1. Summarize what changed and why.
2. Run the test suite and report results.
3. Create a conventional-commit message.
4. Open a PR with `gh pr create`, using the summary as the body.
```

Now `/pr` runs that whole workflow. Put commands in:
- `.claude/commands/` — **project** (commit it; shared with your team)
- `~/.claude/commands/` — **personal**, available in all your projects

**Namespacing** comes from folders: `.claude/commands/git/commit.md` → `/git:commit`.

## Pass arguments

Use `$ARGUMENTS` to accept input:

```markdown
<!-- .claude/commands/fix-issue.md  →  /fix-issue 1234 -->
Analyze and fix GitHub issue: $ARGUMENTS

1. Run `gh issue view $ARGUMENTS` to read the issue.
2. Find the relevant files and implement a fix.
3. Write and run tests to verify.
4. Commit with a descriptive message and open a PR.
```

Run `/fix-issue 1234` and Claude executes the workflow against issue 1234.

## Commands have merged into Skills

The newer, richer form is a **Skill** — a folder with a `SKILL.md`:

```markdown
<!-- .claude/skills/api-conventions/SKILL.md -->
---
name: api-conventions
description: REST API design conventions for our services. Use when adding or changing endpoints.
---
# API Conventions
- kebab-case URL paths, camelCase JSON properties
- Always paginate list endpoints
- Version in the path (/v1/, /v2/)
```

:::concept Command vs Skill — what's the difference?
A file at `.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md` **both** create `/deploy` and work the same way. Your existing `commands/` files keep working. Skills just add three superpowers:

1. a **directory** for supporting files (references, scripts, assets)
2. **frontmatter** to control *who* invokes it (you vs Claude)
3. **auto-invocation** — Claude loads the skill itself when your request matches its `description`
:::

## Manual vs auto-invoke

By default a skill is **user-invocable** (`/name`) *and* can be **auto-triggered** by Claude when relevant. For workflows with **side effects** you only want to run on purpose (deploys, mass edits), turn auto off:

```markdown
---
name: deploy-prod
description: Deploy to production
disable-model-invocation: true
---
Run the production deploy checklist, then `./scripts/deploy.sh prod`.
```

Now it only runs when *you* type `/deploy-prod` — Claude won't trigger it on its own.

## Skill frontmatter worth knowing

Beyond `name`/`description`, skills accept ([skills reference](https://code.claude.com/docs/en/skills)):

- **`allowed-tools`** — pre-approve tools for the turn that runs the skill (it does not restrict them; `disallowed-tools` does)
- **`model`** / **`effort`** — pin a model or reasoning level for this workflow
- **`argument-hint`** — what to show after `/name` in the completion menu
- **`hooks`** — hooks that register when the skill runs and stay active for the rest of the session (`once: true` removes one after its first run)

Iterate fast with **`/reload-skills`** (hot-reload after editing a SKILL.md) and browse what's loaded with **`/skills`**.

:::note The ecosystem speaks SKILL.md
The format is an open standard ([agentskills.io](https://agentskills.io)), and Anthropic's own production skills — the docx/pdf/pptx/xlsx machinery — are source-available in [anthropics/skills](https://github.com/anthropics/skills), installable directly with `/plugin marketplace add anthropics/skills`. Reading two or three of those is the fastest way to learn what a well-engineered skill looks like; Anthropic's write-up of how its own team designs them is at [claude.com/blog](https://claude.com/blog/lessons-from-building-claude-code-how-we-use-skills).
:::

## Try invoking one

```claude-sim
# You created .claude/commands/pr.md earlier. Use it.
> /pr
Running /pr…
  • Diff: 3 files changed (rate limiter + tests + config)
  $ npm test  →  12 passed ✓
  • Commit message: "feat(api): add token-bucket rate limiting"
  $ gh pr create --fill
  ✓ Opened PR #42: feat(api): add token-bucket rate limiting
Anything to adjust before I mark it ready for review?
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: When should a prompt become a custom command?
A: When you type the same multi-step prompt over and over. Type it once; reuse it forever as `/yourcommand`.

Q: Where do project and personal commands live?
A: `.claude/commands/` for project commands (commit it; shared with your team). `~/.claude/commands/` for personal ones, available in all your projects.

Q: How does a command accept input?
A: Use `$ARGUMENTS` in the file. `/fix-issue 1234` then runs the workflow against issue 1234.

Q: What three things does a Skill add over a command file?
A: A **directory** for supporting files, **frontmatter** to control who invokes it, and **auto-invocation** when your request matches its `description`.

Q: How do you stop Claude auto-triggering a deploy skill?
A: Set `disable-model-invocation: true` in its frontmatter. It then only runs when *you* type `/name`.

Q: Where does the name `/git:commit` come from?
A: Folders create namespacing: `.claude/commands/git/commit.md` becomes `/git:commit`.
```

```quiz
Q: You keep pasting the same 4-step "open a PR" prompt. Best move?
+ Save it as .claude/commands/pr.md so you can run /pr
- Memorize it
- Put it in CLAUDE.md as always-on context
- Nothing can be done
> Repeated multi-step prompts become custom commands (now skills). Type once, reuse as /pr.

Q: What does `disable-model-invocation: true` do on a skill?
+ Makes it manual-only (you must type /name); Claude won't auto-trigger it
- Disables the skill entirely
- Makes it run on every message
- Hides it from the menu
> Use it for side-effecting workflows (deploys, mass edits) you only want to fire deliberately.

Q: How do you make `.claude/commands/git/commit.md` available to your whole team?
+ Commit the .claude/commands folder to the repo — it becomes /git:commit for everyone
- Email the file around
- Put it in ~/.claude only
- It can't be shared
> Project-level commands/skills live in the repo and are shared via git. Folders create namespacing (/git:commit).
```

:::try Next
Commands package *prompts*. Next: **subagents** — package a whole specialist with its own context window and tools.
:::

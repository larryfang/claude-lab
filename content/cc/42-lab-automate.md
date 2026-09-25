# Lab: Headless + Worktree Run

Two automation skills in one lab: run Claude **headless** as a command, and set up **parallel worktrees** so two Claudes can work without collisions.

## Part 1 — Simulator: headless + a worktree

```claude-sim
# These run in your normal shell ($), not inside an interactive Claude session.
$ claude -p "Give me a 3-bullet summary of what this repo does" --output-format text
todo-api — a small Express REST API for managing todos.
  • Endpoints: GET/POST/DELETE /todos, plus GET /health
  • In-memory store (src/store.js); no database
  • Jest tests in __tests__/; run with `npm test`
$ git diff --cached | claude -p "Review this staged diff. Print BLOCK + reason if risky, else OK."
OK — change is a localized validation fix with a matching test. No secrets, no risky ops.
$ git worktree add ../todo-api-search -b feature/search
Preparing worktree (new branch 'feature/search')
HEAD is now at 7d3aa12 feat(todos): validate title on create
$ cd ../todo-api-search && claude
Claude Code — ready. Working directory: ~/code/todo-api-search  (branch: feature/search)
This is an isolated checkout — edits here won't touch your main working copy.
> implement GET /todos?q= to filter todos by title substring, test-first
Plan: add a filter in src/todos.js, add __tests__/search.test.js … (test-first). Proceed?
```

:::tip What you just saw
1. **`claude -p`** answered a question and **reviewed a diff** as plain shell commands — pipeable, scriptable.
2. **`git worktree add`** created an isolated branch+folder, and a second Claude works there safely while your main checkout is untouched.
:::

## Part 2 — Do it for real

:::lab Headless first
In your **normal terminal** (not inside Claude), from any repo:

```bash
claude -p "Give me a 3-bullet summary of what this repo does"
```
- [ ] I got a summary with no interactive session

Try piping a diff through a review:

```bash
# make a small edit first, then stage only that file
git add <the-file-you-edited>
git diff --cached | claude -p "Review this staged diff. Print BLOCK + the reason if there's a likely bug or secret, otherwise print OK."
```
- [ ] Claude reviewed my staged changes from the command line

Try structured output:

```bash
claude -p "List this repo's npm scripts and what each does" --output-format json
```
- [ ] I got JSON I could pipe to another tool
:::

:::lab Now a parallel worktree
```bash
# from your repo root — create an isolated branch + folder
git worktree add ../$(basename "$PWD")-experiment -b experiment/claude-lab
cd ../$(basename "$PWD")-experiment
claude
```

(Shortcut once you're comfortable: `claude -w` does the worktree creation *and* starts the session in it, one step.)
- [ ] A second isolated checkout exists on its own branch
- [ ] I started Claude there and asked it to make a small change
- [ ] I confirmed my **original** working copy is untouched

Clean up when done:

```bash
cd -   # back to the main repo root
# --force is needed because Claude left uncommitted changes in the worktree;
# it discards them, and -D deletes the experiment branch.
git worktree remove --force ../$(basename "$PWD")-experiment
git branch -D experiment/claude-lab
```
- [ ] I removed the experiment worktree
:::

:::warning Scope unattended runs
Anytime you run `claude -p` in scripts/CI, add `--allowedTools "..."` to pre-approve only what the job needs (in `-p`, any other call that would prompt is denied; `--tools` restricts the set outright), and consider `--permission-mode dontAsk` or `auto`. Never `--dangerously-skip-permissions` on code you don't trust.
:::

## Reflect

```reflect
Which repetitive job in your own repo — a review, a summary, a check — would you turn into a `claude -p` one-liner, and which tools would you allow it?
```

```reflect
Which two tasks from your current week could run in separate worktrees at the same time, and what would you check before you merge them back?
```

```quiz
Q: What does `claude -p "..."` give you that an interactive session doesn't?
+ A one-shot, scriptable, pipeable command — perfect for CI, pre-commit, and pipelines
- A prettier UI
- Access to more models
- Automatic git commits
> Headless mode turns Claude into a Unix-friendly command you can pipe and automate.

Q: Why run a second Claude in a git worktree instead of the same folder?
+ The worktree is an isolated checkout + branch, so the two sessions don't clobber each other's files
- Worktrees are faster
- It's the only way to use Claude twice
- It disables permissions
> Same-folder parallel sessions collide. Worktrees isolate files and branches; merge when done.
```

:::try Module complete!
You can run Claude headless and in parallel. Choose **Complete and continue** for your **🚀 Automator** badge. Last module: the prompt patterns and habits that separate power users from the pack — and the capstone.
:::

# Lab: Command + Subagent + Hook

Let's make Claude Code *yours*. You'll add three customizations — a **command**, a **subagent**, and a **hook** — and see them work together. The neat trick: **let Claude build them for you** (it knows these formats natively).

## Part 1 — Simulator: scaffold and use them

```claude-sim
# Let's set up a small toolkit. Claude can scaffold these files.
> create a custom command /standup that summarizes what changed on this branch vs main, grouped by area, as bullet points
✎ created .claude/commands/standup.md
Now `/standup` will: diff against main, group changes by area, and output bullets.
> create a code-reviewer subagent (read-only-ish: Read, Grep, Bash) that flags only correctness and security issues with file:line
✎ created .claude/agents/code-reviewer.md  (tools: Read, Grep, Bash; model: sonnet)
Use it with: "use the code-reviewer subagent".
> write a hook that runs prettier on files after I edit them
✎ updated .claude/settings.json → PostToolUse(Edit|Write): jq reads the edited path from stdin → prettier --write
Run /hooks to verify. It'll format every file I edit from now on.
> /hooks
Hooks (read-only menu) — PostToolUse: 1 hook
  Edit|Write → [command] jq -r '.tool_input.file_path // empty' | xargs -r npx prettier --write
  Source: Project Settings (.claude/settings.json) · Esc to close
> now try /standup
Running /standup…
  Auth:   added Google OAuth (oauth.ts), CSRF state check
  Tests:  +oauth.redirect, +oauth.callback (denied-consent covered)
  Config: new GOOGLE_CLIENT_ID/SECRET env vars
> use the code-reviewer subagent on the branch diff
code-reviewer (fresh context): no correctness/security issues found; oauth.ts:58 logs
the provider error server-side (good). Test coverage looks complete. ✓
```

## Part 2 — Build them for real

You can let Claude scaffold these (recommended), or paste the starters below.

:::lab Add your toolkit
**1) A custom command.** Ask Claude:

```prompt
Create a custom command at .claude/commands/standup.md that diffs the current branch against main, groups the changes by area, and outputs concise bullet points I can paste into standup.
```
…or create the file yourself:
```markdown
<!-- .claude/commands/standup.md -->
Summarize what changed on this branch vs `main`:
1. Run `git diff main...HEAD --stat` and read the key changes.
2. Group changes by area (feature/tests/config/docs).
3. Output concise bullets suitable for a standup. No fluff.
```
(If `/standup` isn't in the `/` menu yet, run `/reload-skills`.)
- [ ] `/standup` exists and runs

**2) A reviewer subagent.** Ask Claude:

```prompt
Create a subagent at .claude/agents/code-reviewer.md named code-reviewer with tools Read, Grep, Bash and model sonnet. Its job: review a diff and flag only correctness and security issues with file:line and a specific fix — no style nitpicks.
```
…or paste:
```markdown
<!-- .claude/agents/code-reviewer.md -->
---
name: code-reviewer
description: Reviews a diff for bugs and security issues. Use after implementing a change.
tools: Read, Grep, Bash
model: sonnet
---
Flag only correctness and security issues. Give file:line and a specific fix.
Skip style nitpicks. If clean, say so.
```
(If Claude can't find the subagent and `.claude/agents/` didn't exist when this session started, restart `claude`.)
- [ ] `use the code-reviewer subagent` works

**3) A format-on-edit hook.** Ask Claude:

```prompt
Write a PostToolUse hook in .claude/settings.json that runs my formatter (prettier, or my project's format command) on files after every Edit or Write.
```
Then run `/hooks` yourself to confirm it's registered.
- [ ] `/hooks` lists the hook, and editing a file now auto-formats it

**4) See them combine:**

```prompt
Make a small change to any file, then run /standup, then use the code-reviewer subagent on the diff.
```
- [ ] The hook formatted my edit, `/standup` summarized it, and the subagent reviewed it
:::

:::tip Commit your toolkit
`.claude/commands`, `.claude/agents`, and `.claude/settings.json` are **team artifacts** — commit them so everyone gets the same commands, reviewers, and guarantees. That's how a team standardizes its workflow.
:::

## Reflect

```reflect
Which multi-step prompt do you retype most often in your own repo, and what would you name the command that replaces it?
```

```reflect
Which "remember to…" habit in your project should be a guaranteed hook instead, and would you commit it so your whole team gets it?
```

```quiz
Q: What's the fastest way to create these customizations correctly?
+ Ask Claude to scaffold them — it knows the command/subagent/hook formats natively
- Memorize every frontmatter field
- Write them in a different language
- You can't create them yourself
> Claude understands these formats. "Create a subagent that…" / "Write a hook that…" generates correct files; you review.

Q: After this lab, how does your team get the same setup?
+ Commit .claude/commands, .claude/agents, and .claude/settings.json to the repo
- Each person rebuilds it from memory
- Screenshot and share
- It only works on your machine
> Those are file-based, committable artifacts. Sharing them standardizes commands, reviewers, and hook guarantees across the team.
```

:::try Module complete!
You can now bend Claude Code to your team's exact workflow. Choose **Complete and continue** for your **🛠️ Customizer** badge. Next: scale beyond one session — headless mode, CI, and parallel agents.
:::

# Headless Mode & CI

Everything so far assumed one human, one Claude, one conversation. But Claude Code also runs **without a session** — as a command you can pipe, script, and drop into CI. That's where it stops being a tool you use and becomes infrastructure.

## `claude -p` — non-interactive mode

Pass a prompt with `-p` and Claude runs it once, prints the result, and exits — no interactive session:

```bash
# One-off query
claude -p "Explain what this project does"

# Structured output you can parse
claude -p "List all API endpoints" --output-format json

# Streaming output for real-time processing
claude -p "Analyze this log file" --output-format stream-json --verbose
```

This is the building block for **pre-commit hooks, CI pipelines, and any automated workflow.** Output formats: plain text, `json`, or `stream-json`.

Three flags worth knowing for serious pipelines (all in `claude --help`):

```bash
# force the output to match a schema — no more parsing prose
claude -p "Extract the endpoints as {path, method, auth}" --json-schema '{"type":"object", "...": "..."}'

# hard cost ceiling and a fallback when the primary model is overloaded
claude -p "…" --max-budget-usd 2 --fallback-model sonnet
```

## Pipe data in and out

Claude Code is a good Unix citizen:

```bash
# Pipe a file IN
cat error.log | claude -p "What's the root cause of these errors? Be concise."

# Pipe Claude's JSON OUT to another tool
claude -p "List risky TODOs in this repo" --output-format json | jq '.result'
```

## Run unattended, safely

For automated runs you won't be watching, scope what Claude may do and let the classifier guard the rest:

```bash
# auto mode: a classifier blocks risky actions; with no human to ask, a blocked action is skipped and the run continues
claude --permission-mode auto -p "fix all lint errors"

# pre-approve only what the job needs; in -p, any other call that would prompt is denied
claude -p "Add a license header to this file" --allowedTools "Edit,Bash(git add *)"
```

:::warning Unattended = scope tightly
With no human in the loop, the permission mode and your pre-approved tools are your safety rails: `--allowedTools` pre-approves tools, `--tools` restricts which tools exist at all, and `--permission-mode dontAsk` denies anything not pre-approved. Allow only what the job needs. Use `--verbose` while developing the prompt, then turn it off in production.
:::

## In CI: GitHub Actions

You can run Claude Code in CI to review PRs or even implement fixes. The easy setup path is **`/install-github-app`** from inside a session — it wires the GitHub app and a starter workflow for you. Then **mention `@claude`** in an issue or PR comment to trigger it (review, implement, answer). The action's v1 detects the mode itself: `@claude` mentions and issue assignments run interactively, while an explicit `prompt` input runs as pure automation ([github-actions docs](https://code.claude.com/docs/en/github-actions)). A minimal workflow looks like:

```yaml
# .github/workflows/claude.yml
name: Claude
on:
  issue_comment:
    types: [created]
jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
      actions: read
    steps:
      - uses: actions/checkout@v7
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

Now commenting *"@claude please add tests for the auth module and open a PR"* on an issue kicks off a real run. The `permissions` block matters: `id-token: write` is required for the action's default GitHub App authentication, and the write permissions let it push a branch and comment. Subscription users can pass `claude_code_oauth_token` instead of an API key. (Check the [action's docs](https://github.com/anthropics/claude-code-action) for the full input list — they evolve.)

## Beyond the CLI: the Agent SDK

`claude -p` is the door; the **Claude Agent SDK** is the whole building. It exposes the same engine that powers Claude Code — the agent loop, tools, permissions, hooks, MCP, subagents — as a [TypeScript / Python library](https://code.claude.com/docs/en/agent-sdk/overview) (`@anthropic-ai/claude-agent-sdk`), so a workflow you prototyped as a prompt can graduate into a proper service with programmatic control over every turn. If you're building a product on agents rather than scripting your own repo, start there. For lean CI containers, `claude --bare` skips hooks, plugins, and memory discovery for a minimal, reproducible run.

## A pre-commit gate example

Use headless Claude as a lightweight reviewer before code lands:

```bash
# .git/hooks/pre-commit (simplified)
git diff --cached | claude -p "Review this staged diff. If you find a likely bug or a leaked secret, print BLOCK and why. Otherwise print OK." | grep -q BLOCK && {
  echo "Claude flagged an issue — commit blocked."; exit 1;
}
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: How do you run Claude once from a script, with no session?
A: `claude -p "your prompt"`. It runs the prompt once, prints the result, and exits.

Q: How do you get output another tool can parse?
A: Add `--output-format json` (or `stream-json` for real-time processing). `--json-schema` forces the output to match a schema.

Q: What are your safety rails for an unattended run?
A: The permission mode and pre-approved tools: `--allowedTools` pre-approves, `--tools` restricts, and `--permission-mode dontAsk` denies the rest. Allow only what the job needs.

Q: Headless auto mode keeps blocking. What does it do?
A: It skips the blocked action and keeps working, because there is no human to ask. Add `--permission-prompts none` so Claude doesn't retry.

Q: What is the easy path to Claude in GitHub Actions?
A: Run `/install-github-app` in a session, then mention `@claude` in an issue or PR comment to trigger it.

Q: How do you cap what a headless run can cost?
A: `--max-budget-usd`, e.g. `--max-budget-usd 2`. Add `--fallback-model sonnet` for when the primary model is overloaded.
```

```quiz
Q: How do you run Claude Code without an interactive session, for use in a script?
+ claude -p "your prompt" (optionally with --output-format json)
- You can't; it's interactive only
- /headless
- claude --gui
> `claude -p` is non-interactive (headless) mode — the basis for CI, pre-commit hooks, and pipelines.

Q: For an unattended batch job, what keeps it safe?
+ Pre-approve only the needed tools with --allowedTools and pick a strict permission mode such as dontAsk or auto
- Nothing; it's automatically safe
- Run it as root
- --dangerously-skip-permissions on a production repo
> No human to approve = scope tightly. --allowedTools pre-approves (it doesn't restrict; --tools does), dontAsk denies everything else, and auto mode skips a blocked action and keeps working.

Q: How do you trigger Claude Code from a GitHub issue or PR?
+ Install the Claude Code GitHub action/app and mention @claude in a comment
- Email Anthropic
- It's not possible
- Paste code into the issue
> The GitHub action lets you mention @claude to review or implement, opening PRs from CI.
```

:::try Next
One Claude is great. Several Claudes working in parallel — without stepping on each other — is a force multiplier. Enter git worktrees.
:::

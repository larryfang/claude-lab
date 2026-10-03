# Starter Templates

Copy-paste starting points for your `.claude/` setup. Adapt to your stack, commit to your repo, and your whole team benefits. (Tip: you can also just ask Claude to generate any of these for *your* project.)

## CLAUDE.md

```markdown
# Project: <name>

## Commands
- Install: <cmd>
- Dev:     <cmd>
- Test:    <cmd>   # prefer single-file runs for speed
- Lint:    <cmd>
- Typecheck: <cmd>

## Code style
- <rules that DIFFER from language defaults only>
- Colocate tests as <pattern>

## Workflow
- IMPORTANT: run typecheck after a series of edits
- Conventional commits (feat:, fix:, chore:)
- Never edit <generated/vendored dir> — it's built by <cmd>

## Gotchas
- <non-obvious behavior #1>
- Required env vars: <VAR1>, <VAR2>
```

## A custom command — `.claude/commands/pr.md`

```markdown
---
disable-model-invocation: true
---
Review the current git diff, then:
1. Summarize what changed and why.
2. Run the tests and report results.
3. Use a feature branch, stage only the reviewed changes and commit with a conventional message.
4. Push that branch to the agreed remote and open a draft PR with `gh pr create --draft`. Include the summary, actual test results and anything unverified.
```

This command publishes work. Use an owned repository or agreed fork with `gh` authenticated; stop at the local commit when practising without publishing.

## A command with arguments — `.claude/commands/fix-issue.md`

```markdown
---
disable-model-invocation: true
---
Analyze and fix GitHub issue: $ARGUMENTS

1. `gh issue view $ARGUMENTS` to read it.
2. Locate relevant files; implement the fix.
3. Write and run tests to verify.
4. On a feature branch, stage only this fix, commit, push to the agreed remote and open a draft PR. Report the checks actually run.
```

## A subagent — `.claude/agents/code-reviewer.md`

```markdown
---
name: code-reviewer
description: Reviews a diff for bugs, security, and convention violations. Use after a change.
tools: Read, Grep, Glob
model: sonnet
---
You are a senior reviewer. Flag only correctness and security issues (not style).
Review the supplied diff and affected files. Ask the parent for a diff if missing.
For each finding give file:line and a specific fix. If the diff is clean, say so.
Follow the project rules in CLAUDE.md. Rules critical to this review: <restate them here, e.g. "never approve an edit to an existing file in db/migrations/">.
```

## A skill — `.claude/skills/api-conventions/SKILL.md`

```markdown
---
name: api-conventions
description: REST conventions for our services. Use when adding or changing endpoints.
---
# API Conventions
- kebab-case URL paths; camelCase JSON
- Paginate all list endpoints
- Version in the path (/v1/)
```

## settings.json — permissions + a format hook

The format hook needs `jq`, Node/npm and a project-local Prettier installation. Test a supported file with spaces in its name, then verify that a formatter failure is reported. Permission rules constrain the named tools; use sandboxing for broader filesystem and network boundaries.

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run test:*)",
      "Bash(npm run lint)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Read"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./secrets/**)",
      "Bash(rm -rf:*)",
      "Bash(git push:*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "file=$(jq -r '.tool_input.file_path // empty') || exit 1; if [ -n \"$file\" ]; then npx --no-install prettier --write -- \"$file\"; fi" }
        ]
      }
    ]
  }
}
```

## Connect an MCP server (shell)

```bash
# GitHub — the official remote server, authenticated with a fine-grained personal
# access token (or use the gh CLI directly — often simpler)
claude mcp add --transport http github https://api.githubcopilot.com/mcp/ \
  --header 'Authorization: Bearer ${GITHUB_TOKEN}'

# Sentry — remote HTTP server (example straight from `claude mcp add --help`)
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# A local stdio server, with env vars
claude mcp add my-server -e API_KEY=xxx -- npx -y my-mcp-server

# then manage with /mcp inside a session, or `claude mcp list`
```

Provide `GITHUB_TOKEN` through your approved credential manager or environment. The single quotes save a variable reference rather than a token in the command and configuration. Keep credentials out of committed files; see [MCP variable expansion](https://code.claude.com/docs/en/mcp#environment-variable-expansion-in-mcp-json).

## A path-scoped rule — `.claude/rules/migrations.md`

```markdown
---
paths:
  - "db/migrations/**"
---
Migration files are immutable once merged. Never edit an existing migration;
create a new one. Every migration needs a paired down() that actually reverses it.
```

Rules load only when Claude touches matching files — module-specific guidance without bloating every session ([memory docs](https://code.claude.com/docs/en/memory)).

## A recommended .gitignore additions

```text
# Claude Code — keep personal stuff out of the repo
CLAUDE.local.md
.claude/settings.local.json
```

:::tip Let Claude tailor these
Paste a template and say: *"Adapt this CLAUDE.md / settings.json to this project — detect the real commands and conventions."* Claude will fill in the blanks from your actual codebase.
:::

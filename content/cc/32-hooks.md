# Hooks: Deterministic Automation

`CLAUDE.md` rules and skill instructions are **advisory**: they describe what Claude should do. **Hooks attach handlers to lifecycle events**, so the handler runs when its matching event occurs. A handler can still fail, time out or be misconfigured. Test the trigger and the failure path; automatic invocation is not a guarantee of a correct result.

## Advisory vs enforced checks

:::concept The key distinction
- A `CLAUDE.md` rule "always run prettier after edits" is a *suggestion* Claude usually follows.
- A **PostToolUse hook** can invoke Prettier after a matching Edit or Write call without relying on a reminder. Check that the formatter succeeds. A file rewritten by Bash needs separate coverage, such as a `FileChanged` hook naming the file literally.

Use tested hooks for repeatable checks: formatting, linting, running tests and notifications. Define what should happen when a handler fails; automatic invocation alone does not enforce the result.
:::

## The lifecycle events

Hooks fire on events in Claude's loop; the maintained [event reference](https://code.claude.com/docs/en/hooks) is the source for their names and supported handlers. The ones you'll use most:

| Event | Fires… | Great for |
|---|---|---|
| **PreToolUse** | before a tool runs (and can **block** it) | denying edits to protected files; guarding dangerous commands |
| **PostToolUse** | after a tool succeeds | auto-format/lint after edits; run affected tests |
| **Stop** | when Claude tries to end its turn | gate completion on a passing build/test |
| **UserPromptSubmit** | when you send a prompt | inject standard context, log requests |
| **SessionStart** | at session start | print branch/status, set up env |
| **PostToolUseFailure** | after a tool call fails | log or react to failures |
| **SubagentStop** | when a subagent finishes | collect subagent results, notify |
| **PreCompact** | before context compaction | preserve state that must survive a compact |

## Configuring them

Hooks live in `.claude/settings.json` (commit it to share with the team). Your command receives the event as **JSON on stdin** — tool name, tool input, file paths — plus env vars like `$CLAUDE_PROJECT_DIR` ([hook I/O reference](https://code.claude.com/docs/en/hooks)). Here's a PostToolUse hook that formats files after every edit:

```json
{
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

This shell example requires `jq`, Node/npm and Prettier installed in the project. It quotes the file path, so spaces in a filename remain one argument, and `--no-install` avoids downloading a formatter during the hook. Test it on a file with spaces in its name and with a failing formatter.

For a protected folder, start with a **permission rule** rather than a shell substring check. This project setting denies recognized Edit and Write operations under `db/migrations/` ([permission rules](https://code.claude.com/docs/en/permissions)):

```json
{
  "permissions": {
    "deny": ["Edit(/db/migrations/**)"]
  }
}
```

Path rules cover the file tools and recognized shell file operations; they do not stop arbitrary scripts from accessing the same files. Use sandboxing or operating-system permissions when you need that boundary. Test allowed and denied paths before relying on it.

A custom **PreToolUse** handler can also block an action: return exit code **2** and a useful stderr explanation, or the supported JSON decision. Other nonzero exit codes report a hook error without blocking. A **Stop** handler must likewise return exit code 2 or `{"decision":"block","reason":"…"}` to keep Claude working; a test command returning 1 by itself does not gate completion. Check `stop_hook_active` and handle an unavailable dependency without creating a loop ([decision control](https://code.claude.com/docs/en/hooks#decision-control)).

:::note Beyond shell commands
`"type": "command"` is just the classic form. Hooks can also be **HTTP** calls to an endpoint, **prompt** hooks (an LLM judges the event against a rule you write in English), and **agent** hooks (an agent can inspect files and test output) — see the [hooks reference](https://code.claude.com/docs/en/hooks) for the events each handler supports. Model-based judgments still need evaluation; they are not deterministic correctness checks.
:::

:::tip Let Claude write your hooks
You rarely hand-write these. Just ask:

> "Write a hook that runs eslint --fix after every file edit."
> "Write a hook that blocks writes to the `migrations/` folder."

Then run **`/hooks`** to browse and verify what's configured. Claude edits `settings.json` for you.
:::

## Where hooks can come from

Hooks can be defined in `settings.json` (user / project / local), in a **plugin's** `hooks.json`, or inline in frontmatter: a subagent's hooks run only while that subagent runs, and a skill's hooks register when the skill runs and stay active for the rest of the session. Settings reload live — most changes apply without restarting.

## The "stop nagging your CLAUDE.md" pattern

:::warning Convert nagging rules into hooks
If your `CLAUDE.md` keeps growing rules like "remember to format," "remember to run tests," "don't touch generated files" — and Claude keeps slipping — that's a sign to **convert them to hooks.** Deterministic enforcement beats a longer, noisier memory file (and it shrinks your context). This is one of the best ways to keep `CLAUDE.md` lean.
:::

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What makes a hook different from a `CLAUDE.md` rule?
A: A matching hook invokes a handler automatically. A `CLAUDE.md` rule is advisory. The handler still needs correct configuration, working dependencies and tests for its failure path.

Q: Which hook event can block a tool before it runs?
A: **PreToolUse**. Exit code 2 blocks the action and feeds the stderr message back to Claude.

Q: Which event can run a formatter after an Edit or Write?
A: **PostToolUse**, with a matcher like `Edit|Write`. Check that the formatter succeeds. For changes made by other tools, consider a `FileChanged` hook and check its matcher requirements in the current reference.

Q: Which event gates completion on a passing build or test?
A: **Stop**. It fires when Claude tries to end its turn. The handler must explicitly block with exit code 2 or a supported JSON decision; an ordinary failing test exit code is not enough.

Q: Where do hooks live, and how does your command get the event?
A: In `.claude/settings.json` (commit it to share). Your command receives the event as JSON on stdin.

Q: Your `CLAUDE.md` keeps growing "remember to…" rules. What now?
A: Use tested hooks for automatic checks, and permission rules for tool restrictions. Confirm what happens when a check fails rather than assuming it blocks the action.
```

```quiz
Q: What makes a hook different from a CLAUDE.md rule?
+ Matching hooks invoke handlers automatically; CLAUDE.md rules are advisory
- Hooks are just longer rules
- Hooks only work in plan mode
- There's no difference
> A hook can automate a check. Its event, exit-code behavior, dependencies and failure path determine what it actually enforces.

Q: You want to run a formatter after an Edit or Write. Which hook event?
+ PostToolUse (matching Edit|Write) running your formatter
- SessionStart
- A CLAUDE.md note
- UserPromptSubmit
> PostToolUse fires after the matching tool succeeds. Test a real edit and a failed formatter; this hook does not cover every possible way to change a file.

Q: Your CLAUDE.md keeps growing "remember to..." rules that Claude still forgets. Better approach?
+ Move automatic checks into tested hooks and keep CLAUDE.md focused on guidance
- Add them three more times in caps
- Give up on the rules
- Make CLAUDE.md even longer
> Tested hooks make automatic checks visible and repeatable. Keep advisory guidance in CLAUDE.md and use permission rules when you need tool restrictions.
```

:::try Next
One more customization layer: connecting external tools with **MCP**, installing **plugins**, and understanding the whole `.claude/` folder.
:::

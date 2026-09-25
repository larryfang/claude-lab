# Hooks: Deterministic Automation

Everything so far is **advisory** — `CLAUDE.md` rules and skill instructions are things Claude *should* do. **Hooks are deterministic**: shell commands that run automatically at specific lifecycle points, **guaranteed**, with zero exceptions.

## Advisory vs guaranteed

:::concept The key distinction
- A `CLAUDE.md` rule "always run prettier after edits" is a *suggestion* Claude usually follows.
- A **PostToolUse hook** that runs prettier after every edit is a *guarantee* — it happens whether Claude remembers or not. (It covers edits made with the Edit and Write tools; a file that a Bash command rewrites needs a `FileChanged` hook.)

Use hooks for the things that **must** happen every time: formatting, linting, running tests, blocking edits to protected paths, sending a notification.
:::

## The lifecycle events

Hooks fire on events in Claude's loop — **33 events** as of v2.1.282 ([full list](https://code.claude.com/docs/en/hooks)). The ones you'll use most:

| Event | Fires… | Great for |
|---|---|---|
| **PreToolUse** | before a tool runs (and can **block** it) | denying edits to protected files; guarding dangerous commands |
| **PostToolUse** | after a tool runs | auto-format/lint after edits; run affected tests |
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
          { "type": "command", "command": "jq -r '.tool_input.file_path // empty' | xargs -r npx prettier --write" }
        ]
      }
    ]
  }
}
```

And a PreToolUse hook that **blocks** edits to a protected folder:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "jq -r '.tool_input.file_path // empty' | grep -q 'db/migrations/' && { echo 'Blocked: migrations are immutable' >&2; exit 2; } || exit 0" }
        ]
      }
    ]
  }
}
```

(Exit code **2** from a PreToolUse hook blocks the action and feeds the stderr message back to Claude. Hooks can also return a JSON decision on stdout for finer control.)

:::note Beyond shell commands
`"type": "command"` is just the classic form. Hooks can also be **HTTP** calls to an endpoint, **prompt** hooks (a fast LLM judges the event against a rule you write in English), and **agent** hooks (experimental) — see the [hooks reference](https://code.claude.com/docs/en/hooks). Prompt hooks are the middle ground when a rule is too fuzzy for a script but must still run every time.
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
A: A hook is **deterministic**: it runs automatically, every time. A `CLAUDE.md` rule is advisory — a suggestion Claude usually follows.

Q: Which hook event can block a tool before it runs?
A: **PreToolUse**. Exit code 2 blocks the action and feeds the stderr message back to Claude.

Q: Which event guarantees formatting after every edit?
A: **PostToolUse**, with a matcher like `Edit|Write` running your formatter. It covers the Edit and Write tools; a file rewritten by Bash needs a `FileChanged` hook.

Q: Which event gates completion on a passing build or test?
A: **Stop**. It fires when Claude tries to end its turn.

Q: Where do hooks live, and how does your command get the event?
A: In `.claude/settings.json` (commit it to share). Your command receives the event as JSON on stdin.

Q: Your `CLAUDE.md` keeps growing "remember to…" rules. What now?
A: Convert the must-happen ones into hooks. Deterministic enforcement beats a longer, noisier memory file, and it shrinks your context.
```

```quiz
Q: What makes a hook different from a CLAUDE.md rule?
+ Hooks are deterministic — they run automatically every time; CLAUDE.md rules are advisory
- Hooks are just longer rules
- Hooks only work in plan mode
- There's no difference
> For anything that must happen with zero exceptions (format, test, block protected paths), use a hook, not a suggestion.

Q: You want to guarantee code is formatted after every edit. Which hook event?
+ PostToolUse (matching Edit|Write) running your formatter
- SessionStart
- A CLAUDE.md note
- UserPromptSubmit
> PostToolUse fires after a tool runs — perfect for auto-format/lint after Edit and Write calls (a file rewritten by Bash needs a FileChanged hook).

Q: Your CLAUDE.md keeps growing "remember to..." rules that Claude still forgets. Better approach?
+ Convert the must-happen ones into hooks — deterministic enforcement, and it shrinks CLAUDE.md
- Add them three more times in caps
- Give up on the rules
- Make CLAUDE.md even longer
> Hooks guarantee the behavior and reduce context bloat. Reserve CLAUDE.md for genuinely advisory guidance.
```

:::try Next
One more customization layer: connecting external tools with **MCP**, installing **plugins**, and understanding the whole `.claude/` folder.
:::

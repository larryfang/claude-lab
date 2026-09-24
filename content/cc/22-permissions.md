# Permissions & Staying Safe

Claude Code can edit files and run commands — that's the power, and the responsibility. This lesson is how to stay safe **without** clicking "approve" a hundred times a day.

## The permission model

Claude Code gates anything that could modify your system — file writes, Bash commands, MCP tool calls. The classic behavior is **ask before acting**: safe, but tedious, because after the tenth approval you're not reviewing, you're just clicking.

That's why **auto mode is now the default** on Pro, Max and Team plans ([permission modes](https://code.claude.com/docs/en/permission-modes)): a separate classifier model reviews each action and interrupts you only for the genuinely risky ones. In a study Anthropic ran, dangerous commands were hidden inside realistic sessions — 1,053 professional developers manually approving caught **13.6%** of them; auto mode's classifier caught **89%** ([@adocomplete, 2026-08-13](https://x.com/adocomplete/status/2087957562859913525)). Cycle modes any time with **Shift+Tab**.

## Three layers that cut the noise

| Approach | What it is | Best when |
|---|---|---|
| **Auto mode** | A classifier reviews each action and blocks only risky things (scope escalation, unknown infra, hostile-content-driven actions) | Day-to-day work — it's the default for a reason |
| **Permission allowlists** | Pre-approve specific safe tools/commands with `/permissions` or in `settings.json` | Repetitive safe commands like `npm run lint`, `git commit` |
| **Sandboxing** | OS-level isolation (`/sandbox`): a filesystem boundary plus a **network egress allowlist**, with credential masking built in ([sandboxing](https://code.claude.com/docs/en/sandboxing)) | Letting Claude work freely inside hard boundaries |

Run auto mode non-interactively like this:

```bash
claude --permission-mode auto -p "fix all lint errors"
```

(Other `--permission-mode` values: `plan`, `acceptEdits`, `dontAsk`, `manual`, and `bypassPermissions`.)

:::tip Tune the classifier in plain English
Auto mode's rules are configurable as natural-language sentences in your settings — keep the shipped rules with `$defaults` and add your own ("never touch the prod database", "asking before any docker command"). Inspect the effective config with `claude auto-mode config`, and have Claude review your custom rules for ambiguity with `claude auto-mode critique` ([@lydiahallie, 2026-08-19](https://x.com/lydiahallie/status/2090134982161502394)).
:::

## Allow and deny rules

You can codify permissions in `.claude/settings.json` (commit it to share team rules). Allow the safe stuff; **deny the dangerous stuff** outright:

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
  }
}
```

:::concept allow / deny / ask
- **allow** — pre-approved, runs without a prompt
- **deny** — blocked entirely, even if Claude asks (great for secrets and destructive commands)
- everything else → falls through to the normal **ask** prompt

Pre-approve a handful of read-only/test commands; deny secrets and destructive operations; let the rest prompt. That's the sweet spot.
:::

## The YOLO flag (handle with care)

You'll hear about `--dangerously-skip-permissions` (a.k.a. "YOLO mode"), which skips all prompts.

:::warning When (and when not) to skip permissions
**Legit uses:** a throwaway sandbox, a disposable container/VM, or CI where the environment is isolated and the repo is trusted.

**Never** use it on **untrusted code or content.** Claude can be steered by **prompt injection** — malicious instructions hidden in a file, dependency, issue, or web page it reads — into running harmful commands. With permissions off and real filesystem access, that's a genuine risk. On any repo you don't fully trust, keep permissions on (or sandbox).

Anthropic reports its stacked defenses (model training, input probes, an intent classifier) now catch close to 100% of *unseen* injection attacks in its evals ([@bcherny, 2026-08-07](https://x.com/bcherny/status/2085860677990883454)) — but independent researchers remain cautious about treating any such number as solved-problem territory ([Simon Willison's response](https://x.com/simonw/status/2086220154468442496)). Treat the defenses as seatbelts, not permission to drive blind.
:::

## A sane default setup

For most day-to-day work on **your own** repo:

1. Run in **normal mode**, or **auto mode** when you trust a longer task.
2. Allowlist your common safe commands (test, lint, build, `git add`/`commit`).
3. **Deny** reads of `.env`/secrets and destructive commands (`rm -rf`, `git push`, force operations).
4. Reach for **sandboxing** when working with anything unfamiliar.

## Make the call

Choose what you would do, read the consequence, then try the other options.

```scenario
S: You clone an unfamiliar open-source repo that you don't fully trust, and you want Claude to fix its failing build.
Q: How do you run the session?
+ Keep permissions on and reach for sandboxing (`/sandbox`), so Claude works inside a filesystem boundary and a network egress allowlist.
> Claude can work freely inside hard boundaries. If a file or dependency carries hidden instructions, the boundaries still stand between it and your system.
~ Keep permissions on in normal mode, and read each request before you approve it.
> Safe — you stay in control of every action. But a long fix means many prompts, and sandboxing would let Claude work freely inside hard boundaries.
- Start Claude with `--dangerously-skip-permissions` so the fix goes faster.
> Never on untrusted code or content. A prompt injection hidden in a file, dependency or issue can steer Claude into harmful commands, with no prompt to stop it.

S: On your own repo, Claude asks you to approve `npm run lint` for the tenth time today.
Q: What do you change?
+ Allowlist it with `/permissions` (or in `settings.json`) so it runs without a prompt.
> The noise goes away for that one safe command, and everything else still asks. You keep control where it matters.
~ Keep approving it each time; that's the safety model working.
> Safe, but tedious. After the tenth approval you're not reviewing, you're just clicking — which is when a risky request slips past you.
- Restart with `--dangerously-skip-permissions` so nothing asks again.
> You trade one annoying prompt for no prompts on anything. That's only legit in a throwaway sandbox, a disposable container/VM, or isolated CI with a trusted repo.
```

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: What does auto mode do?
A: A separate classifier model reviews each action and interrupts you only for the genuinely risky ones. It's the default on Pro, Max and Team plans.

Q: allow, deny, ask — what does each do?
A: **allow** runs without a prompt; **deny** blocks entirely, even if Claude asks; everything else falls through to the normal **ask** prompt.

Q: Where do you codify permission rules for the whole team?
A: In `.claude/settings.json`. Commit it to share team rules.

Q: What does sandboxing (`/sandbox`) give you?
A: OS-level isolation: a filesystem boundary plus a network egress allowlist, with credential masking built in.

Q: When is `--dangerously-skip-permissions` legit?
A: In a throwaway sandbox, a disposable container/VM, or CI where the environment is isolated and the repo is trusted. Never on untrusted code or content.

Q: Why keep permissions on for a repo you don't fully trust?
A: **Prompt injection**: instructions hidden in a file, dependency, issue, or web page can steer Claude into running harmful commands.
```

```quiz
Q: You're tired of approving `npm test` every time. Best fix?
+ Allowlist it via /permissions (or settings.json) so it runs without prompting
- Use --dangerously-skip-permissions globally
- Approve it forever, one click at a time
- Turn off your firewall
> Allowlist specific safe commands. That removes the noise without giving up control over everything else.

Q: When is --dangerously-skip-permissions reasonable?
+ In an isolated sandbox/container or trusted CI — never on untrusted code or content
- Always, to save time
- On any repo you find online
- When reviewing a stranger's PR locally with full access
> Skipping permissions is fine in isolation with trusted code. Untrusted code/content + no permissions = prompt-injection risk.

Q: What's the point of a `deny` rule like `Read(./.env)`?
+ It blocks Claude from ever reading secrets, even if it would otherwise ask
- It speeds up reads
- It encrypts the file
- It's only decorative
> deny is a hard block — perfect for secrets and destructive commands. allow pre-approves; everything else prompts.
```

:::try Next
You can plan, verify, and stay safe. Time to put the whole workflow together in a lab: ship a real feature with plan mode and TDD.
:::

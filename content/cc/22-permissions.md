# Permissions & Staying Safe

Claude Code can edit files and run commands — that's the power, and the responsibility. This lesson is how to stay safe **without** clicking "approve" a hundred times a day.

## The permission model

Claude Code gates anything that could modify your system — file writes, Bash commands, MCP tool calls. The classic behavior is **ask before acting**: safe, but tedious, because after the tenth approval you're not reviewing, you're just clicking.

**Auto mode is the built-in starting mode for supported Pro, Max, and Team terminal and VS Code sessions**, subject to settings and availability. Enterprise, API-key, and non-interactive runs have different defaults. Check the mode indicator and [current starting-mode table](https://code.claude.com/docs/en/permission-modes) rather than assuming the default.

Auto uses a classifier to review actions, but it does not guarantee safety. Explicit ask rules and some other actions still require your input ([permission rules](https://code.claude.com/docs/en/permissions)). Cycle modes with **Shift+Tab**.

## Three layers that cut the noise

| Approach | What it is | Best when |
|---|---|---|
| **Auto mode** | A classifier checks actions against the request and configured boundaries; it can make mistakes | Work with a clear scope that you can review |
| **Permission allowlists** | Pre-approve specific safe tools/commands with `/permissions` or in `settings.json` | Repetitive safe commands like `npm run lint`, `git commit` |
| **Sandboxing** | OS-level isolation (`/sandbox`): a filesystem boundary plus a **network egress allowlist**, and optional credential masking you configure with `sandbox.credentials` ([sandboxing](https://code.claude.com/docs/en/sandboxing)) | Letting Claude work freely inside hard boundaries |

Run auto mode non-interactively like this:

```bash
claude --permission-mode auto -p "fix all lint errors"
```

(Other `--permission-mode` values: `plan`, `acceptEdits`, `dontAsk`, `manual`, and `bypassPermissions`.)

:::tip Tune the classifier in plain English
Auto mode's rules are configurable as natural-language sentences in your settings — keep the shipped rules with `$defaults` and add your own ("never touch the prod database", "no docker push to public registries"). Inspect the effective config with `claude auto-mode config`, and have Claude review your custom rules for ambiguity with `claude auto-mode critique` ([@lydiahallie, 2026-08-19](https://x.com/lydiahallie/status/2090134982161502394)).
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
- **deny** — blocked in every mode, even if Claude asks (great for secrets and destructive commands). It matches the command text, so it isn't an OS-level boundary: pair it with `/sandbox`
- **ask** — an explicit rule that always prompts, even in auto mode (e.g. `Bash(docker *)`)
- everything else → the classifier in auto mode, or a normal prompt in Manual mode

Pre-approve a handful of read-only/test commands; deny secrets and destructive operations; let the rest go to the classifier or a prompt. That's the sweet spot.
:::

## The YOLO flag (handle with care)

You'll hear about `--dangerously-skip-permissions` (a.k.a. "YOLO mode"), which bypasses routine permission checks. Some actions still prompt or are denied in non-interactive runs; it is not a promise of zero interruptions.

:::warning When (and when not) to skip permissions
**Legit uses:** a throwaway sandbox, a disposable container/VM, or CI where the environment is isolated and the repo is trusted.

**Never** use it on **untrusted code or content.** Claude can be steered by **prompt injection** — malicious instructions hidden in a file, dependency, issue, or web page it reads — into running harmful commands. With permissions off and real filesystem access, that's a genuine risk. On any repo you don't fully trust, keep permissions on (or sandbox).

Anthropic's [security guidance](https://code.claude.com/docs/en/security) describes multiple defenses against prompt injection. Those controls reduce risk; they do not establish that an unfamiliar repository or a particular action is safe.
:::

## A sane default setup

For most day-to-day work on **your own** repo:

1. Check the current mode. Use **auto mode** for a clearly scoped task you can review, or **Manual mode** when you need to inspect approvals yourself.
2. Allowlist your common safe commands (test, lint, build, `git add`/`commit`).
3. **Deny** reads of `.env`/secrets and destructive commands (`rm -rf`, `git push`, force operations). Deny rules match command text, so pair them with sandboxing for a hard boundary.
4. Reach for **sandboxing** when working with anything unfamiliar.

## Make the call

Choose what you would do, read the consequence, then try the other options.

```scenario
S: You clone an unfamiliar open-source repo that you don't fully trust, and you want Claude to fix its failing build.
Q: How do you run the session?
+ Keep permissions on and reach for sandboxing (`/sandbox`), so Claude works inside a filesystem boundary and a network egress allowlist.
> Claude can work freely inside hard boundaries. If a file or dependency carries hidden instructions, the boundaries still stand between it and your system.
~ Keep permissions on in Manual mode, and read each request before you approve it.
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
A: A classifier reviews actions against scope and configured rules. It can make mistakes, and explicit ask rules still prompt. Check the active mode rather than assuming your plan always starts in Auto.

Q: allow, deny, ask — what does each do?
A: **allow** runs without a prompt; **deny** blocks in every mode; **ask** always prompts, even in auto mode. Anything unmatched goes to the classifier (auto) or a prompt (Manual).

Q: Where do you codify permission rules for the whole team?
A: In `.claude/settings.json`. Commit it to share team rules.

Q: What does sandboxing (`/sandbox`) give you?
A: OS-level isolation: a filesystem boundary plus a network egress allowlist, and optional credential masking you configure with `sandbox.credentials`.

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
+ It blocks Claude's file tools and common shell reads (`cat`, `head`…) of `.env`, even where Claude would otherwise ask
- It speeds up reads
- It encrypts the file
- It's only decorative
> deny blocks in every mode — good for secrets and destructive commands. It isn't an OS-level boundary (a script can still open the file), so pair it with /sandbox. allow pre-approves; ask always prompts.
```

:::try Next
You can plan, verify, and stay safe. Time to put the whole workflow together in a lab: ship a real feature with plan mode and TDD.
:::

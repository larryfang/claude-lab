# Parallel Sessions & Worktrees

Once you're effective with one Claude, you can multiply your output by running several at once — on independent tasks, isolated experiments, or a writer/reviewer split. The trick is keeping them from stepping on each other.

## The collision problem

Two Claude sessions editing the **same working directory** will clobber each other's changes. The clean fix is **git worktrees**: multiple checkouts of the same repo in separate folders, each on its own branch.

```bash
# Create isolated checkouts, each on its own branch
git worktree add ../proj-oauth   -b feature/oauth
git worktree add ../proj-billing -b feature/billing

# Run a Claude in each — no collisions
cd ../proj-oauth   && claude    # terminal 1
cd ../proj-billing && claude    # terminal 2
```

Each session has its own files, its own branch, its own context. Merge the branches when done. Claude Code can even do the git plumbing for you: **`claude -w`** (`--worktree`) starts the session in a fresh worktree in one step, and `--tmux` gives it its own pane.

## Sessions that know about each other

Two flags turn "several terminals" into a managed fleet:

- **Name them** — `claude -n backend`, `claude -n frontend`. Named sessions can **message each other**: tell one *"tell frontend the order endpoint changed"* and it does, via cross-session messaging ([docs](https://code.claude.com/docs/en/cross-session-messaging); demo: [@adocomplete, 2026-08-13](https://x.com/adocomplete/status/2087728817012162973)).
- **Background them** — `claude --bg "fix the flaky tests"` launches a session that runs without a terminal attached. **`claude agents`** is the control tower: one screen showing every session — running, blocked on a question, or done — and `claude agents --json` scripts it.

```claude-sim
# Your shell. Three sessions are live: two named terminals + one background agent.
$ claude agents
  ● backend      running   fixing order-endpoint validation      (worktree: proj-api)
  ● frontend     waiting   needs input: "confirm new field name"  (worktree: proj-web)
  ● bg-4f2a      running   --bg: migrate remaining class components
$ claude -n backend --continue
Claude Code — session "backend" (branch: feature/orders)
> tell frontend the order endpoint now returns amounts in cents, field "amount_cents"
Message sent to session "frontend". It acknowledged and is updating its formatter util.
```

## The desktop, the web, and your phone

The same fleet idea runs beyond your terminal ([Claude Code on the web](https://code.claude.com/docs/en/web-quickstart)):

- **Desktop app** — manages multiple sessions visually, each in its own worktree.
- **Cloud sessions** — `claude --cloud "task"` hands work to an isolated VM at **claude.ai/code**; `claude --teleport` pulls a cloud session back down to your terminal. **Routines** run scheduled cloud agents ([docs](https://code.claude.com/docs/en/routines)), and self-hosted environments (`--environment`) run cloud sessions on your own infra.
- **Remote Control** — start and steer a session on your machine from your phone ([docs](https://code.claude.com/docs/en/remote-control)).

## The Writer/Reviewer pattern

Parallel sessions aren't just about speed — they unlock **quality**. A *fresh* context reviews better because it isn't biased toward code it just wrote:

| Session A (Writer) | Session B (Reviewer) |
|---|---|
| "Implement a rate limiter for our API." | |
| | "Review `@src/middleware/rateLimiter.ts` for edge cases, race conditions, and consistency with our middleware." |
| "Here's the review: [paste B's output]. Address these." | |

Same idea works for tests: one Claude writes the tests, another writes code to pass them.

## Fan-out across many files

For big migrations or audits, loop `claude -p` over a list, scoping tools for safety:

```bash
# 1) have Claude list the files needing work → files.txt
# 2) fan out
for file in $(cat files.txt); do
  claude -p "Migrate $file from React class component to hooks. Return OK or FAIL." \
    --allowedTools "Edit,Bash(git commit *)"
done
```

:::tip Test on 2–3 first
Refine your prompt on the **first few files**, see what goes wrong, *then* run the whole set. A prompt that's 90% right across 500 files creates 50 messes. Validate small, then scale.
:::

## Agent teams & dynamic workflows (automated coordination)

When you want the coordination handled *for* you, two mechanisms do it:

- **Agent teams** run multiple full sessions with a shared task list, direct teammate messaging, and a team lead. Still experimental — enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` ([docs](https://code.claude.com/docs/en/agent-teams)). Anthropic demoed the ceiling by having a team of Opus sessions build a working C compiler ([HN thread](https://news.ycombinator.com/item?id=46903616)).
- **Dynamic workflows** — put the keyword **`ultracode`** in a prompt and Claude *generates* a multi-agent orchestration plan for that task, then runs it; `/workflows` shows the runs ([docs](https://code.claude.com/docs/en/workflows) · [launch post](https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code)).

Orchestration patterns worth knowing either way: **fan-out/fan-in** (parallel work → synthesize), **validation chains** (builder → reviewer), and **specialist routing** (dispatch by domain).

:::concept In the field: a maintenance fleet, not a chat
Claude Code's creator Boris Cherny runs scheduled Claude sessions against Anthropic's own apps — a crash fuzzer, a duplicate-code unifier, a dead-code remover, an "abstraction police" — coordinated from a Slack channel. In a few weeks the fleet opened 388 PRs, 180 of which merged after automated review plus human sign-off ([@bcherny, 2026-08-13](https://x.com/bcherny/status/2088014489438621990)). The pattern to copy: background agents do the recurring maintenance; humans review the PRs, not the keystrokes.
:::

:::concept Pick your coordination level
- **Worktrees** — you coordinate; max control, simplest mental model.
- **Named/background sessions** (`-n`, `--bg`, `claude agents`) — a fleet you steer from one screen.
- **Desktop/web/cloud sessions** — visual management, or VMs that outlive your laptop lid.
- **Agent teams / dynamic workflows** — automated coordination for jobs too big for one conversation.

Start with worktrees. Reach for teams/workflows only when the task genuinely needs more agents than you can hand-coordinate.
:::

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: Why run parallel sessions in git worktrees?
A: Two sessions in the same working directory clobber each other. Each worktree is a separate checkout on its own branch.

Q: How do you start a session in a fresh worktree?
A: `claude -w` (`--worktree`).

Q: Which command shows every session — running, blocked, or done?
A: `claude agents`, the control tower. `claude agents --json` scripts it.

Q: Why does a separate Reviewer session beat self-review?
A: A fresh context isn't biased toward the code it just wrote, so it reviews better.

Q: What do you do before a fan-out across 500 files?
A: Refine the prompt on the first 2–3 files, see what goes wrong, *then* run the whole set.

Q: Which coordination level do you start with?
A: **Worktrees**: you coordinate, with max control and the simplest mental model. Reach for teams/workflows only when the task genuinely needs them.
```

```quiz
Q: Why use git worktrees to run parallel Claude sessions?
+ Each session gets an isolated checkout + branch, so their edits don't collide
- It makes Claude faster
- It's required to run Claude at all
- It disables permissions
> Two sessions in the same folder clobber each other. Worktrees give each its own files and branch.

Q: Why is a separate Reviewer session often better than asking the Writer to review its own work?
+ A fresh context isn't biased toward the code it just wrote, so it catches more
- It's cheaper
- The Writer can't read code
- Reviews must always be a different model
> Fresh-context review (separate session or subagent) evaluates the result on its own terms and finds more real issues.

Q: Before running a fan-out migration across 500 files, you should…
+ Test and refine the prompt on the first 2–3 files
- Run all 500 immediately
- Skip testing to save time
- Disable git
> Validate small, then scale. A slightly-wrong prompt multiplied by 500 is 500 problems.
```

:::try Next
Let's make it concrete — a lab where you run a headless one-liner and set up a parallel worktree workflow.
:::

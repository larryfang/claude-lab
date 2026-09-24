# MCP, Plugins & the .claude Folder

Two more ways to extend Claude Code — connecting **external tools** (MCP) and installing **bundles** (plugins) — plus a map of the whole `.claude/` folder so you know where everything lives.

## MCP: connect external tools

**MCP (Model Context Protocol)** is the open standard that lets Claude talk to outside tools and data — GitHub, your database, Notion, Figma, Sentry, monitoring, etc. Add one with:

```bash
# remote server over HTTP (the increasingly common form)
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# local stdio server
claude mcp add notion -- npx -y @notionhq/notion-mcp-server
```

Once connected, you can ask Claude to *"implement the feature described in Notion ticket X,"* *"query the staging DB for users created today,"* or *"pull this Figma frame and build the component."* Manage servers with **`/mcp`** in-session, or `claude mcp list` / `claude mcp login <name>` (OAuth) from the shell. Scope with `-s local` (default), `-s project` (writes committable `.mcp.json`), or `-s user` ([MCP docs](https://code.claude.com/docs/en/mcp)).

:::warning Every connected tool costs context
Each MCP server's tool definitions load into the context window. Claude Code mitigates this with **tool search** — tool schemas are deferred and fetched on demand, and a server can opt out per-tool with `alwaysLoad` ([MCP docs](https://code.claude.com/docs/en/mcp)). Still: connect the servers you use, not every server you can. `claude plugin details <name>` shows a plugin's projected token cost before you commit to it.
:::

:::tip CLI tools are often simpler than MCP
For many services, a **CLI** is the most context-efficient integration. Install `gh` and Claude uses it natively for issues/PRs; same for `aws`, `gcloud`, `sentry-cli`. Try: *"Use `foo --help` to learn the tool, then do X."* Reach for MCP when there's no good CLI or you need structured, typed access.
:::

## Plugins: install a whole setup

A **plugin** bundles skills, subagents, hooks, and MCP servers into one installable unit. Instead of wiring each piece, install a plugin and get a ready-made toolkit. `/plugin` opens the marketplace browser in-session; the full flow ([plugin docs](https://code.claude.com/docs/en/plugins)):

```bash
# add a marketplace (a git repo with a marketplace manifest), then install from it
/plugin marketplace add anthropics/claude-plugins-official
/plugin install superpowers@claude-plugins-official

# or from the shell
claude plugin install superpowers@claude-plugins-official
```

Anthropic curates an official directory ([anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)) and mirrors community submissions ([anthropics/claude-plugins-community](https://github.com/anthropics/claude-plugins-community)); any GitHub/GitLab repo or zip can be a marketplace, so **teams host their own**. A plugin is just files — `.claude-plugin/plugin.json` plus the usual `commands/`, `agents/`, `skills/`, `hooks/`, `.mcp.json`.

:::warning Plugins run with your permissions
A plugin's hooks and MCP servers execute on your machine. Install from marketplaces you trust, review what `claude plugin details <name>` reports, and prefer official or well-known community sources — the ecosystem's own top repos warn about malicious look-alike mirrors.
:::

## The .claude/ folder & settings hierarchy

Here's where everything you've learned this module lives:

```text
your-project/
├── CLAUDE.md                    # always-loaded project memory
├── CLAUDE.local.md              # personal, gitignored
└── .claude/
    ├── settings.json            # permissions, hooks, env (commit it)
    ├── settings.local.json      # personal overrides (gitignored)
    ├── commands/                # /slash commands
    ├── skills/<name>/SKILL.md   # skills (auto + /invoke)
    ├── agents/                  # subagents
    └── hooks/                   # hook scripts
```

Settings merge across four layers, highest priority last:

| Layer | File | Scope |
|---|---|---|
| User | `~/.claude/settings.json` | all your projects |
| Project | `.claude/settings.json` | the team (committed) |
| Local | `.claude/settings.local.json` | you, this project (gitignored) |
| Managed | `managed-settings.json` (e.g. `/Library/Application Support/ClaudeCode/` on macOS, `/etc/claude-code/` on Linux) | org policy (wins over all) |

## Which mechanism do I use? (the decision table)

You now have five ways to customize. Pick by **what you need**:

| Need | Use |
|---|---|
| Instructions loaded **every session** | **CLAUDE.md** |
| A reusable **workflow you invoke by name** | **Skill / command** |
| **Context isolation** for a side task (research, review) | **Subagent** |
| Something that must happen at a **fixed lifecycle event** (pre-commit, post-edit) | **Hook** |
| Access to an **external tool or data source** | **MCP server** (or a CLI) |
| To **bundle & share** several of the above | **Plugin** |

:::concept The mental shortcut
**CLAUDE.md** = always-on knowledge · **Skill** = on-demand know-how · **Subagent** = a separate worker · **Hook** = a guarantee · **MCP** = a connection · **Plugin** = a package of all of them.
:::

## Lock it in

Flip each card, recall the answer *before* you look, and grade yourself honestly. Every card joins your review deck and comes back just before you would forget it.

```flashcards
Q: How do you share an MCP server with your team?
A: Add it with `-s project`, which writes a committable `.mcp.json`. The default scope is `-s local`.

Q: Why connect only the MCP servers you actually use?
A: Each server's tool definitions load into the context window. Tool search defers schemas, but every connected tool still costs context.

Q: When is a CLI better than an MCP server?
A: Often — a CLI like `gh` is the most context-efficient integration. Reach for MCP when there's no good CLI or you need structured, typed access.

Q: What is a plugin, and why be careful installing one?
A: One installable unit bundling skills, subagents, hooks, and MCP servers. Its hooks and MCP servers run on your machine with your permissions.

Q: Which settings layer wins over all the others?
A: **Managed** (`managed-settings.json`) — org policy. Below it, Local beats Project, and Project beats User.

Q: CLAUDE.md, Skill, Subagent, Hook — the one-line shortcut?
A: **CLAUDE.md** = always-on knowledge · **Skill** = on-demand know-how · **Subagent** = a separate worker · **Hook** = a guarantee.
```

```quiz
Q: You want Claude to read tickets from your issue tracker and query your database. What connects it to those?
+ MCP servers (claude mcp add …) — or a CLI if one exists
- A hook
- CLAUDE.md
- A subagent
> MCP (and CLIs like gh) connect Claude to external tools and data. Hooks/subagents/CLAUDE.md don't reach outside services.

Q: Something must happen at a fixed lifecycle moment (e.g., format after every edit). Which mechanism?
+ A hook
- A skill
- An MCP server
- A plugin
> Hooks = deterministic lifecycle automation. Skills are on-demand; MCP is connectivity; plugins bundle things.

Q: A teammate built a toolkit of skills + subagents + a hook + an MCP server and wants to share it as one install. That's a…
+ Plugin
- Connector
- CLAUDE.md
- Worktree
> A plugin bundles multiple capabilities into a single installable unit (browse with /plugin).
```

:::try Next
Time to build. The lab: create a custom command, a reviewer subagent, and a format-on-edit hook — then watch them work together.
:::

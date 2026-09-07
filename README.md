# Neural Seam for Claude Code

The official **Neural Seam** plugin for **Claude Code**.

Installing it registers the `neural-seam-runtime` MCP server, wires three lifecycle hooks, and adds
11 `/neural-seam:ns-*` commands. Everything it wires points at the `neural-seam` binary on your
`PATH`.

> **Neural Seam does not provide a model and does not run inference.** It coordinates the work: your
> project's spec, glossary, backlog, cards and per-path conventions live in Neural Seam and are served
> to your agent through MCP. The model you talk to is the one your Claude Code is already configured
> to use, billed by whoever provides it. Neural Seam never authenticates to a model provider on your
> behalf.

- **Product:** <https://neuralseam.cloud>
- **App:** <https://app.neuralseam.cloud>
- **Runtime:** [neural-seam-releases](https://github.com/NeuralSeam/neural-seam-releases#readme) - how
  to install the `neural-seam` binary this plugin wires to, and its user manual
- **Portuguese:** [README.pt-BR.md](./README.pt-BR.md) (short guide; this file is canonical)
- **License:** [MIT](./LICENSE); see [TRADEMARKS.md](./TRADEMARKS.md) for the name and logo

## What it does

- **Gets you set up.** `/neural-seam:ns-start` asks the runtime where you stand and walks you through
  the next step, so you do not have to know which command comes next.
- **Puts your project's own knowledge in context.** The MCP server answers with your backlog,
  conventions and state, instead of the agent reconstructing all of it from the file tree every
  session.
- **Gives you a work loop.** Generate a backlog, list cards, pick one, and render its implementation
  prompt for you to review and run.

## What it does not do

- **It does not install anything.** Not the `neural-seam` binary, not Claude Code.
- **It does not sign you in and does not bind your project.** Those stay with `neural-seam login` and
  `neural-seam connect`.
- **It does not start work on its own.** Commands render prompts for you to review, and the ones that
  would change something [only run when you type them](#commands-that-change-things-are-never-invoked-for-you).
- **It does not hold product logic.** The rules of the product live in the runtime and the backend.
  This plugin presents what the runtime returns.

## Requirements

| You need | How to get it | Check |
| --- | --- | --- |
| Claude Code | Anthropic's installer | `claude --version` |
| The `neural-seam` binary on `PATH` | [Neural Seam installer](https://github.com/NeuralSeam/neural-seam-releases#download-and-install) | `neural-seam version` |
| A Neural Seam account, signed in | `neural-seam login` (device flow) | `neural-seam doctor` |
| A project bound to this folder | `neural-seam connect <projectId>`, or the local dashboard | `/neural-seam:ns-status` |

See [COMPATIBILITY.md](./COMPATIBILITY.md) for the versions this has actually been tested against.

## Install

Two steps, in this order. The install verb resolves a plugin against marketplaces you have already
registered, so the marketplace is added first.

```
/plugin marketplace add NeuralSeam/neural-seam-claude
/plugin install neural-seam@neural-seam
```

`neural-seam@neural-seam` is the plugin `neural-seam` published in the marketplace `neural-seam`. That
is the same reference the runtime prints when it tells you the plugin is missing, so the two always
agree.

### Making it active

The install summary tells you which of two things happened:

- **`Plugin is now active.`** Nothing else to do.
- **`Run /reload-plugins to activate.`** Run that command. If it warns that reloading would re-read
  the conversation, run `/reload-plugins --force`.

Restarting Claude Code has the same effect and is the fallback if a reload does not settle it.

This behaviour depends on your Claude Code version; older versions never activated an install in the
session that performed it. [COMPATIBILITY.md](./COMPATIBILITY.md#when-an-install-takes-effect) has the
detail.

### Check the install

Open Claude Code in a project folder:

1. `/plugin` lists `neural-seam` as installed **and enabled**. A plugin that is registered but
   disabled loads nothing at all, which looks exactly like one that was never installed.
2. `/mcp` shows `neural-seam-runtime`.
3. `/neural-seam:ns-status` answers with the project state.

If the MCP server is missing, run `/neural-seam:ns-doctor`.

## Update

```
/plugin marketplace update
/reload-plugins
```

Then confirm the version in `/plugin`. Release notes are in [CHANGELOG.md](./CHANGELOG.md).

## Uninstall

```
/plugin uninstall neural-seam@neural-seam
```

That removes the commands, the hooks and the MCP registration together. To keep it installed but
switch it off, use `/plugin disable neural-seam@neural-seam` instead. Either way, run
`/reload-plugins` to apply it to the session you are in.

Uninstalling the plugin does **not** remove anything the `neural-seam` runtime wrote: your
credentials, `~/.neural-seam/`, and any per-project files stay until you remove them.
[PRIVACY.md](./PRIVACY.md#deleting-your-data) lists each store and how to clear it.

## First run

```
/neural-seam:ns-start
```

That is the whole answer to "what do I do now". It reads the state and moves one step: sign in, create
or pick a project, bind it, then stop. Run it again for the next step; re-running only does what is
still missing.

Once you are set up:

```
/neural-seam:ns-generate     # bootstrap the backlog
/neural-seam:ns-list         # pick a card
/neural-seam:ns-exec <id>    # render the implementation prompt for that card
```

The last two are the loop.

## Commands

This host namespaces a plugin's commands as `/<plugin>:<command>`, so `/neural-seam:` is part of the
name.

| Command | What it does | Runs only when you type it |
| --- | --- | --- |
| `/neural-seam:ns-status` | Reports the state and the command that comes next. | |
| `/neural-seam:ns-start` | Guided: reads the state and advances one step. | yes |
| `/neural-seam:ns-create` | No project yet: shows the setup wizard link. | |
| `/neural-seam:ns-connect [<id>]` | Project already exists: binds it to this folder. | yes |
| `/neural-seam:ns-clone <id>` | Clones the project's code only. Idempotent. | yes |
| `/neural-seam:ns-doctor` | Repairs the environment: sign in, language servers, MCP registration. | yes |
| `/neural-seam:ns-generate` | Bootstraps the backlog: generates the artefacts and creates the cards. | yes |
| `/neural-seam:ns-list [status] [kind]` | Lists cards, grouped by status. | |
| `/neural-seam:ns-open` | Shows the local dashboard link. | |
| `/neural-seam:ns-exec <id>` | Renders the implementation prompt for a card. | yes |
| `/neural-seam:ns-help` | Index of every command above. | |

### Commands that change things are never invoked for you

The six commands marked above carry `disable-model-invocation: true`, which tells Claude Code not to
pick them up on its own. They run when **you** type them, and not because a model decided one looked
relevant to what you were discussing.

That covers every command that writes a binding, fetches code, repairs your environment, generates a
backlog, or starts implementation work. The five that only read and report stay available to the
model, because the worst case for those is a wasted call.

It is a guard against surprise, not a permission boundary: once you do run one, the tools it uses are
subject to the same approvals as anything else in your session.

## What the plugin wires

| Component | File | Effect |
| --- | --- | --- |
| MCP registration | `.mcp.json` | `neural-seam-runtime`, started as `neural-seam serve --project-from-cwd`. The server resolves the project from the working directory, so **one** registration serves every project. |
| Lifecycle hooks | `hooks/hooks.json` | `SessionStart`, `PreToolUse` and `Stop` run `neural-seam hook <event>`. What each one does is in [SECURITY.md](./SECURITY.md#what-the-hooks-do). |
| Commands | `commands/ns-*.md` | The 11 commands listed above. |

### With the plugin installed, `neural-seam connect` writes less

The same wiring can come from two places: this plugin, once, for every project; or the runtime,
written into each project it connects. Both would mean two MCP registrations and two session hooks, so
only one of them does it.

| Situation | What `neural-seam connect` does |
| --- | --- |
| Plugin installed | Skips the MCP registration, the hooks and the commands, and removes what an earlier per-project setup left behind. It still writes your project's own files: the signed manifest, the project memory and the stubs. |
| Plugin not installed | Writes everything into the project, and tells you to install the plugin. |

Worth knowing:

- **`neural-seam connect --host-wiring plugin|local|auto`** lets you decide instead of being detected.
  `local` forces the per-project files, which is what you want on a machine that cannot install
  plugins; `plugin` forces the skip.
- **When in doubt, the runtime writes the files.** A missed detection leaves you with a working
  project rather than an unwired one.
- **The cleanup only removes what it wrote.** Your own hooks, your own MCP servers and your own files
  are left alone.

### Not included in this release

This release does not include the optional per-path conventions advisory, which points a newly created
source file at the conventions that apply to its path. That behaviour is currently managed by the
`neural-seam` runtime on a per-project basis, so you get it on a project the runtime wired directly.
Everything else - the MCP server, the lifecycle hooks, the commands - is the same either way.

## Privacy and security

**The plugin itself collects nothing and sends nothing.** What it installs is markdown and JSON, with
no network endpoint, no analytics and no credential in it.

The `neural-seam` runtime it points at does move data, and not all of it is optional: signing in,
identifying your machine at sign in, and your project's coordination data are sent whether or not
telemetry is on. Telemetry itself is opt in and off by default. Your source code is read locally.

The hooks this plugin registers run the `neural-seam` binary on your machine and make no network call
of their own. What each one does is listed in [SECURITY.md](./SECURITY.md#what-the-hooks-do).

The full picture, including how to delete each store separately, is in [PRIVACY.md](./PRIVACY.md).

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| No `ns-*` commands | The plugin is installed but not loaded into this session | `/reload-plugins`, then `/reload-plugins --force` if it warns; restart Claude Code if neither helps |
| Still no `ns-*` commands | The plugin is registered but **disabled** | `/plugin`, enable it, then `/reload-plugins` |
| `/mcp` does not show `neural-seam-runtime` | `neural-seam` not on `PATH`, or the plugin is disabled | `neural-seam version`; if that fails, reinstall the runtime |
| `/plugin` reports a load error | The plugin failed to load | Open the **Errors** tab in `/plugin` for the detail, and [open an issue](https://github.com/NeuralSeam/neural-seam-claude/issues) with it |
| Nothing happens on session start | The plugin is loaded but the binary is missing | `neural-seam version` |
| `/neural-seam:ns-status` says you are not signed in | Session expired, or replaced by a newer sign in | `neural-seam login` |
| Bound the project and the manifest landed in the wrong folder | You bound before reopening the session inside the cloned subdirectory | Reopen the session in the cloned folder, then bind again |
| Two session messages, or the server listed twice | A project still carries per-project wiring from before the plugin | `neural-seam connect` again; it removes what it wrote |
| Commands appear but are stale after an update | The session is still running the version it loaded at launch | `/reload-plugins` |
| Anything else | | `/neural-seam:ns-doctor` |

## Compatibility

The versions this plugin has actually been run against are listed in
[COMPATIBILITY.md](./COMPATIBILITY.md), along with the two host behaviours it depends on.

A combination that is not listed there has not been tested. Host behaviour is re-measured against each
release rather than inherited, so we would rather tell you we have not looked than imply a guarantee
we have not earned.

## Verifying a release

Release tags are signed with SSH. To check one yourself:

```sh
git clone https://github.com/NeuralSeam/neural-seam-claude
cd neural-seam-claude
git verify-tag <tag>
```

The public key, the fingerprint, and the line to paste into an allowed-signers file are published
under [Release signing](./SECURITY.md#release-signing).

## What we commit to

- Neural Seam never authenticates to a model provider, and holds no model provider credentials.
- Every model call is started by you. Nothing here submits work on its own.
- Signing in uses Neural Seam credentials, never your host or model provider account.
- This is an explicit extension. It does not imitate the official client, does not bundle the
  `neural-seam` binary, and does not replace signing in or binding a project.
- Telemetry is opt in with a declared scope, and off by default.

## Contributing, support and security

- Questions and bugs: [SUPPORT.md](./SUPPORT.md)
- Changes, and how this plugin is kept thin: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Vulnerability reports: [SECURITY.md](./SECURITY.md), please do not open a public issue
- Data handling: [PRIVACY.md](./PRIVACY.md)
- Name and logo: [TRADEMARKS.md](./TRADEMARKS.md)
- Release history: [CHANGELOG.md](./CHANGELOG.md)
- Tested versions: [COMPATIBILITY.md](./COMPATIBILITY.md)

## License

MIT, see [LICENSE](./LICENSE). The license covers the content of this repository. It does not grant
rights to the Neural Seam name or logo, see [TRADEMARKS.md](./TRADEMARKS.md).

Should the license ever change, **any version already published under MIT stays under MIT**. A licence
cannot be retracted from a release that was made under it, and we are stating that plainly rather than
leaving you to reason about it: what you already have, you keep, on the terms you received it.

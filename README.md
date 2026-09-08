# Neural Seam for Claude Code

The official **Neural Seam** plugin for **Claude Code**.

It connects Claude Code to Neural Seam so that your project's spec, backlog, cards and per-path
conventions are available to the agent while you work, and it adds 11 `/neural-seam:ns-*` commands
that take you from signing in to implementing a card.

> **Neural Seam does not provide a model and does not run inference.** It coordinates the work. The
> model you talk to is the one your Claude Code is already configured to use, billed by whoever
> provides it. Neural Seam never authenticates to a model provider on your behalf.

**This repository is the Claude Code integration only, and it is MIT licensed.** The `neural-seam`
runtime is a separate commercial product under [its own licence](https://github.com/NeuralSeam/neural-seam-releases/blob/main/LICENSE.md), distributed as
binaries and installers from
[neural-seam-releases](https://github.com/NeuralSeam/neural-seam-releases#readme). The plugin needs
that binary on your `PATH`; it does not contain it, install it, or replace it.

- **Product:** <https://neuralseam.cloud>
- **App:** <https://app.neuralseam.cloud>
- **Runtime:** [download and install](https://github.com/NeuralSeam/neural-seam-releases#readme) ·
  [user manual](https://github.com/NeuralSeam/neural-seam-releases/blob/main/USER-MANUAL.md) · [privacy](https://github.com/NeuralSeam/neural-seam-releases/blob/main/PRIVACY.md) · [licence](https://github.com/NeuralSeam/neural-seam-releases/blob/main/LICENSE.md)
- **Portuguese:** [README.pt-BR.md](./README.pt-BR.md) (short guide; this file is canonical)

## What it does

- **Gets you set up.** `/neural-seam:ns-start` reads where your project stands and walks you through
  the next step, so you do not have to know which command comes next.
- **Puts your project's own knowledge in context.** Your backlog, conventions and state are answered
  from Neural Seam, instead of the agent reconstructing all of it from the file tree every session.
- **Gives you a work loop.** Generate a backlog, list cards, pick one, and render its implementation
  prompt for you to review and run.

## What it does not do

- **It installs nothing.** Not the `neural-seam` binary, not Claude Code.
- **It does not sign you in and does not bind your project.** Those stay with the runtime.
- **It does not start work on its own.** Commands render prompts for you to review, and the ones that
  would change something [only run when you type them](#commands-that-change-things-are-never-invoked-for-you).

## Requirements

| You need | How to get it | Check |
| --- | --- | --- |
| Claude Code | Anthropic's installer | `claude --version` |
| The `neural-seam` binary on `PATH` | [Neural Seam installer](https://github.com/NeuralSeam/neural-seam-releases#download-and-install) | `neural-seam version` |
| A Neural Seam account, signed in | `neural-seam login` | `neural-seam doctor` |
| A project bound to this folder | The runtime's setup, or the local dashboard | `/neural-seam:ns-status` |

[COMPATIBILITY.md](./COMPATIBILITY.md) lists the versions this has actually been tested against.

## Install

Two steps, in this order. The install verb resolves a plugin against marketplaces you have already
registered, so the marketplace is added first.

```
/plugin marketplace add NeuralSeam/neural-seam-claude
/plugin install neural-seam@neural-seam
```

`neural-seam@neural-seam` is the plugin `neural-seam` published in the marketplace `neural-seam`.

### Making it active

The install summary tells you which of two things happened:

- **`Plugin is now active.`** Nothing else to do.
- **`Run /reload-plugins to activate.`** Run that command. If it warns that reloading would re-read
  the conversation, run `/reload-plugins --force`.

Restarting Claude Code has the same effect and is the fallback if a reload does not settle it. This
depends on your Claude Code version;
[COMPATIBILITY.md](./COMPATIBILITY.md#when-an-install-takes-effect) has the detail.

### Check the install

Open Claude Code in a project folder:

1. `/plugin` lists `neural-seam` as installed **and enabled**. A plugin that is registered but
   disabled loads nothing at all, which looks exactly like one that was never installed.
2. `/mcp` shows `neural-seam-runtime`.
3. `/neural-seam:ns-status` answers with the project state.

If the MCP server is missing, run `/neural-seam:ns-doctor`.

## First run

```
/neural-seam:ns-start
```

That is the whole answer to "what do I do now". It reads the state and moves one step: sign in,
create or pick a project, bind it, then stop. Run it again for the next step; re-running only does
what is still missing.

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

### What installing the plugin adds

Three things, and nothing else:

- the `neural-seam-runtime` MCP server, so the agent can ask Neural Seam about your project;
- the 11 commands above;
- three Claude Code lifecycle hooks, which run the `neural-seam` binary on your machine.

All of it points at the `neural-seam` binary on your `PATH`. What the hooks do is in
[SECURITY.md](./SECURITY.md#what-the-hooks-do).

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
switch it off, use `/plugin disable neural-seam@neural-seam`. Either way, run `/reload-plugins` to
apply it to the session you are in.

Uninstalling the plugin does **not** remove anything the runtime stored: your credentials and its
local files stay until you remove them. See [PRIVACY.md](./PRIVACY.md).

## Privacy and security

**The plugin collects nothing and sends nothing.** It is content and configuration: commands, a
manifest, an MCP registration and three hook declarations. There is no telemetry in it, no
credential, and no network endpoint of its own.

The `neural-seam` runtime is a separate product and does move data, under
[its own privacy documentation](https://github.com/NeuralSeam/neural-seam-releases/blob/main/PRIVACY.md). See [PRIVACY.md](./PRIVACY.md) for the boundary
between the two, and [SECURITY.md](./SECURITY.md) for what the hooks do and how to report a
vulnerability.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| No `ns-*` commands | The plugin is installed but not loaded into this session | `/reload-plugins`, then `/reload-plugins --force` if it warns; restart Claude Code if neither helps |
| Still no `ns-*` commands | The plugin is registered but **disabled** | `/plugin`, enable it, then `/reload-plugins` |
| `/mcp` does not show `neural-seam-runtime` | `neural-seam` not on `PATH`, or the plugin is disabled | `neural-seam version`; if that fails, reinstall the runtime |
| `/plugin` reports a load error | The plugin failed to load | Open the **Errors** tab in `/plugin` for the detail, and [open an issue](https://github.com/NeuralSeam/neural-seam-claude/issues) with it |
| Nothing happens on session start | The plugin is loaded but the binary is missing | `neural-seam version` |
| Commands appear but are stale after an update | The session is still running the version it loaded at launch | `/reload-plugins` |
| Not signed in, or the project is not bound | Runtime state, not plugin state | `/neural-seam:ns-doctor` |
| Anything else | | `/neural-seam:ns-doctor`, then the [runtime's user manual](https://github.com/NeuralSeam/neural-seam-releases/blob/main/USER-MANUAL.md) |

## Compatibility

The versions this plugin has actually been run against are in
[COMPATIBILITY.md](./COMPATIBILITY.md), with the host behaviours it depends on.

A combination that is not listed there has not been tested, which is a different statement from
saying it does not work.

## Verifying a release

Release tags are signed with SSH. The public key, the fingerprint, and the exact steps are in
[SECURITY.md](./SECURITY.md#release-signing).

Verifying properly needs the key in an allowed-signers file. Without one, `git verify-tag` prints
`Good "git" signature` for a signature made by **any** key and exits non-zero, which is easy to
misread as success.

## What we commit to

- Neural Seam never authenticates to a model provider, and holds no model provider credentials.
- Every model call is started by you. Nothing here submits work on its own.
- Signing in uses Neural Seam credentials, never your host or model provider account.
- This is an explicit extension. It does not imitate the official client and does not present itself
  as part of it.
- The plugin carries no telemetry.

## Support, contributing and licence

- Questions and bugs in **this plugin**: [SUPPORT.md](./SUPPORT.md)
- Anything about your account, or the `neural-seam` runtime itself: <https://app.neuralseam.cloud>
- Changes to this repository: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Vulnerability reports: [SECURITY.md](./SECURITY.md), please do not open a public issue
- Data handling: [PRIVACY.md](./PRIVACY.md)
- Name and logo: [TRADEMARKS.md](./TRADEMARKS.md)
- Release history: [CHANGELOG.md](./CHANGELOG.md)

**Licence:** MIT, see [LICENSE](./LICENSE). It covers the content of this repository, which is the
Claude Code integration. It does not cover the `neural-seam` runtime, which is a separate commercial
product under its own licence, and it grants no rights to the Neural Seam name or logo, see
[TRADEMARKS.md](./TRADEMARKS.md).

Should the licence of this repository ever change, **any version already published under MIT stays
under MIT**. A licence cannot be retracted from a release that was made under it.

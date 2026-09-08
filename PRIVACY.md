# Privacy

What the **Neural Seam plugin for Claude Code** does with your data.

This page is about the plugin, which is what this repository publishes. It is not the Neural Seam
service agreement, and it does not restate the data handling of the `neural-seam` runtime, which is a
separate product.

## The plugin

**It collects nothing, stores nothing and sends nothing.**

The plugin is content and configuration: command files, a plugin manifest, an MCP server
registration and three hook declarations. It contains **no telemetry, no analytics, no identifier, no
credential and no network endpoint of its own**. There is nothing in it that can phone home, and it
never handles or stores your credentials.

Installing it adds three things to Claude Code: the `neural-seam-runtime` MCP server, the
`/neural-seam:ns-*` commands, and three lifecycle hooks. All of them invoke the `neural-seam` binary
already on your `PATH`. The hooks are worth being explicit about, because a hook runs on its own
schedule rather than when you ask; what each one does is in
[SECURITY.md](./SECURITY.md#what-the-hooks-do).

Uninstalling the plugin removes those three things and nothing else.

## The runtime is a separate product

The `neural-seam` binary this plugin points at is a separate commercial product, distributed from
[neural-seam-releases](https://github.com/NeuralSeam/neural-seam-releases#readme). It is the software
that actually moves data: it signs you in, talks to the Neural Seam backend, and keeps local state on
your machine.

**How the runtime processes, stores and transmits data, where it keeps credentials, and how to delete
what it has stored, are governed by the runtime's own documentation**, published with it:

- [Privacy](https://github.com/NeuralSeam/neural-seam-releases/blob/main/PRIVACY.md)
- [Security](https://github.com/NeuralSeam/neural-seam-releases/blob/main/SECURITY.md)
- [Support](https://github.com/NeuralSeam/neural-seam-releases/blob/main/SUPPORT.md)
- [User manual](https://github.com/NeuralSeam/neural-seam-releases/blob/main/USER-MANUAL.md)
- [Licence](https://github.com/NeuralSeam/neural-seam-releases/blob/main/LICENSE.md)

Two points are worth stating here anyway, because people reasonably ask them of an integration:

- **Your source code is read locally.** It is not uploaded in order to answer the agent's questions
  about your project.
- **Telemetry in the runtime is opt in and off by default.** Turning it off does not make the runtime
  offline: signing in and your project's coordination data are what the product exchanges in order to
  work at all.

## What your agent sends

Easy to miss, so it is stated plainly: this plugin connects Neural Seam to an agent, and **that agent
has its own privacy behaviour**. Your prompts, and whatever context Claude Code gathers, go to
Anthropic under their terms, through the Claude Code you are already using. Neural Seam is not in
that path and cannot see it.

## Deleting your data

| What | How |
| --- | --- |
| The plugin | `/plugin uninstall neural-seam@neural-seam` in Claude Code. Removes the commands, hooks and MCP registration. |
| Anything the runtime stored on your machine, including credentials | Follow [the runtime's privacy documentation](https://github.com/NeuralSeam/neural-seam-releases/blob/main/PRIVACY.md). Uninstalling the plugin does not touch it. |
| Your account and the project data held by the service | Not on your machine. Use the support form at <https://app.neuralseam.cloud>. |

## Changes

Material changes to this page are noted in [CHANGELOG.md](./CHANGELOG.md). Questions:
<https://app.neuralseam.cloud>.

# Support

## Before opening anything

Most problems with this plugin are one of five things. [The troubleshooting table in the
README](./README.md#troubleshooting) covers them, and this order resolves them fastest:

1. `/plugin` shows `neural-seam` as installed **and enabled**.
2. You ran `/reload-plugins` after installing or enabling it, or restarted Claude Code.
3. `neural-seam version` answers, so the binary is on your `PATH`.
4. `/mcp` shows `neural-seam-runtime`.
5. `/neural-seam:ns-doctor`.

## Where to go

| What you have | Where it goes |
| --- | --- |
| A bug in this plugin: wrong command, broken instruction, wrong or outdated documentation | [Open an issue](https://github.com/NeuralSeam/neural-seam-claude/issues) on this repository |
| An idea for this plugin | [Open an issue](https://github.com/NeuralSeam/neural-seam-claude/issues) using the feature request template |
| A security vulnerability | [SECURITY.md](./SECURITY.md). **Not** a public issue |
| A question about your account, plan, projects or data | The support form at <https://app.neuralseam.cloud> |
| A problem in the `neural-seam` runtime, the backend or the web app | The support form at <https://app.neuralseam.cloud> |
| A problem in Claude Code itself | Anthropic's own channels |

Issues on this repository are read by the maintainers of the plugin. They are not an account support
channel, and they are public: do not paste tokens, project identifiers you consider private, or source
code you cannot share.

## What to include in an issue

The versions are what we ask for first, every time, so it saves a round trip to include them:

```
claude --version
neural-seam version
```

plus this plugin's version (`/plugin`, or the latest entry in [CHANGELOG.md](./CHANGELOG.md)) and your
operating system. [COMPATIBILITY.md](./COMPATIBILITY.md) lists the combinations that were actually
tested, which is often enough to explain the difference on its own.

Then: what you ran, what happened, and what you expected. If a command misbehaved, name it and quote
the exact text you typed, including the `/neural-seam:` namespace.

## Response expectations

This is a young project. Issues are triaged on a best effort basis, and there is no support SLA on
this repository. Security reports are the exception and have stated targets in
[SECURITY.md](./SECURITY.md).

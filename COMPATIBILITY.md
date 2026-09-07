# Compatibility

What this plugin was actually run against, and what follows from that.

A row in the table below is a record of a test that happened, on the versions named, on the date
named. It is **not** a supported range. A version that is not listed has not been tested, which is a
different statement from "does not work": host behaviour is re-measured against each release rather
than inherited, so we would rather say we have not looked than imply a guarantee we have not earned.

## Tested combinations

| Plugin | Claude Code | `neural-seam` runtime | Operating system | Tested on |
| --- | --- | --- | --- | --- |
| 0.5.2 | 2.1.263 | 0.11.0 (development build) | Windows 11 | 2026-09-07 |
| 0.5.1 | 2.1.263 | not revalidated | Windows 11 | 2026-09-07 |

> [!IMPORTANT]
> **The runtime row for 0.5.2 is not a published release.** The runtime available on the machine that
> ran these tests was a development build of the 0.11.0 line, while the published runtime line has
> moved on. The wiring the plugin owns was exercised and works: the MCP server starts under
> `neural-seam serve --project-from-cwd`, and the hook commands resolve. What was **not** revalidated
> is the end-to-end behaviour of the commands against a **published** runtime.
>
> **Before publishing the next release, a maintainer must run the command walkthrough in
> [CONTRIBUTING.md](./CONTRIBUTING.md#before-a-release) against a published runtime and replace this
> note with the version they used.**

### How to read the columns

| Column | What it means |
| --- | --- |
| Plugin | The version in `.claude-plugin/plugin.json` at the time of the test. |
| Claude Code | The output of `claude --version`. Nothing older or newer is claimed. |
| Runtime | The output of `neural-seam version`. A development build is labelled as one. |
| Operating system | Where it ran. |
| Tested on | The date the checks were run. |

### What has not been tested

Stated so it is not mistaken for silence:

- **macOS and Linux.** Nothing in the plugin is platform specific: it names the `neural-seam` binary
  and lets the host resolve it from `PATH`, and no path in it is Windows shaped. That is a reason to
  expect it to work, not evidence that it does.
- **Claude Code older than 2.1.263.** See the note on install activation below, which describes a
  behaviour that is known to have changed in 2.1.221.
- **Every published runtime release.** See the note above.

## Minimum known versions

| Requirement | Version | Why |
| --- | --- | --- |
| Claude Code | 2.1.221 | Below it, an install never takes effect in the session that performed it; you have to reload or restart. The plugin still works, but the installation instructions in the README do not describe what you will see. |
| Claude Code | 2.1.232 | Only relevant if you add the marketplace by a full URL rather than by `owner/repo`; URL handling changed here. |

These come from Anthropic's own documentation rather than from our testing, and they are minimums for
the *instructions* to match reality, not thresholds where the plugin starts working.

## Host behaviour this plugin depends on

Two things about Claude Code shape how the plugin is built. Both were measured, and both are stated
with the version they were measured on so that a future reader can tell a fact from an assumption.

### When an install takes effect

Measured on **2.1.263**, and consistent with Anthropic's documentation: installing from the `/plugin`
interface tells you which of two things happened.

- `Plugin is now active.` The plugin is loaded and there is nothing else to do.
- `Run /reload-plugins to activate.` It is installed but not yet loaded. Run that command. If it
  warns that reloading would re-read the conversation, run `/reload-plugins --force`.

Restarting Claude Code also works and is the fallback when a reload does not settle it.

The `claude plugin install` **shell** command is different: it does not run inside a session, so what
it installs loads on the next start, or when you run `/reload-plugins` in a session that is already
open.

Documentation states that before **2.1.221** no install took effect in the session that performed it.
Earlier versions of this plugin's README said a restart was always required, which was true then and
is not true now.

### The hooks path is loaded by the host, not declared

The plugin ships `hooks/hooks.json` at the conventional path and **deliberately does not name it** in
`.claude-plugin/plugin.json`.

Measured on **2.1.263**: declaring `"hooks": "./hooks/hooks.json"` in the manifest makes the host
load that file in addition to loading it from the conventional path, and it treats that as fatal for
the **whole plugin** rather than for the hooks alone. The result is an install that succeeds and then
reports `failed to load - Duplicate hooks file detected`, with no commands and no MCP server. That
shipped once, as 0.5.2's predecessor 0.5.0, and was replaced the same day.

Two things make this worth writing down rather than treating as a one-off mistake:

1. **The rule is not uniform across manifest fields.** `commands` and `mcpServers` are meant to be
   declared, and declaring them is what makes `claude plugin validate` walk the content behind them.
   Only the hooks path behaves this way.
2. **Every cheap check passed.** `claude plugin validate --strict` passed on both the marketplace and
   the manifest, loading the directory with `--plugin-dir` worked, and `claude plugin details`
   printed the full inventory: 11 commands, 3 hooks, 1 MCP server. `claude plugin details` renders a
   broken plugin exactly like a working one. Only `claude plugin list` reports the load error, and
   `claude plugin list --json` gives the full text that the table truncates.

`scripts/check-bundle.mjs` now fails if that field is ever declared again, and
`scripts/check-bundle.test.mjs` proves the rule by re-introducing it in a temporary copy and checking
that the gate rejects it. Installing for real, into a throwaway configuration directory, is a
mandatory pre-release step for the same reason.

## Reporting a combination that does not work

Open an issue with the output of `claude --version` and `neural-seam version`, your operating system,
and this plugin's version. See [SUPPORT.md](./SUPPORT.md).

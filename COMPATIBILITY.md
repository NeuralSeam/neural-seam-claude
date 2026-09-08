# Compatibility

What this plugin was actually run against, and what follows from that.

Each row below records a test that happened, on the versions named, on the date named. It is **not**
a supported range. A combination that is absent has **not been tested**, which is a different
statement from saying it is incompatible: we would rather tell you we have not looked than imply a
guarantee we have not earned.

## Tested combinations

| Plugin | Claude Code | `neural-seam` runtime | Operating system | Tested on |
| --- | --- | --- | --- | --- |
| 0.5.3 | 2.1.263 | not revalidated | Windows 11 | 2026-09-08 |
| 0.5.2 | 2.1.263 | 0.11.0 (development build) | Windows 11 | 2026-09-07 |

> [!IMPORTANT]
> **No row above records a published runtime.** The runtime available when these checks ran was a
> development build, and the plugin has not been revalidated against a published release since.
>
> What was exercised is the part the plugin owns: the MCP server starts under
> `neural-seam serve --project-from-cwd`, the hook commands resolve, and the plugin installs and
> loads. What was **not** exercised is the end-to-end behaviour of the commands against a published
> runtime.
>
> **Before the next release, this must be run against a published runtime and this note replaced with
> the version used.** The procedure is in
> [CONTRIBUTING.md](./CONTRIBUTING.md#before-a-release).

### How to read the columns

| Column | What it means |
| --- | --- |
| Plugin | The version in `.claude-plugin/plugin.json` at the time of the test. |
| Claude Code | The output of `claude --version`. Nothing older or newer is claimed. |
| Runtime | The output of `neural-seam version`. A development build is labelled as one. |
| Operating system | Where it ran. |
| Tested on | The date the checks were run. |

### Not tested

- **macOS and Linux.** Nothing in the plugin is platform specific: it names the `neural-seam` binary
  and lets the host resolve it from `PATH`, and no path in it is Windows shaped. That is a reason to
  expect it to work, not evidence that it does.
- **Claude Code older than 2.1.263.** See the minimums below.

Nothing here is known to be **incompatible**. If you find a combination that does not work, please
[open an issue](https://github.com/NeuralSeam/neural-seam-claude/issues); see
[SUPPORT.md](./SUPPORT.md).

## Minimum versions

| Requirement | Version | Why |
| --- | --- | --- |
| Claude Code | 2.1.221 | Below it, an install never takes effect in the session that performed it. The plugin still works, but the installation instructions in the README will not match what you see. |
| Claude Code | 2.1.232 | Only if you add the marketplace by a full URL rather than by `owner/repo`; URL handling changed here. |

These come from Anthropic's documentation, not from our testing. They are the point at which the
*instructions* match reality, not a threshold where the plugin starts working.

## Known limitations of Claude Code

Two host behaviours shape how the plugin is built and how you install it.

### When an install takes effect

Measured on **2.1.263**, and consistent with Anthropic's documentation: installing from the `/plugin`
interface tells you which of two things happened.

- `Plugin is now active.` The plugin is loaded and there is nothing else to do.
- `Run /reload-plugins to activate.` It is installed but not yet loaded. Run that command; if it
  warns that reloading would re-read the conversation, run `/reload-plugins --force`.

Restarting Claude Code also works, and is the fallback when a reload does not settle it.

The `claude plugin install` **shell** command is different: it does not run inside a session, so what
it installs loads on the next start, or when you run `/reload-plugins` in a session already open.

### The hooks file must not be declared in the manifest

Claude Code loads a plugin's hooks from the conventional path `hooks/hooks.json` on its own.
Measured on **2.1.263**: naming that same path in the manifest as well loads it twice, and the host
treats that as fatal for the **whole plugin**, not just for the hooks. The plugin installs and then
reports `failed to load`, with no commands and no MCP server.

The rule is not uniform across manifest fields, which is what makes it a trap: `commands` and
`mcpServers` are meant to be declared. Only the hooks path behaves this way.

This plugin therefore ships `hooks/hooks.json` at the conventional path and does not name it in the
manifest. `scripts/check-bundle.mjs` fails if it is ever declared again, and
`scripts/check-bundle.test.mjs` proves that rule by re-introducing it in a temporary copy.

**This is also why installing for real is a required pre-release step.** The static validators pass
on a plugin in this state, and `claude plugin details` prints its full inventory; only
`claude plugin list` reports the load error.

## Reporting a combination that does not work

Open an issue with the output of `claude --version` and `neural-seam version`, your operating system,
and this plugin's version. See [SUPPORT.md](./SUPPORT.md).

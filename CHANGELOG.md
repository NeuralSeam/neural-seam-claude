# Changelog

Notable changes to the Neural Seam plugin for Claude Code. Format based on
[Keep a Changelog](https://keepachangelog.com/); independent SemVer.

Entries are newest first, and record what a user of the plugin can notice: new behaviour, fixes,
compatibility changes, security changes, and anything you have to do by hand when upgrading.

## [0.5.2] - 2026-09-07

Nothing about how the plugin is wired changed in this release. What changed is what it lets a model
do on its own, what the documentation promises, and how much of it is true.

### Security

- **Commands that change something are no longer invoked for you.** `ns-clone`, `ns-connect`,
  `ns-doctor`, `ns-exec`, `ns-generate` and `ns-start` now declare
  `disable-model-invocation: true`, so they run when you type them and not because a model judged
  one relevant to the conversation. That covers every command that writes a binding, fetches code,
  repairs your environment, generates a backlog or starts implementation work.

  The five read-only commands (`ns-status`, `ns-list`, `ns-open`, `ns-create`, `ns-help`) are
  unchanged and stay available to the model, because the worst case for one of those is a wasted
  call. Nothing you could do before you cannot do now: type the command and it runs.

### Fixed

- **The install and reload instructions were wrong.** Everything here said a plugin only takes
  effect in the next session and that you have to restart Claude Code. Current versions can activate
  a plugin during the install, and `/reload-plugins` applies a change to the session you are in.
  The README, the Portuguese guide, the support page, the bug report template and
  `/neural-seam:ns-doctor` now describe what you will actually see, with restarting as the fallback
  rather than the instruction.
- **Compatibility no longer claims more than was tested.** The previous release said the plugin
  worked with "any published release" of the `neural-seam` runtime, which nobody had verified. The
  tested combinations are now listed in [COMPATIBILITY.md](./COMPATIBILITY.md), and anything absent
  from it is stated as untested rather than implied to work.
- **A limitation was described as something the host cannot do.** The per-path conventions advisory
  is not included in this release and is handled by the runtime per project. That is the state of
  this release, not a limit of Claude Code, and the README now says so.
- **The documentation said this repository contains only markdown and JSON.** That is true of what
  the plugin installs. The repository also contains the checks that gate it and the workflows that
  run them, which is now stated wherever the claim appeared.

### Added

- [COMPATIBILITY.md](./COMPATIBILITY.md): the versions this has been run against, the two host
  behaviours the plugin depends on, and the minimum versions for the instructions to match reality.
- `scripts/check-bundle.test.mjs`: every rule in the checker is now proved by breaking it in a
  temporary copy of the repository and confirming the checker rejects it.
- A CodeQL workflow covering the checks and the workflows themselves.
- The checker gained rules for invocation control, the MCP server's arguments, and the line ending
  policy. Workflow actions are pinned by commit rather than by tag.

### Changed

- The README is reorganised around using the plugin: prerequisites, install, update, uninstall,
  commands, what it wires, privacy, troubleshooting and compatibility.
- [README.pt-BR.md](./README.pt-BR.md) is rewritten in proper Brazilian Portuguese, with the
  accents it was missing, and now covers installing, checking, updating and removing the plugin
  without needing the English text.

## [0.5.1] - 2026-09-07

### Fixed

- **0.5.0 installed and then failed to load. Update to this version.** `/plugin` reported
  `failed to load - Duplicate hooks file detected`, and no commands or MCP server appeared. The cause
  and the check that now prevents it are in
  [COMPATIBILITY.md](./COMPATIBILITY.md#the-hooks-path-is-loaded-by-the-host-not-declared).

  The hooks themselves never changed and still load, from the same file, at the same events.

## [0.5.0] - 2026-09-06

The repository is now written for someone outside the team, and the commands stopped keeping their own
copy of the product's flow.

### Changed

- **All 11 commands rewritten in English, as thin wrappers over the runtime.** Each one now presents
  the state, the message and the URL the runtime returns, instead of deciding from a table of states
  kept in the command file. A state the file has never seen is handled like any other, so the plugin no
  longer has to be released for the runtime to teach you a new step.
- **Documentation is now in English**, with [README.pt-BR.md](./README.pt-BR.md) as a short Portuguese
  guide. The README starts from what the product does rather than from how the plugin is wired, and the
  wiring detail that remains is written for someone deciding whether to install it.
- `.claude-plugin/plugin.json` declares its content paths explicitly, and both manifests carry a
  description written for the plugin catalog.

### Fixed

- **No hardcoded addresses.** Three commands printed an example dashboard URL with a fixed port. The
  runtime picks its port at startup, so the example was wrong as often as it was right, and a developer
  who trusted it went to a page that was not there. The commands now show only the URL the runtime
  returned, and a check in CI fails if one is ever written back in.
- **No card lookup by literal title.** `ns-start` searched the board for a card whose title matched an
  exact string. The title belongs to the project and its owner can rewrite it at any time, so the
  search silently stopped matching. A card is addressed by the identifier the runtime returns.
- `ns-generate` no longer points at a runbook that is not published.

### Added

- Governance the repository was missing: [SECURITY.md](./SECURITY.md) (including what each lifecycle
  hook actually does), [PRIVACY.md](./PRIVACY.md), [SUPPORT.md](./SUPPORT.md),
  [CONTRIBUTING.md](./CONTRIBUTING.md), [TRADEMARKS.md](./TRADEMARKS.md), issue and pull request
  templates, and code owners.
- `scripts/check-bundle.mjs`, run by CI on every pull request: manifest fields, version agreement
  across both manifests and this changelog, command frontmatter, hardcoded addresses, card lookups by
  title, other hosts' command surfaces, credentials, broken links and anchors, and encoding.

## [0.4.0] - 2026-09-02

Closes the first-run hole where a developer bound a project in the wrong folder.

### Added

- `ns-start` handles the case where the project exists in Neural Seam but this folder is not its
  repository: it offers the clone first, with the identifier coming from the runtime.
- After a clone, the code lands in a subdirectory, and the session has to be reopened **inside** it
  before binding. Otherwise the manifest is written next to the code instead of with it. The runtime
  now refuses that case, and the guided command explains the way round it.

### Changed

- `ns-status` reports the same new state and points at the clone.

## [0.3.1] - 2026-07-24

### Changed

- README: recorded the decided direction for the per-path conventions advisory, rather than only
  noting that it does not fire when the plugin is installed. No behaviour change.

### Notes

- **Correction to the 0.2.0 notes.** The claim that the runtime's per-project setup was being retired
  did not hold: it remains the permanent fallback, because the runtime does not depend on this plugin.
  What actually changed is that the runtime now chooses between the two modes and cleans up the
  leftovers of the one it is not using.

## [0.3.0] - 2026-07-24

Makes the plugin the single source of host wiring when it is installed.

### Changed

- **Breaking, for installation:** the marketplace is now called `neural-seam` (it was `neuralseam`), so
  the install reference is `/plugin install neural-seam@neural-seam`. That is the reference the runtime
  already printed; before this, the suggested install pointed at a marketplace that did not exist. If
  you added the old catalog, run `/plugin marketplace update`, or add the marketplace again.
- With the plugin installed, `neural-seam connect` no longer writes the MCP registration, the hooks or
  the commands into each project, and removes what an earlier run left. Without the plugin it writes
  them as before. `--host-wiring plugin|local|auto` lets you decide instead of being detected, and any
  uncertainty falls back to writing the files.

### Added

- README: what the plugin does and does not carry, and the known limit that the per-path conventions
  advisory has no global equivalent, so it does not fire when the plugin is installed.

## [0.2.0] - 2026-07-02

Redesign of the command surface: one guided command, one read-only compass, and individual commands.

### Added

- `ns-create`, `ns-connect`, `ns-clone`, `ns-generate`, `ns-list`, `ns-open`, `ns-exec`, `ns-help`.

### Changed

- `ns-check` renamed to `ns-status`.
- `ns-start` became a thin guided engine that advances one step and hands off, instead of doing the
  backlog generation itself.

### Removed

- `ns-sync`, which welded binding and cloning into one step. Use `ns-connect` and `ns-clone`, or let
  `ns-start` sequence them.

## [0.1.0] - 2026-07-01

First release of the Claude Code plugin.

### Added

- Plugin and marketplace manifests, the global MCP registration for `neural-seam-runtime`, the
  `SessionStart` / `PreToolUse` / `Stop` lifecycle hooks, and the commands `ns-check`, `ns-doctor`,
  `ns-sync` and `ns-start`.
